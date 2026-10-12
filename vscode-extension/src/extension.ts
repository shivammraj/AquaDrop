import * as vscode from 'vscode'

const STATE_KEY = 'aquadrop.state'

interface AquaDropState {
  enabled: boolean
  nextReminder: number | null
  intervalMinutes: number
  snoozeMinutes: number
  trackHydration: boolean
  lastDrinkAt: number | null
  loggedDrinks: number
}

const defaultState: AquaDropState = {
  enabled: false,
  nextReminder: null,
  intervalMinutes: 30,
  snoozeMinutes: 10,
  trackHydration: true,
  lastDrinkAt: null,
  loggedDrinks: 0
}

export function activate(context: vscode.ExtensionContext) {
  const state = loadState(context)

  let statusBarItem: vscode.StatusBarItem | undefined
  let intervalTimer: NodeJS.Timeout | undefined

  const updateStatusBar = () => {
    const next = state.nextReminder
    const label = state.enabled && next
      ? `💧 AquaDrop · ${formatCountdown(next)}`
      : '💧 AquaDrop · Paused'

    if (!statusBarItem) {
      statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
      statusBarItem.command = 'aquadrop.showMenu'
      context.subscriptions.push(statusBarItem)
    }

    statusBarItem.text = label
    statusBarItem.tooltip = state.enabled && next
      ? `AquaDrop: Next reminder at ${new Date(next).toLocaleTimeString()}.\nClick for quick actions.`
      : 'AquaDrop reminders are paused.\nClick to resume or configure.'
    statusBarItem.show()
  }

  const persistState = () => {
    context.globalState.update(STATE_KEY, state)
  }

  const scheduleNext = () => {
    if (intervalTimer) {
      clearTimeout(intervalTimer)
      intervalTimer = undefined
    }

    if (!state.enabled || !state.nextReminder) {
      updateStatusBar()
      return
    }

    const ms = state.nextReminder - Date.now()
    if (ms <= 0) {
      triggerReminder()
      return
    }

    intervalTimer = setTimeout(() => triggerReminder(), ms)
    updateStatusBar()
  }

  const triggerReminder = () => {
    if (!state.enabled) {
      return
    }

    const now = Date.now()
    state.nextReminder = now + state.intervalMinutes * 60 * 1000
    persistState()

    vscode.window.showInformationMessage(
      'Drink water, stay hydrated. It\'s time for a water break! 💙',
      'I\'ve drunk water',
      'Remind me later'
    ).then((selection) => {
      if (selection === 'I\'ve drunk water') {
        handleDrinkLogged()
      } else if (selection === 'Remind me later') {
        handleSnooze()
      }
    })

    scheduleNext()
  }

  const handleDrinkLogged = () => {
    if (state.trackHydration) {
      state.loggedDrinks = (state.loggedDrinks || 0) + 1
      state.lastDrinkAt = Date.now()
    }

    state.nextReminder = Date.now() + state.intervalMinutes * 60 * 1000
    persistState()
    scheduleNext()
    vscode.window.showInformationMessage(`Great! Water logged 💧 (${state.loggedDrinks} today)`)
  }

  const handleSnooze = (minutes?: number) => {
    const mins = minutes || state.snoozeMinutes || 10
    state.nextReminder = Date.now() + mins * 60 * 1000
    persistState()
    scheduleNext()
    vscode.window.showInformationMessage(`AquaDrop: Snoozed for ${mins} minutes.`)
  }

  const startReminder = () => {
    state.enabled = true
    state.nextReminder = Date.now() + state.intervalMinutes * 60 * 1000
    persistState()
    scheduleNext()
    vscode.window.showInformationMessage(`AquaDrop: Started (${state.intervalMinutes}m interval).`)
  }

  const pauseReminder = () => {
    state.enabled = false
    state.nextReminder = null
    persistState()
    if (intervalTimer) {
      clearTimeout(intervalTimer)
      intervalTimer = undefined
    }
    updateStatusBar()
    vscode.window.showInformationMessage('AquaDrop: Reminders paused.')
  }

  const changeInterval = async () => {
    const choices = [
      { label: '15 minutes', value: 15 },
      { label: '30 minutes', value: 30 },
      { label: '45 minutes', value: 45 },
      { label: '1 hour (60 minutes)', value: 60 },
      { label: '2 hours (120 minutes)', value: 120 },
      { label: 'Custom duration...', value: -1 }
    ]

    const selected = await vscode.window.showQuickPick(choices, {
      placeHolder: 'Select a reminder interval for AquaDrop'
    })

    if (!selected) return

    let minutes = selected.value
    if (minutes === -1) {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter reminder interval in minutes (1 - 1440)',
        value: String(state.intervalMinutes)
      })
      if (!input) return
      const parsed = parseInt(input.trim(), 10)
      if (isNaN(parsed) || parsed <= 0 || parsed > 1440) {
        vscode.window.showErrorMessage('Please enter a valid number of minutes between 1 and 1440.')
        return
      }
      minutes = parsed
    }

    state.intervalMinutes = minutes
    if (state.enabled) {
      state.nextReminder = Date.now() + minutes * 60 * 1000
    }
    persistState()

    const config = vscode.workspace.getConfiguration('aquadrop')
    await config.update('intervalMinutes', minutes, vscode.ConfigurationTarget.Global)

    scheduleNext()
    vscode.window.showInformationMessage(`AquaDrop: Reminder interval set to ${minutes} minutes.`)
  }

  const showQuickMenu = async () => {
    const items = [
      {
        label: '$(heart) Log Water Intake',
        description: `Logged today: ${state.loggedDrinks || 0}`,
        action: handleDrinkLogged
      },
      state.enabled
        ? { label: '$(debug-pause) Pause Reminders', description: 'Stop recurring reminder notifications', action: pauseReminder }
        : { label: '$(play) Start Reminders', description: `Resume reminders every ${state.intervalMinutes}m`, action: startReminder },
      {
        label: '$(clock) Remind Me Later',
        description: `Snooze next reminder for ${state.snoozeMinutes} minutes`,
        action: () => handleSnooze()
      },
      {
        label: '$(history) Change Interval',
        description: `Current: ${state.intervalMinutes} minutes`,
        action: changeInterval
      },
      {
        label: '$(gear) Open Settings',
        description: 'Configure preferences in VS Code settings',
        action: () => vscode.commands.executeCommand('workbench.action.openSettings', 'aquadrop')
      }
    ]

    const choice = await vscode.window.showQuickPick(items, {
      placeHolder: `AquaDrop: ${state.enabled ? 'Active' : 'Paused'} · Next: ${state.nextReminder ? formatCountdown(state.nextReminder) : 'None'}`
    })

    if (choice) {
      choice.action()
    }
  }

  const openSettings = () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'aquadrop')
  }

  const registerCommand = (command: string, handler: () => void) => {
    const disposable = vscode.commands.registerCommand(command, handler)
    context.subscriptions.push(disposable)
  }

  registerCommand('aquadrop.startReminders', startReminder)
  registerCommand('aquadrop.pauseReminders', pauseReminder)
  registerCommand('aquadrop.logWater', handleDrinkLogged)
  registerCommand('aquadrop.changeInterval', changeInterval)
  registerCommand('aquadrop.openSettings', openSettings)
  registerCommand('aquadrop.showMenu', showQuickMenu)

  // Listen to VS Code setting changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('aquadrop')) {
        const config = vscode.workspace.getConfiguration('aquadrop')
        state.intervalMinutes = config.get<number>('intervalMinutes', state.intervalMinutes)
        state.snoozeMinutes = config.get<number>('snoozeMinutes', state.snoozeMinutes)
        state.trackHydration = config.get<boolean>('trackHydration', state.trackHydration)
        persistState()
        if (state.enabled) {
          scheduleNext()
        } else {
          updateStatusBar()
        }
      }
    })
  )

  const config = vscode.workspace.getConfiguration('aquadrop')
  state.intervalMinutes = config.get<number>('intervalMinutes', state.intervalMinutes)
  state.snoozeMinutes = config.get<number>('snoozeMinutes', state.snoozeMinutes)
  state.trackHydration = config.get<boolean>('trackHydration', state.trackHydration)

  if (config.get<boolean>('enabledByDefault', false) || state.enabled) {
    if (!state.nextReminder) {
      state.nextReminder = Date.now() + state.intervalMinutes * 60 * 1000
    }
    state.enabled = true
    scheduleNext()
  } else {
    updateStatusBar()
  }

  // Live status bar countdown ticker with seconds (refresh every 1s when active)
  const ticker = setInterval(() => {
    if (state.enabled && state.nextReminder) {
      updateStatusBar()
    }
  }, 1000)

  context.subscriptions.push({
    dispose: () => {
      clearInterval(ticker)
      if (intervalTimer) {
        clearTimeout(intervalTimer)
      }
    }
  })
}

export function deactivate() {}

function loadState(context: vscode.ExtensionContext): AquaDropState {
  const saved = context.globalState.get<AquaDropState>(STATE_KEY)
  if (!saved) {
    return { ...defaultState }
  }

  return {
    ...defaultState,
    ...saved,
    intervalMinutes: Math.max(1, Number(saved.intervalMinutes || defaultState.intervalMinutes)),
    snoozeMinutes: Math.max(1, Number(saved.snoozeMinutes || defaultState.snoozeMinutes)),
    loggedDrinks: Math.max(0, Number(saved.loggedDrinks || 0))
  }
}

function formatCountdown(nextReminder: number): string {
  const diffMs = Math.max(0, nextReminder - Date.now())
  if (diffMs <= 0) {
    return 'Due'
  }
  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  }
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
}
