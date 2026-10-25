import * as cp from 'child_process'
import * as vscode from 'vscode'
import { AquaDropStorage } from './storage'
import { AquaDropScheduler, ReminderDiagnostic } from './scheduler'
import { AquaDropConfigManager } from './config'
import { AquaDropSidebarProvider } from './ui/sidebarProvider'
import { AquaDropDashboardPanel } from './ui/dashboardPanel'
import { registerAquaDropCommands, executeNamedCommand } from './commands'
import { formatCountdown } from './utils'
import { VoiceType } from './types'

let activeScheduler: AquaDropScheduler | undefined
let statusBarItem: vscode.StatusBarItem | undefined
let statusTicker: NodeJS.Timeout | undefined
let outputChannel: vscode.OutputChannel | undefined

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  outputChannel = vscode.window.createOutputChannel('AquaDrop')
  context.subscriptions.push(outputChannel)
  outputChannel.appendLine(`[Lifecycle] AquaDrop activated at ${new Date().toISOString()}`)

  const storage = new AquaDropStorage(context.globalState)

  // Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBarItem.command = 'aquadrop.openDashboard'
  statusBarItem.name = 'Drink Water Hydration Status'
  context.subscriptions.push(statusBarItem)

  let sidebarProvider: AquaDropSidebarProvider | undefined

  const refreshWebviews = () => {
    if (!activeScheduler) return
    const snapshot = activeScheduler.getSnapshot()
    if (sidebarProvider) {
      sidebarProvider.syncState(snapshot)
    }
    if (AquaDropDashboardPanel.currentPanel) {
      AquaDropDashboardPanel.currentPanel.syncState(snapshot)
    }
    updateStatusBar()
  }

  // Authoritative Scheduler instance
  const scheduler = new AquaDropScheduler(storage, {
    onReminderDue: async (diagnostic: ReminderDiagnostic) => {
      const scheduledIso = new Date(diagnostic.scheduledTime).toISOString()
      const actualIso = new Date(diagnostic.actualTime).toISOString()
      outputChannel?.appendLine(
        `[Reminder Due] Scheduled: ${scheduledIso}, Actual: ${actualIso}, Drift: ${diagnostic.driftMs}ms`
      )

      if (diagnostic.driftMs > 2000) {
        outputChannel?.appendLine(
          `[Timing Notice] Reminder triggered with ${diagnostic.driftMs}ms drift. Possible causes: OS sleep/suspension, extension host throttling, or system load.`
        )
      }

      const state = scheduler.getState()
      if (!state.notificationsEnabled) {
        outputChannel?.appendLine('[Reminder Skipped] Notifications are disabled in user settings.')
        return
      }

      const isDashboardVisible = AquaDropDashboardPanel.currentPanel?.isVisible() ?? false
      const isSidebarVisible = sidebarProvider?.isVisible() ?? false

      if (isDashboardVisible || isSidebarVisible) {
        outputChannel?.appendLine(
          `[Branded Popup] Displaying AquaDrop popup in visible view(s) (Dashboard: ${isDashboardVisible}, Sidebar: ${isSidebarVisible}). Sound: ${state.soundEnabled}, Voice: ${state.voiceType}`
        )

        if (isDashboardVisible && AquaDropDashboardPanel.currentPanel) {
          AquaDropDashboardPanel.currentPanel.showReminder(state.snoozeMinutes, state.soundEnabled, state.voiceType)
        }
        if (isSidebarVisible && sidebarProvider) {
          // Play sound in sidebar only if dashboard is not already playing it to avoid duplicate audio
          sidebarProvider.showReminder(state.snoozeMinutes, state.soundEnabled && !isDashboardVisible, state.voiceType)
        }
      } else {
        outputChannel?.appendLine(
          '[Native Notification Fallback] No AquaDrop Webview is currently visible. Showing native VS Code notification.'
        )

        if (state.soundEnabled) {
          if (sidebarProvider?.hasWebview()) {
            sidebarProvider.playSound(state.voiceType)
          } else if (AquaDropDashboardPanel.currentPanel) {
            AquaDropDashboardPanel.currentPanel.playSound(state.voiceType)
          } else {
            playNativeNotificationSound(state.voiceType)
          }
        }

        const selection = await vscode.window.showInformationMessage(
          'Time for a water break 💧 Stay hydrated!',
          'Drink Water',
          `Snooze (${state.snoozeMinutes}m)`
        )

        if (selection === 'Drink Water') {
          await vscode.commands.executeCommand('aquadrop.drinkWater')
        } else if (selection && selection.startsWith('Snooze')) {
          await vscode.commands.executeCommand('aquadrop.snoozeReminder')
        }
      }
    },
    onStateChange: () => {
      refreshWebviews()
    },
    logDiagnostic: (msg: string) => {
      outputChannel?.appendLine(`[Scheduler Diagnostic] ${msg}`)
    }
  })

  activeScheduler = scheduler
  context.subscriptions.push({
    dispose: () => {
      scheduler.dispose()
    }
  })

  // Synchronize initial configuration from VS Code settings
  const initialConfig = AquaDropConfigManager.getConfig()
  await scheduler.syncConfigFromWorkspace(initialConfig)

  // Sidebar Provider
  sidebarProvider = new AquaDropSidebarProvider({
    getSnapshot: () => scheduler.getSnapshot(),
    executeCommand: async (cmd, payload) => {
      await executeNamedCommand(cmd, {
        scheduler,
        extensionUri: context.extensionUri,
        refreshWebviews
      }, payload)
    },
    updateSetting: async (key, val) => {
      await AquaDropConfigManager.updateSetting(key, val)
      await scheduler.updateSettings({ [key]: val } as any)
      refreshWebviews()
    }
  })

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AquaDropSidebarProvider.viewType,
      sidebarProvider
    )
  )

  // Register all extension commands
  registerAquaDropCommands(context, {
    scheduler,
    extensionUri: context.extensionUri,
    refreshWebviews
  })

  // Watch for configuration changes in VS Code settings
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (!event.affectsConfiguration('aquadrop')) {
        return
      }
      const updated = AquaDropConfigManager.getConfig()
      outputChannel?.appendLine('[Config] Configuration changed in VS Code settings, synchronizing scheduler.')
      await scheduler.syncConfigFromWorkspace(updated)
      refreshWebviews()
    })
  )

  // Start the scheduler
  await scheduler.start()

  // Status bar ticker and health check (updates countdown display every second)
  statusTicker = setInterval(() => {
    updateStatusBar()
    // Periodic check to catch overdue reminders if OS/host was suspended
    if (activeScheduler) {
      activeScheduler.checkDue()
    }
  }, 1000)

  context.subscriptions.push({
    dispose: () => {
      if (statusTicker) {
        clearInterval(statusTicker)
        statusTicker = undefined
      }
    }
  })

  updateStatusBar()
}

function updateStatusBar(): void {
  if (!statusBarItem || !activeScheduler) {
    return
  }

  const state = activeScheduler.getState()
  const isRunning = state.enabled && !state.paused

  if (isRunning && state.nextReminderAt) {
    const text = formatCountdown(state.nextReminderAt)
    statusBarItem.text = `💧 ${text}`
    const dateFormatted = new Date(state.nextReminderAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
    statusBarItem.tooltip = `Drink Water: Next water break at ${dateFormatted} (Click to open dashboard)`
  } else {
    statusBarItem.text = '💧 Paused'
    statusBarItem.tooltip = 'Drink Water: Reminders are paused (Click to open dashboard)'
  }

  statusBarItem.show()
}

export function deactivate(): void {
  if (statusTicker) {
    clearInterval(statusTicker)
    statusTicker = undefined
  }
  if (activeScheduler) {
    activeScheduler.dispose()
    activeScheduler = undefined
  }
  if (AquaDropDashboardPanel.currentPanel) {
    AquaDropDashboardPanel.currentPanel.dispose()
  }
}

/**
 * Plays an audible notification alert natively when no AquaDrop Webview is open.
 */
function playNativeNotificationSound(voiceType: VoiceType = 'female'): void {
  try {
    const isWindows = process.platform === 'win32'
    const isMac = process.platform === 'darwin'
    const isLinux = process.platform === 'linux'
    const text = 'Time for a water break. Drink water and stay hydrated.'

    if (isWindows) {
      const psCommand = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak('${text}'); [console]::beep(800, 180)`
      cp.spawn('powershell', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', psCommand], {
        detached: true,
        stdio: 'ignore'
      }).unref()
    } else if (isMac) {
      const voice = voiceType === 'male' ? 'Alex' : 'Samantha'
      cp.spawn('say', ['-v', voice, text], { detached: true, stdio: 'ignore' }).unref()
    } else if (isLinux) {
      cp.spawn('spd-say', [text], { detached: true, stdio: 'ignore' }).unref()
    }
  } catch {
    // Ignore audio process errors
  }
}
