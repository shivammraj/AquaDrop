import * as vscode from 'vscode'
import { AquaDropSnapshot, VoiceType, WebviewIncomingMessage } from '../types'
import { validateWebviewMessage } from '../utils'
import { buildSidebarHtml } from './htmlBuilder'

export interface SidebarActions {
  getSnapshot: () => AquaDropSnapshot
  executeCommand: (command: string, payload?: unknown) => void | Promise<void>
  updateSetting: (key: string, value: unknown) => void | Promise<void>
}

export class AquaDropSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aquadrop.sidebar'

  private view?: vscode.WebviewView
  private readonly actions: SidebarActions

  constructor(actions: SidebarActions) {
    this.actions = actions
  }

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView
    webviewView.webview.options = {
      enableScripts: true
    }

    const snapshot = this.actions.getSnapshot()
    webviewView.webview.html = buildSidebarHtml(snapshot)

    webviewView.webview.onDidReceiveMessage(async (rawData) => {
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
    })
  }

  public isVisible(): boolean {
    return Boolean(this.view && this.view.visible)
  }

  public showReminder(snoozeMinutes: number, sound: boolean = true, voiceType: VoiceType = 'female'): void {
    if (this.view) {
      void this.view.webview.postMessage({
        type: 'showReminder',
        message: 'Time for a water break 💧',
        snoozeMinutes,
        sound,
        voiceType
      })
    }
  }

  public dismissReminder(): void {
    if (this.view) {
      void this.view.webview.postMessage({
        type: 'dismissReminder'
      })
    }
  }

  public playSound(voiceType?: VoiceType): void {
    if (this.view) {
      void this.view.webview.postMessage({
        type: 'playSound',
        voiceType
      })
    }
  }

  public syncState(snapshot: AquaDropSnapshot): void {
    if (this.view) {
      void this.view.webview.postMessage({
        type: 'syncState',
        state: snapshot
      })
    }
  }
}
