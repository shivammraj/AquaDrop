import * as vscode from 'vscode'
import { Appearance, VoiceType } from './types'
import { clampNumber, normalizeAppearance, normalizeVoiceType } from './utils'

export interface WorkspaceConfigValues {
  remindersEnabled: boolean
  intervalMinutes: number
  snoozeMinutes: number
  notificationsEnabled: boolean
  soundEnabled: boolean
  voiceType: VoiceType
  dailyGoal: number
  appearance: Appearance
}

export class AquaDropConfigManager {
  public static getConfig(): WorkspaceConfigValues {
    const config = vscode.workspace.getConfiguration('aquadrop')

    return {
      remindersEnabled: config.get<boolean>('remindersEnabled', true),
      intervalMinutes: clampNumber(config.get<number>('intervalMinutes', 30), 1, 1440, 30),
      snoozeMinutes: clampNumber(config.get<number>('snoozeMinutes', 5), 1, 180, 5),
      notificationsEnabled: config.get<boolean>('notificationsEnabled', true),
      soundEnabled: config.get<boolean>('soundEnabled', true),
      voiceType: normalizeVoiceType(config.get<string>('voiceType', 'female')),
      dailyGoal: clampNumber(config.get<number>('dailyGoal', 8), 1, 200, 8),
      appearance: normalizeAppearance(config.get<string>('appearance', 'system'))
    }
  }

  public static async updateSetting(key: string, value: unknown): Promise<void> {
    const config = vscode.workspace.getConfiguration('aquadrop')

    switch (key) {
      case 'remindersEnabled': {
        const val = Boolean(value)
        await config.update('remindersEnabled', val, vscode.ConfigurationTarget.Global)
        break
      }
      case 'intervalMinutes': {
        const val = clampNumber(value, 1, 1440, 30)
        await config.update('intervalMinutes', val, vscode.ConfigurationTarget.Global)
        break
      }
      case 'snoozeMinutes': {
        const val = clampNumber(value, 1, 180, 5)
        await config.update('snoozeMinutes', val, vscode.ConfigurationTarget.Global)
        break
      }
      case 'notificationsEnabled': {
        const val = Boolean(value)
        await config.update('notificationsEnabled', val, vscode.ConfigurationTarget.Global)
        break
      }
      case 'soundEnabled': {
        const val = Boolean(value)
        await config.update('soundEnabled', val, vscode.ConfigurationTarget.Global)
        break
      }
      case 'voiceType': {
        const val = normalizeVoiceType(value)
        await config.update('voiceType', val, vscode.ConfigurationTarget.Global)
        break
      }
      case 'dailyGoal': {
        const val = clampNumber(value, 1, 200, 8)
        await config.update('dailyGoal', val, vscode.ConfigurationTarget.Global)
        break
      }
      case 'appearance': {
        const val = normalizeAppearance(value)
        await config.update('appearance', val, vscode.ConfigurationTarget.Global)
        break
      }
      default:
        break
    }
  }
}
