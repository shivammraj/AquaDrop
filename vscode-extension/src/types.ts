export type Appearance = 'system' | 'light' | 'dark'
export type VoiceType = 'female' | 'male' | 'chime-only'

export interface AquaDropState {
  enabled: boolean
  paused: boolean
  intervalMinutes: number
  snoozeMinutes: number
  notificationsEnabled: boolean
  soundEnabled: boolean
  voiceType: VoiceType
  dailyGoal: number
  appearance: Appearance
  nextReminderAt: number | null
  lastDrinkAt: number | null
  history: Record<string, number>
}

export interface AquaDropSnapshot {
  enabled: boolean
  paused: boolean
  intervalMinutes: number
  snoozeMinutes: number
  notificationsEnabled: boolean
  soundEnabled: boolean
  voiceType: VoiceType
  dailyGoal: number
  appearance: Appearance
  nextReminderAt: number | null
  lastDrinkAt: number | null
  todayCount: number
  countdownText: string
  progressPercent: number
  history: Record<string, number>
  recentHistory: Array<{ date: string; count: number }>
}

export type WebviewIncomingMessage =
  | { type: 'command'; command: string; payload?: unknown }
  | { type: 'updateSetting'; key: string; value: unknown }
  | { type: 'ready' }
  | { type: 'dismissToast' }
  | { type: 'testSound'; voiceType?: VoiceType }

export type ExtensionOutgoingMessage =
  | { type: 'syncState'; state: AquaDropSnapshot }
  | { type: 'showReminder'; message: string; snoozeMinutes: number; sound: boolean; voiceType: VoiceType }
  | { type: 'dismissReminder' }
  | { type: 'playSound'; voiceType?: VoiceType }

export const STATE_KEY = 'aquadrop.state.v2'

export const DEFAULT_CONFIG = {
  intervalMinutes: 30,
  snoozeMinutes: 5,
  dailyGoal: 8,
  notificationsEnabled: true,
  soundEnabled: true,
  voiceType: 'female' as VoiceType,
  appearance: 'system' as Appearance,
  enabled: true,
  paused: false
}
