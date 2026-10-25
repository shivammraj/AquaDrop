import * as vscode from 'vscode'
import { AquaDropScheduler } from './scheduler'
import { AquaDropConfigManager } from './config'
import { AquaDropDashboardPanel } from './ui/dashboardPanel'

export interface CommandContext {
  scheduler: AquaDropScheduler
  extensionUri: vscode.Uri
  refreshWebviews: () => void
}

export function registerAquaDropCommands(
  context: vscode.ExtensionContext,
  cmdCtx: CommandContext
): void {
  const { scheduler, extensionUri, refreshWebviews } = cmdCtx

  const register = (command: string, handler: (...args: any[]) => any) => {
    context.subscriptions.push(vscode.commands.registerCommand(command, handler))
  }

  // aquadrop.openDashboard
  register('aquadrop.openDashboard', () => {
    AquaDropDashboardPanel.createOrShow(extensionUri, {
      getSnapshot: () => scheduler.getSnapshot(),
      executeCommand: async (cmd, payload) => {
        await executeNamedCommand(cmd, cmdCtx, payload)
      },
      updateSetting: async (key, val) => {
        await AquaDropConfigManager.updateSetting(key, val)
        await scheduler.updateSettings({ [key]: val } as any)
      }
    })
  })

  // aquadrop.drinkWater
  register('aquadrop.drinkWater', async () => {
    await scheduler.drinkWater()
    const snapshot = scheduler.getSnapshot()
    refreshWebviews()
    void vscode.window.showInformationMessage(
      `Great! Water break logged 💧 (${snapshot.todayCount}/${snapshot.dailyGoal})`
    )
  })

  // aquadrop.snoozeReminder
  register('aquadrop.snoozeReminder', async (minutesArg?: unknown) => {
    let minutes: number | undefined
    if (typeof minutesArg === 'number' && Number.isFinite(minutesArg)) {
      minutes = minutesArg
    } else if (minutesArg && typeof (minutesArg as any).minutes === 'number') {
      minutes = (minutesArg as any).minutes
    }

    const duration = await scheduler.snooze(minutes)
    refreshWebviews()
    if (scheduler.getState().notificationsEnabled) {
      void vscode.window.showInformationMessage(`Drink Water reminder snoozed for ${duration} minutes.`)
    }
  })

  // aquadrop.pauseReminders
  register('aquadrop.pauseReminders', async () => {
    await scheduler.pause()
    refreshWebviews()
    void vscode.window.showInformationMessage('Drink Water reminders are now paused.')
  })

  // aquadrop.resumeReminders
  register('aquadrop.resumeReminders', async () => {
    await scheduler.resume()
    refreshWebviews()
    void vscode.window.showInformationMessage('Drink Water reminders resumed.')
  })

  // aquadrop.toggleReminders
  register('aquadrop.toggleReminders', async () => {
    await scheduler.toggle()
    refreshWebviews()
    const state = scheduler.getState()
    const status = state.enabled && !state.paused ? 'resumed' : 'paused'
    void vscode.window.showInformationMessage(`Drink Water reminders ${status}.`)
  })

  // aquadrop.resetDailyProgress
  register('aquadrop.resetDailyProgress', async () => {
    const confirm = await vscode.window.showWarningMessage(
      "Reset today's hydration break count to 0?",
      { modal: true },
      'Reset Progress'
    )
    if (confirm === 'Reset Progress') {
      await scheduler.resetDailyProgress()
      refreshWebviews()
      void vscode.window.showInformationMessage("Today's Drink Water progress has been reset.")
    }
  })

  // aquadrop.startReminders
  register('aquadrop.startReminders', async () => {
    await scheduler.resume()
    refreshWebviews()
    void vscode.window.showInformationMessage(
      `Drink Water reminders started at ${scheduler.getState().intervalMinutes}m interval.`
    )
  })

  // aquadrop.logWater (alias for drinkWater)
  register('aquadrop.logWater', async () => {
    await vscode.commands.executeCommand('aquadrop.drinkWater')
  })

  // aquadrop.changeInterval
  register('aquadrop.changeInterval', async () => {
    const items = [
      { label: '15 minutes', value: 15 },
      { label: '30 minutes', value: 30, description: 'Default' },
      { label: '45 minutes', value: 45 },
      { label: '60 minutes (1 hour)', value: 60 },
      { label: '90 minutes (1.5 hours)', value: 90 },
      { label: 'Custom interval...', value: -1 }
    ]

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select reminder interval',
      ignoreFocusOut: true
    })
    if (!selected) {
      return
    }

    let nextMinutes = selected.value
    if (nextMinutes === -1) {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter reminder interval in minutes (1 - 1440)',
        value: String(scheduler.getState().intervalMinutes),
        validateInput: (val) => {
          const num = Number(val)
          if (Number.isNaN(num) || num < 1 || num > 1440) {
            return 'Please enter a whole number between 1 and 1440.'
          }
          return null
        }
      })
      if (!input) {
        return
      }
      nextMinutes = Number(input)
    }

    await AquaDropConfigManager.updateSetting('intervalMinutes', nextMinutes)
    await scheduler.updateSettings({ intervalMinutes: nextMinutes })
    refreshWebviews()
    void vscode.window.showInformationMessage(`Drink Water interval set to ${nextMinutes} minutes.`)
  })

  // aquadrop.testSound
  register('aquadrop.testSound', () => {
    const voiceType = scheduler.getState().voiceType
    if (AquaDropDashboardPanel.currentPanel) {
      AquaDropDashboardPanel.currentPanel.playSound(voiceType)
    } else {
      AquaDropDashboardPanel.createOrShow(extensionUri, {
        getSnapshot: () => scheduler.getSnapshot(),
        executeCommand: async (cmd, payload) => {
          await executeNamedCommand(cmd, cmdCtx, payload)
        },
        updateSetting: async (key, val) => {
          await AquaDropConfigManager.updateSetting(key, val)
          await scheduler.updateSettings({ [key]: val } as any)
        }
      })
      setTimeout(() => {
        AquaDropDashboardPanel.currentPanel?.playSound(voiceType)
      }, 300)
    }
  })

  // aquadrop.openSettings
  register('aquadrop.openSettings', () => {
    void vscode.commands.executeCommand('workbench.action.openSettings', 'aquadrop')
  })
}

export async function executeNamedCommand(
  command: string,
  cmdCtx: CommandContext,
  payload?: unknown
): Promise<void> {
  const { scheduler, extensionUri, refreshWebviews } = cmdCtx

  switch (command) {
    case 'drinkWater':
    case 'logWater':
      await vscode.commands.executeCommand('aquadrop.drinkWater')
      break
    case 'snoozeReminder':
      await vscode.commands.executeCommand('aquadrop.snoozeReminder', payload)
      break
    case 'pauseReminders':
      await vscode.commands.executeCommand('aquadrop.pauseReminders')
      break
    case 'resumeReminders':
      await vscode.commands.executeCommand('aquadrop.resumeReminders')
      break
    case 'toggleReminders':
      await vscode.commands.executeCommand('aquadrop.toggleReminders')
      break
    case 'openDashboard':
      await vscode.commands.executeCommand('aquadrop.openDashboard')
      break
    case 'testSound':
      await vscode.commands.executeCommand('aquadrop.testSound')
      break
    case 'resetDailyProgress':
      await scheduler.resetDailyProgress()
      refreshWebviews()
      void vscode.window.showInformationMessage("Today's AquaDrop progress has been reset.")
      break
    case 'openSettings':
      await vscode.commands.executeCommand('aquadrop.openSettings')
      break
    case 'changeInterval':
      await vscode.commands.executeCommand('aquadrop.changeInterval')
      break
    default:
      break
  }
}
