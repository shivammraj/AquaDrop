import * as vscode from 'vscode'
import { AquaDropSnapshot, VoiceType, WebviewIncomingMessage } from '../types'
import { validateWebviewMessage } from '../utils'
import { buildDashboardHtml } from './htmlBuilder'

export interface DashboardActions {
  getSnapshot: () => AquaDropSnapshot
  executeCommand: (command: string, payload?: unknown) => void | Promise<void>
  updateSetting: (key: string, value: unknown) => void | Promise<void>
}

export class AquaDropDashboardPanel {
  public static currentPanel: AquaDropDashboardPanel | undefined
  public static readonly viewType = 'aquadrop.dashboard'

  private readonly panel: vscode.WebviewPanel
  private readonly actions: DashboardActions
  private disposables: vscode.Disposable[] = []

  public static createOrShow(extensionUri: vscode.Uri, actions: DashboardActions): AquaDropDashboardPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (AquaDropDashboardPanel.currentPanel) {
      AquaDropDashboardPanel.currentPanel.panel.reveal(column)
      AquaDropDashboardPanel.currentPanel.syncState(actions.getSnapshot())
      return AquaDropDashboardPanel.currentPanel
    }

    const panel = vscode.window.createWebviewPanel(
      AquaDropDashboardPanel.viewType,
      'AquaDrop Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri]
      }
    )

    AquaDropDashboardPanel.currentPanel = new AquaDropDashboardPanel(panel, actions)
    return AquaDropDashboardPanel.currentPanel
  }

  private constructor(panel: vscode.WebviewPanel, actions: DashboardActions) {
    this.panel = panel
    this.actions = actions

    const snapshot = this.actions.getSnapshot()
    this.panel.webview.html = buildDashboardHtml(snapshot)

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)

    this.panel.webview.onDidReceiveMessage(
      async (rawData) => {
        const validated: WebviewIncomingMessage | null = validateWebviewMessage(rawData)
        if (!validated) {
          return
        }

        if (validated.type === 'ready') {
          this.syncState(this.actions.getSnapshot())
          return
        }

        if (validated.type === 'dismissToast') {
          this.dismissReminder()
          return
        }

        if (validated.type === 'testSound') {
          this.playSound(validated.voiceType)
          return
        }

        if (validated.type === 'command') {
          await this.actions.executeCommand(validated.command, validated.payload)
          return
        }

        if (validated.type === 'updateSetting') {
          await this.actions.updateSetting(validated.key, validated.value)
        }
      },
      null,
      this.disposables
    )
  }

  public isVisible(): boolean {
    return Boolean(this.panel && this.panel.visible)
  }

  public showReminder(snoozeMinutes: number, sound: boolean = true, voiceType: VoiceType = 'female'): void {
    void this.panel.webview.postMessage({
      type: 'showReminder',
      message: 'Time for a water break 💧',
      snoozeMinutes,
      sound,
      voiceType
    })
  }

  public dismissReminder(): void {
    void this.panel.webview.postMessage({
      type: 'dismissReminder'
    })
  }

  public playSound(voiceType?: VoiceType): void {
    void this.panel.webview.postMessage({
      type: 'playSound',
      voiceType
    })
  }

  public syncState(snapshot: AquaDropSnapshot): void {
    void this.panel.webview.postMessage({
      type: 'syncState',
      state: snapshot
    })
  }

  public dispose(): void {
    AquaDropDashboardPanel.currentPanel = undefined
    this.panel.dispose()
    while (this.disposables.length) {
      const item = this.disposables.pop()
      if (item) {
        item.dispose()
      }
    }
  }
}
