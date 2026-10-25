import { Appearance, VoiceType, WebviewIncomingMessage } from './types'

export function clampNumber(value: unknown, minimum: number, maximum: number, defaultValue: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return defaultValue
  }
  return Math.min(Math.max(parsed, minimum), maximum)
}

export function normalizeAppearance(value: unknown): Appearance {
  if (value === 'light' || value === 'dark') {
    return value
  }
  return 'system'
}

export function normalizeVoiceType(value: unknown): VoiceType {
  if (value === 'male' || value === 'chime-only') {
    return value
  }
  return 'female'
}

export function getDateKey(timestamp: number): string {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatCountdown(nextReminder: number | null, now: number = Date.now()): string {
  if (nextReminder === null || !Number.isFinite(nextReminder)) {
    return 'Paused'
  }

  const diffMs = nextReminder - now
  if (diffMs <= 0) {
    return 'Due now'
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

export function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let nonce = ''
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return nonce
}

const ALLOWED_COMMANDS = new Set([
  'drinkWater',
  'snoozeReminder',
  'pauseReminders',
  'resumeReminders',
  'toggleReminders',
  'openDashboard',
  'resetDailyProgress',
  'startReminders',
  'openSettings',
  'changeInterval',
  'logWater',
  'testSound'
])

const ALLOWED_SETTINGS = new Set([
  'remindersEnabled',
  'intervalMinutes',
  'snoozeMinutes',
  'notificationsEnabled',
  'soundEnabled',
  'voiceType',
  'dailyGoal',
  'appearance'
])

export function validateWebviewMessage(data: unknown): WebviewIncomingMessage | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const msg = data as Record<string, unknown>
  if (typeof msg.type !== 'string') {
    return null
  }

  if (msg.type === 'ready') {
    return { type: 'ready' }
  }

  if (msg.type === 'dismissToast') {
    return { type: 'dismissToast' }
  }

  if (msg.type === 'testSound') {
    if (msg.voiceType) {
      return { type: 'testSound', voiceType: normalizeVoiceType(msg.voiceType) }
    }
    return { type: 'testSound' }
  }

  if (msg.type === 'command') {
    if (typeof msg.command === 'string' && ALLOWED_COMMANDS.has(msg.command)) {
      return {
        type: 'command',
        command: msg.command,
        payload: msg.payload
      }
    }
    return null
  }

  if (msg.type === 'updateSetting') {
    if (typeof msg.key === 'string' && ALLOWED_SETTINGS.has(msg.key)) {
      return {
        type: 'updateSetting',
        key: msg.key,
        value: msg.value
      }
    }
    return null
  }

  return null
}
