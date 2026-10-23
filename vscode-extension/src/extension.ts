import * as vscode from 'vscode'

const STATE_KEY = 'aquadrop.state.v2'

type Appearance = 'system' | 'light' | 'dark'

interface AquaDropState {
  enabled: boolean
  paused: boolean
  intervalMinutes: number
  snoozeMinutes: number
  notificationsEnabled: boolean
  dailyGoal: number
  appearance: Appearance
  nextReminderAt: number | null
  lastDrinkAt: number | null
  history: Record<string, number>
}

const defaultState: AquaDropState = {
  enabled: true,
  paused: false,
  intervalMinutes: 30,
  snoozeMinutes: 5,
  notificationsEnabled: true,
  dailyGoal: 8,
  appearance: 'system',
  nextReminderAt: Date.now() + 30 * 60 * 1000,
  lastDrinkAt: null,
  history: {}
}

class AquaDropManager {
  private readonly context: vscode.ExtensionContext
  private state: AquaDropState
  private timer: NodeJS.Timeout | undefined
  private statusBarItem: vscode.StatusBarItem
  private dashboardPanel: vscode.WebviewPanel | undefined
  private readonly sidebarProvider: AquaDropSidebarProvider

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.state = this.loadState()
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
    this.statusBarItem.command = 'aquadrop.openDashboard'
    this.sidebarProvider = new AquaDropSidebarProvider(this)
    this.context.subscriptions.push(this.statusBarItem)

    this.applySettingsFromWorkspace()
    this.ensureTodayBucket()
    this.updateStatusBar()
    this.rescheduleReminder()
  }

  public initialize(): void {
    const config = vscode.workspace.getConfiguration('aquadrop')
    this.state.enabled = config.get<boolean>('remindersEnabled', this.state.enabled)
    if (!this.state.enabled) {
      this.state.paused = true
      this.state.nextReminderAt = null
    }
    this.rescheduleReminder()
    this.updateStatusBar()
    this.refreshWebviews()
  }

  public openDashboard(): void {
    if (this.dashboardPanel) {
      this.dashboardPanel.reveal(vscode.ViewColumn.One, true)
      this.updateDashboardPanel()
      return
    }

    this.dashboardPanel = vscode.window.createWebviewPanel(
      'aquadrop.dashboard',
      'AquaDrop Dashboard',
      { viewColumn: vscode.ViewColumn.One, preserveFocus: false },
      { enableScripts: true, localResourceRoots: [] }
    )

    this.dashboardPanel.onDidDispose(() => {
      this.dashboardPanel = undefined
    })

    this.dashboardPanel.webview.onDidReceiveMessage((message) => {
      if (message.type === 'command') {
        this.executeCommand(message.command)
      } else if (message.type === 'updateSetting') {
        this.updateSetting(message.key, message.value)
      }
    })

    this.updateDashboardPanel()
  }

  public refreshWebviews(): void {
    if (this.dashboardPanel) {
      this.updateDashboardPanel()
    }
    this.sidebarProvider.refresh()
  }

  public async drinkWater(): Promise<void> {
    const todayKey = getDateKey(Date.now())
    this.state.history[todayKey] = (this.state.history[todayKey] ?? 0) + 1
    this.state.lastDrinkAt = Date.now()
    this.state.enabled = true
    this.state.paused = false
    this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
    this.persistState()
    this.rescheduleReminder()
    this.refreshWebviews()
    vscode.window.showInformationMessage(`Great! Water break logged 💧 (${this.getTodayCount()}/${this.state.dailyGoal})`)
  }

  public snoozeReminder(minutes?: number): void {
    const duration = Math.max(1, Number(minutes ?? this.state.snoozeMinutes))
    this.state.enabled = true
    this.state.paused = false
    this.state.nextReminderAt = Date.now() + duration * 60 * 1000
    this.persistState()
    this.rescheduleReminder()
    this.refreshWebviews()
    if (this.state.notificationsEnabled) {
      vscode.window.showInformationMessage(`Reminder snoozed for ${duration} minutes.`)
    }
  }

  public pauseReminders(): void {
    this.state.enabled = false
    this.state.paused = true
    this.state.nextReminderAt = null
    this.persistState()
    this.clearTimer()
    this.updateStatusBar()
    this.refreshWebviews()
    vscode.window.showInformationMessage('AquaDrop reminders are paused.')
  }

  public resumeReminders(): void {
    this.state.enabled = true
    this.state.paused = false
    this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
    this.persistState()
    this.rescheduleReminder()
    this.refreshWebviews()
    vscode.window.showInformationMessage('AquaDrop reminders resumed.')
  }

  public toggleReminders(): void {
    if (this.state.paused || !this.state.enabled) {
      this.resumeReminders()
      return
    }
    this.pauseReminders()
  }

  public resetDailyProgress(): void {
    const todayKey = getDateKey(Date.now())
    this.state.history[todayKey] = 0
    this.state.lastDrinkAt = null
    this.persistState()
    this.refreshWebviews()
    vscode.window.showInformationMessage("Today's AquaDrop progress has been reset.")
  }

  public startReminders(): void {
    this.state.enabled = true
    this.state.paused = false
    this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
    this.persistState()
    this.rescheduleReminder()
    this.refreshWebviews()
    vscode.window.showInformationMessage(`AquaDrop reminder started at ${this.state.intervalMinutes} minutes.`)
  }

  public executeCommand(command: string): void {
    switch (command) {
      case 'drinkWater':
        void this.drinkWater()
        break
      case 'snoozeReminder':
        this.snoozeReminder()
        break
      case 'pauseReminders':
        this.pauseReminders()
        break
      case 'resumeReminders':
        this.resumeReminders()
        break
      case 'toggleReminders':
        this.toggleReminders()
        break
      case 'openDashboard':
        this.openDashboard()
        break
      case 'resetDailyProgress':
        this.resetDailyProgress()
        break
      case 'startReminders':
        this.startReminders()
        break
      case 'openSettings':
        void vscode.commands.executeCommand('workbench.action.openSettings', 'aquadrop')
        break
      case 'changeInterval':
        void this.changeInterval()
        break
      default:
        break
    }
  }

  public getTodayCount(): number {
    return this.state.history[getDateKey(Date.now())] ?? 0
  }

  public getRecentHistory(): Array<{ date: string; count: number }> {
    return Object.keys(this.state.history)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 7)
      .map((key) => ({ date: key, count: this.state.history[key] ?? 0 }))
  }

  public renderSidebarHtml(): string {
    const state = this.getSnapshot()
    const todayCount = (state.history as Record<string, number>)[getDateKey(Date.now())] ?? 0
    const progress = Math.min(100, Math.round((todayCount / Math.max(state.dailyGoal as number, 1)) * 100))
    const countdownText = state.nextReminderAt ? formatCountdown(state.nextReminderAt as number) : 'Paused'

    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            :root { --bg: rgba(12, 18, 30, 0.04); --panel: rgba(255, 255, 255, 0.72); --panel-border: rgba(110, 160, 255, 0.24); --text: #101828; --muted: #5c6b82; --primary: #1d9bf0; --primary-soft: rgba(29,155,240,0.14); --shadow: rgba(15, 23, 42, 0.12); }
            body { font-family: var(--vscode-font-family, sans-serif); margin: 0; color: var(--text); background: var(--bg); }
            .card { background: var(--panel); border: 1px solid var(--panel-border); border-radius: 16px; box-shadow: 0 10px 24px var(--shadow); padding: 14px 12px; margin: 10px; }
            .brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1.05rem; }
            .drop { width: 18px; height: 18px; background: linear-gradient(180deg, #7dd3fc, #1d9bf0); border-radius: 50% 50% 55% 55%; transform: rotate(-15deg); display: inline-block; position: relative; }
            .drop::after { content: ''; position: absolute; left: 5px; top: -2px; width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.45); }
            .meta { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; color: var(--muted); font-size: 12px; }
            .countdown { font-size: 1.4rem; font-weight: 700; color: var(--primary); margin-top: 8px; }
            .row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
            .mini { background: var(--primary-soft); border-radius: 12px; padding: 10px 8px; text-align: center; }
            .label { color: var(--muted); font-size: 11px; }
            .value { font-size: 1.2rem; font-weight: 700; margin-top: 4px; }
            .button-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
            button { border: none; border-radius: 10px; padding: 10px 8px; font-weight: 600; cursor: pointer; background: linear-gradient(180deg, #1d9bf0, #1877d2); color: white; }
            button.secondary { background: rgba(29,155,240,0.12); color: var(--text); border: 1px solid rgba(29,155,240,0.18); }
            .progress { width: 100%; height: 8px; background: rgba(148,163,184,0.18); border-radius: 999px; overflow: hidden; margin-top: 8px; }
            .progress > span { display: block; height: 100%; width: ${progress}%; background: linear-gradient(90deg, #7dd3fc, #1d9bf0); border-radius: inherit; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand"><span class="drop"></span> AquaDrop</div>
            <div class="meta"><span>${state.enabled && !state.paused ? 'Reminders active' : 'Reminders paused'}</span><span>${state.notificationsEnabled ? 'Notifications on' : 'Notifications off'}</span></div>
            <div class="countdown">${countdownText}</div>
            <div class="progress"><span></span></div>
            <div class="row">
              <div class="mini"><div class="label">Today</div><div class="value">${todayCount}</div></div>
              <div class="mini"><div class="label">Goal</div><div class="value">${state.dailyGoal}</div></div>
            </div>
            <div class="button-row">
              <button data-command="drinkWater">Drink Water</button>
              <button class="secondary" data-command="snoozeReminder">Snooze</button>
            </div>
            <div class="button-row">
              <button class="secondary" data-command="${state.paused || !state.enabled ? 'resumeReminders' : 'pauseReminders'}">${state.paused || !state.enabled ? 'Resume' : 'Pause'}</button>
              <button class="secondary" data-command="openDashboard">Dashboard</button>
            </div>
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            document.querySelectorAll('[data-command]').forEach((button) => {
              button.addEventListener('click', () => {
                vscode.postMessage({ type: 'command', command: button.getAttribute('data-command') });
              });
            });
          </script>
        </body>
      </html>`
  }

  public renderDashboardHtml(): string {
    const state = this.getSnapshot()
    const todayCount = (state.history as Record<string, number>)[getDateKey(Date.now())] ?? 0
    const progress = Math.min(100, Math.round((todayCount / Math.max(state.dailyGoal as number, 1)) * 100))
    const nextReminderText = state.nextReminderAt ? formatCountdown(state.nextReminderAt as number) : 'Paused'
    const recentHtml = this.getRecentHistory().length
      ? this.getRecentHistory().map((item) => `<div class="history-item"><span>${item.date}</span><strong>${item.count}</strong></div>`).join('')
      : '<div class="history-empty">No recent hydration entries yet.</div>'

    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            :root { --bg: var(--vscode-editor-background, #f4f8ff); --panel: rgba(255,255,255,0.72); --panel-alt: rgba(255,255,255,0.46); --line: rgba(148,163,184,0.24); --text: var(--vscode-editor-foreground, #112033); --muted: var(--vscode-descriptionForeground, #55677c); --primary: #1d9bf0; --primary-soft: rgba(29,155,240,0.12); --shadow: rgba(15,23,42,0.12); }
            body { margin: 0; padding: 24px; font-family: var(--vscode-font-family, sans-serif); color: var(--text); background: var(--bg); }
            .shell { max-width: 920px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .brand { display: flex; align-items: center; gap: 12px; font-size: 2rem; font-weight: 700; }
            .drop { width: 22px; height: 22px; background: linear-gradient(180deg, #93c5fd, #1d9bf0); border-radius: 50% 50% 55% 55%; transform: rotate(-20deg); display: inline-block; position: relative; }
            .drop::after { content: ''; position: absolute; left: 6px; top: -2px; width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.45); }
            .status-pill { border-radius: 999px; padding: 8px 12px; font-weight: 600; background: var(--primary-soft); color: var(--primary); }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
            .card { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 12px 24px var(--shadow); padding: 18px; }
            .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
            .value { font-size: 2rem; font-weight: 700; margin-top: 10px; }
            .accent { color: var(--primary); }
            .progress-wrap { margin-top: 8px; }
            .progress { width: 100%; height: 10px; border-radius: 999px; background: rgba(148,163,184,0.24); overflow: hidden; }
            .progress > span { display: block; width: ${progress}%; height: 100%; background: linear-gradient(90deg, #7dd3fc, #1d9bf0); border-radius: inherit; }
            .section-title { font-weight: 700; margin-bottom: 12px; }
            .settings { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
            .field { display: flex; flex-direction: column; gap: 8px; }
            label { color: var(--muted); font-size: 12px; font-weight: 600; }
            input, select, button { font: inherit; }
            input, select { border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; background: var(--panel-alt); color: var(--text); }
            .button-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
            button { border: none; border-radius: 10px; padding: 10px 16px; font-weight: 700; cursor: pointer; }
            .primary { background: linear-gradient(180deg, #1d9bf0, #1877d2); color: #fff; }
            .secondary { background: rgba(29,155,240,0.12); color: var(--text); border: 1px solid rgba(29,155,240,0.12); }
            .history-list { display: grid; gap: 8px; margin-top: 10px; }
            .history-item, .history-empty { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 10px; background: rgba(148,163,184,0.08); color: var(--text); }
            .history-empty { color: var(--muted); justify-content: center; }
            .about { line-height: 1.6; color: var(--muted); }
            .link { color: var(--primary); }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="header"><div class="brand"><span class="drop"></span> AquaDrop</div><div class="status-pill">${state.enabled && !state.paused ? 'Active' : 'Paused'}</div></div>
            <div class="grid">
              <div class="card"><div class="label">Current status</div><div class="value accent">${state.enabled && !state.paused ? 'Hydration on track' : 'Reminders paused'}</div></div>
              <div class="card"><div class="label">Next reminder</div><div class="value">${nextReminderText}</div></div>
              <div class="card"><div class="label">Today's progress</div><div class="value">${todayCount} / ${state.dailyGoal}</div><div class="progress-wrap"><div class="progress"><span></span></div></div></div>
              <div class="card"><div class="label">Quick actions</div><div class="button-row"><button class="primary" data-command="drinkWater">Drink Water</button><button class="secondary" data-command="snoozeReminder">Snooze</button><button class="secondary" data-command="${state.paused || !state.enabled ? 'resumeReminders' : 'pauseReminders'}">${state.paused || !state.enabled ? 'Resume' : 'Pause'}</button><button class="secondary" data-command="resetDailyProgress">Reset</button></div></div>
            </div>
            <div class="card"><div class="section-title">Reminder settings</div>
              <div class="settings">
                <div class="field"><label for="remindersEnabled">Enable reminders</label><input id="remindersEnabled" data-setting="remindersEnabled" type="checkbox" ${state.enabled && !state.paused ? 'checked' : ''} /></div>
                <div class="field"><label for="intervalMinutes">Interval (minutes)</label><input id="intervalMinutes" data-setting="intervalMinutes" type="number" min="1" max="1440" value="${state.intervalMinutes}" /></div>
                <div class="field"><label for="snoozeMinutes">Snooze (minutes)</label><input id="snoozeMinutes" data-setting="snoozeMinutes" type="number" min="1" max="180" value="${state.snoozeMinutes}" /></div>
                <div class="field"><label for="dailyGoal">Daily goal</label><input id="dailyGoal" data-setting="dailyGoal" type="number" min="1" max="200" value="${state.dailyGoal}" /></div>
                <div class="field"><label for="notificationsEnabled">Desktop notifications</label><input id="notificationsEnabled" data-setting="notificationsEnabled" type="checkbox" ${state.notificationsEnabled ? 'checked' : ''} /></div>
                <div class="field"><label for="appearance">Appearance</label><select id="appearance" data-setting="appearance"><option value="system" ${state.appearance === 'system' ? 'selected' : ''}>System</option><option value="light" ${state.appearance === 'light' ? 'selected' : ''}>Light</option><option value="dark" ${state.appearance === 'dark' ? 'selected' : ''}>Dark</option></select></div>
              </div>
            </div>
            <div class="card"><div class="section-title">Recent activity</div><div class="history-list">${recentHtml}</div></div>
            <div class="card"><div class="section-title">About</div><div class="about">AquaDrop — Hydration Reminder<br />Designed &amp; Developed by Shivam Mavi<br />Website: <a class="link" href="https://aqua-drop-seven.vercel.app/">https://aqua-drop-seven.vercel.app/</a><br />Repository: <a class="link" href="https://github.com/shivammraj/AquaDrop">https://github.com/shivammraj/AquaDrop</a></div></div>
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            const applySetting = (key, value) => vscode.postMessage({ type: 'updateSetting', key, value });
            document.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => vscode.postMessage({ type: 'command', command: button.getAttribute('data-command') })));
            document.querySelectorAll('[data-setting]').forEach((element) => {
              const node = element;
              node.addEventListener('change', () => applySetting(node.getAttribute('data-setting') ?? '', node.type === 'checkbox' ? node.checked : node.value));
              node.addEventListener('input', () => applySetting(node.getAttribute('data-setting') ?? '', node.type === 'checkbox' ? node.checked : node.value));
            });
          </script>
        </body>
      </html>`
  }

  public getSnapshot(): Record<string, unknown> {
    const todayKey = getDateKey(Date.now())
    return {
      enabled: !!this.state.enabled && !this.state.paused,
      paused: this.state.paused,
      intervalMinutes: this.state.intervalMinutes,
      snoozeMinutes: this.state.snoozeMinutes,
      notificationsEnabled: this.state.notificationsEnabled,
      dailyGoal: this.state.dailyGoal,
      appearance: this.state.appearance,
      nextReminderAt: this.state.nextReminderAt,
      history: this.state.history,
      todayCount: this.state.history[todayKey] ?? 0,
      lastDrinkAt: this.state.lastDrinkAt
    }
  }

  private async changeInterval(): Promise<void> {
    const items = [
      { label: '15 minutes', value: 15 },
      { label: '30 minutes', value: 30 },
      { label: '45 minutes', value: 45 },
      { label: '60 minutes', value: 60 },
      { label: '90 minutes', value: 90 },
      { label: 'Custom...', value: -1 }
    ]

    const selected = await vscode.window.showQuickPick(items, { placeHolder: 'Choose a reminder interval', ignoreFocusOut: true })
    if (!selected) {
      return
    }

    let nextMinutes = selected.value
    if (nextMinutes === -1) {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter reminder interval in minutes (1-1440)',
        value: String(this.state.intervalMinutes),
        validateInput: (value) => {
          const parsed = Number(value)
          return Number.isNaN(parsed) || parsed < 1 || parsed > 1440 ? 'Please enter a valid number between 1 and 1440.' : undefined
        }
      })
      if (!input) {
        return
      }
      nextMinutes = Number(input)
    }

    this.updateSetting('intervalMinutes', nextMinutes)
  }

  private applySettingsFromWorkspace(): void {
    const config = vscode.workspace.getConfiguration('aquadrop')
    this.state.intervalMinutes = clampNumber(config.get<number>('intervalMinutes', this.state.intervalMinutes), 1, 1440)
    this.state.snoozeMinutes = clampNumber(config.get<number>('snoozeMinutes', this.state.snoozeMinutes), 1, 180)
    this.state.notificationsEnabled = config.get<boolean>('notificationsEnabled', this.state.notificationsEnabled)
    this.state.dailyGoal = clampNumber(config.get<number>('dailyGoal', this.state.dailyGoal), 1, 200)
    this.state.appearance = normalizeAppearance(config.get<string>('appearance', this.state.appearance))
    this.state.enabled = config.get<boolean>('remindersEnabled', this.state.enabled)

    if (this.state.enabled && !this.state.paused && !this.state.nextReminderAt) {
      this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
    }
  }

  private updateSetting(key: string, value: unknown): void {
    switch (key) {
      case 'remindersEnabled': {
        this.state.enabled = Boolean(value)
        this.state.paused = !Boolean(value)
        this.state.nextReminderAt = this.state.enabled ? Date.now() + this.state.intervalMinutes * 60 * 1000 : null
        this.persistState(); this.rescheduleReminder(); this.refreshWebviews();
        void vscode.workspace.getConfiguration('aquadrop').update('remindersEnabled', Boolean(value), vscode.ConfigurationTarget.Global)
        break
      }
      case 'intervalMinutes': {
        const minutes = clampNumber(Number(value), 1, 1440)
        this.state.intervalMinutes = minutes
        if (this.state.enabled && !this.state.paused) {
          this.state.nextReminderAt = Date.now() + minutes * 60 * 1000
        }
        this.persistState(); this.rescheduleReminder(); this.refreshWebviews();
        void vscode.workspace.getConfiguration('aquadrop').update('intervalMinutes', minutes, vscode.ConfigurationTarget.Global)
        break
      }
      case 'snoozeMinutes': {
        this.state.snoozeMinutes = clampNumber(Number(value), 1, 180)
        this.persistState(); this.refreshWebviews();
        void vscode.workspace.getConfiguration('aquadrop').update('snoozeMinutes', this.state.snoozeMinutes, vscode.ConfigurationTarget.Global)
        break
      }
      case 'notificationsEnabled': {
        this.state.notificationsEnabled = Boolean(value)
        this.persistState(); this.refreshWebviews();
        void vscode.workspace.getConfiguration('aquadrop').update('notificationsEnabled', this.state.notificationsEnabled, vscode.ConfigurationTarget.Global)
        break
      }
      case 'dailyGoal': {
        this.state.dailyGoal = clampNumber(Number(value), 1, 200)
        this.persistState(); this.refreshWebviews();
        void vscode.workspace.getConfiguration('aquadrop').update('dailyGoal', this.state.dailyGoal, vscode.ConfigurationTarget.Global)
        break
      }
      case 'appearance': {
        this.state.appearance = normalizeAppearance(String(value))
        this.persistState(); this.refreshWebviews();
        void vscode.workspace.getConfiguration('aquadrop').update('appearance', this.state.appearance, vscode.ConfigurationTarget.Global)
        break
      }
      default:
        break
    }
  }

  private triggerReminder(): void {
    if (!this.state.enabled || this.state.paused) {
      return
    }

    const notification = this.state.notificationsEnabled
      ? vscode.window.showInformationMessage('Time for a water break 💧', 'Drink Water', 'Remind me in 5 minutes')
      : Promise.resolve(undefined)

    notification.then((selection) => {
      if (selection === 'Drink Water') {
        void this.drinkWater()
        return
      }
      if (selection === 'Remind me in 5 minutes') {
        this.snoozeReminder(5)
        return
      }
      this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
      this.persistState(); this.rescheduleReminder(); this.refreshWebviews()
    })

    this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
    this.persistState(); this.rescheduleReminder(); this.refreshWebviews()
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  private rescheduleReminder(): void {
    this.clearTimer()
    if (!this.state.enabled || this.state.paused || !this.state.nextReminderAt) {
      this.updateStatusBar();
      return
    }

    const delay = this.state.nextReminderAt - Date.now()
    if (delay <= 0) {
      this.triggerReminder()
      return
    }

    this.timer = setTimeout(() => this.triggerReminder(), delay)
    this.updateStatusBar()
  }

  private updateStatusBar(): void {
    const nextReminder = this.state.nextReminderAt
    const isRunning = this.state.enabled && !this.state.paused
    this.statusBarItem.text = isRunning && nextReminder ? `💧 AquaDrop · ${formatCountdown(nextReminder)}` : '💧 AquaDrop · Paused'
    this.statusBarItem.tooltip = isRunning && nextReminder ? `AquaDrop reminder scheduled for ${new Date(nextReminder).toLocaleTimeString()}` : 'AquaDrop reminders are paused or disabled.'
    this.statusBarItem.show()
  }

  private updateDashboardPanel(): void {
    if (this.dashboardPanel) {
      this.dashboardPanel.webview.html = this.renderDashboardHtml()
    }
  }

  private ensureTodayBucket(): void {
    const key = getDateKey(Date.now())
    if (!this.state.history[key]) {
      this.state.history[key] = 0
    }
  }

  private persistState(): void {
    void this.context.globalState.update(STATE_KEY, this.state)
  }

  private loadState(): AquaDropState {
    const saved = this.context.globalState.get<AquaDropState>(STATE_KEY)
    if (!saved) {
      return { ...defaultState }
    }

    return {
      ...defaultState,
      ...saved,
      intervalMinutes: clampNumber(Number(saved.intervalMinutes ?? defaultState.intervalMinutes), 1, 1440),
      snoozeMinutes: clampNumber(Number(saved.snoozeMinutes ?? defaultState.snoozeMinutes), 1, 180),
      dailyGoal: clampNumber(Number(saved.dailyGoal ?? defaultState.dailyGoal), 1, 200),
      notificationsEnabled: saved.notificationsEnabled ?? defaultState.notificationsEnabled,
      appearance: normalizeAppearance(saved.appearance ?? defaultState.appearance),
      history: saved.history ?? {},
      enabled: saved.enabled ?? defaultState.enabled,
      paused: saved.paused ?? false,
      nextReminderAt: saved.nextReminderAt ?? null
    }
  }

}

class AquaDropSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aquadrop.sidebar'

  private view?: vscode.WebviewView
  private readonly manager: AquaDropManager

  constructor(manager: AquaDropManager) {
    this.manager = manager
  }

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView
    webviewView.webview.options = { enableScripts: true }
    webviewView.webview.html = this.manager.renderSidebarHtml()
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.type === 'command') {
        this.manager.executeCommand(message.command)
      }
    })
  }

  public refresh(): void {
    if (this.view) {
      this.view.webview.html = this.manager.renderSidebarHtml()
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const manager = new AquaDropManager(context)
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(AquaDropSidebarProvider.viewType, manager['sidebarProvider']))

  const registerCommand = (command: string, callback: () => void): void => {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback))
  }

  registerCommand('aquadrop.openDashboard', () => manager.openDashboard())
  registerCommand('aquadrop.drinkWater', () => { void manager.drinkWater() })
  registerCommand('aquadrop.snoozeReminder', () => manager.snoozeReminder())
  registerCommand('aquadrop.pauseReminders', () => manager.pauseReminders())
  registerCommand('aquadrop.resumeReminders', () => manager.resumeReminders())
  registerCommand('aquadrop.toggleReminders', () => manager.toggleReminders())
  registerCommand('aquadrop.resetDailyProgress', () => manager.resetDailyProgress())
  registerCommand('aquadrop.startReminders', () => manager.startReminders())
  registerCommand('aquadrop.logWater', () => { void manager.drinkWater() })
  registerCommand('aquadrop.changeInterval', () => { void manager['changeInterval']() })
  registerCommand('aquadrop.openSettings', () => { void vscode.commands.executeCommand('workbench.action.openSettings', 'aquadrop') })

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
    if (!event.affectsConfiguration('aquadrop')) {
      return
    }
    manager['applySettingsFromWorkspace']()
    manager['rescheduleReminder']()
    manager.refreshWebviews()
  }))

  manager.initialize()

  const ticker = setInterval(() => {
    if (manager['state'].enabled && !manager['state'].paused && manager['state'].nextReminderAt) {
      manager['updateStatusBar']()
      manager.refreshWebviews()
    }
  }, 1000)

  context.subscriptions.push({ dispose: () => clearInterval(ticker) })
}

export function deactivate(): void {}

function clampNumber(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) {
    return minimum
  }
  return Math.min(Math.max(value, minimum), maximum)
}

function normalizeAppearance(value: string | undefined): Appearance {
  if (value === 'light' || value === 'dark') {
    return value
  }
  return 'system'
}

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
