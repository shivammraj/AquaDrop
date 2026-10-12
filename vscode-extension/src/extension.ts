import * as vscode from 'vscode'

const EXTENSION_ID = 'aquadrop-vscode-extension'
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
    const label = state.enabled && next ? `💧 AquaDrop · ${formatCountdown(next)}` : '💧 AquaDrop · Paused'

    if (!statusBarItem) {
      statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
      statusBarItem.command = 'aquadrop.openSettings'
      context.subscriptions.push(statusBarItem)
    }

    statusBarItem.text = label
    statusBarItem.tooltip = state.enabled && next
      ? `Next reminder: ${new Date(next).toLocaleTimeString()}`
      : 'AquaDrop reminder is paused.'
    statusBarItem.show()
  }

  const persistState = () => {
    context.globalState.update(STATE_KEY, state)
  }

  const scheduleNext = () => {
    if (intervalTimer) {
      clearTimeout(intervalTimer)
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

    vscode.window.showInformationMessage('Drink water, stay hydrated.', 'I\'ve drunk water', 'Remind me later')
      .then((selection) => {
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
      state.loggedDrinks += 1
      state.lastDrinkAt = Date.now()
    }

    state.nextReminder = Date.now() + state.intervalMinutes * 60 * 1000
    persistState()
    scheduleNext()
    vscode.window.showInformationMessage('Great! Keep it up.')
  }

  const handleSnooze = () => {
    state.nextReminder = Date.now() + state.snoozeMinutes * 60 * 1000
    persistState()
    scheduleNext()
  }

  const startReminder = () => {
    state.enabled = true
    state.nextReminder = Date.now() + state.intervalMinutes * 60 * 1000
    persistState()
    scheduleNext()
  }

  const pauseReminder = () => {
    state.enabled = false
    state.nextReminder = null
    persistState()
    if (intervalTimer) {
      clearTimeout(intervalTimer)
    }
    updateStatusBar()
  }

  const openSettings = () => {
    const config = vscode.workspace.getConfiguration('aquadrop')
    const interval = config.get<number>('intervalMinutes', 30)
    const snooze = config.get<number>('snoozeMinutes', 10)
    const enabled = config.get<boolean>('enabledByDefault', false)
    const track = config.get<boolean>('trackHydration', true)

    state.intervalMinutes = interval
    state.snoozeMinutes = snooze
    state.trackHydration = track
    state.enabled = enabled
    state.nextReminder = enabled ? Date.now() + interval * 60 * 1000 : null
    persistState()
    scheduleNext()

    vscode.window.showInformationMessage(`AquaDrop: ${state.enabled ? 'Enabled' : 'Paused'} · ${interval} min interval`)
  }

  const registerCommand = (command: string, handler: () => void) => {
    const disposable = vscode.commands.registerCommand(command, handler)
    context.subscriptions.push(disposable)
  }

  registerCommand('aquadrop.startReminders', startReminder)
  registerCommand('aquadrop.pauseReminders', pauseReminder)
  registerCommand('aquadrop.logWater', handleDrinkLogged)
  registerCommand('aquadrop.openSettings', openSettings)

  const config = vscode.workspace.getConfiguration('aquadrop')
  state.intervalMinutes = config.get<number>('intervalMinutes', state.intervalMinutes)
  state.snoozeMinutes = config.get<number>('snoozeMinutes', state.snoozeMinutes)
  state.trackHydration = config.get<boolean>('trackHydration', state.trackHydration)

  if (config.get<boolean>('enabledByDefault', false)) {
    startReminder()
  } else {
    updateStatusBar()
  }

  context.subscriptions.push({
    dispose: () => {
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
    snoozeMinutes: Math.max(1, Number(saved.snoozeMinutes || defaultState.snoozeMinutes))
  }
}

function formatCountdown(nextReminder: number): string {
  const diffMs = Math.max(0, nextReminder - Date.now())
  const totalMinutes = Math.ceil(diffMs / 60000)
  if (totalMinutes < 60) {
    return `${totalMinutes}m`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}
