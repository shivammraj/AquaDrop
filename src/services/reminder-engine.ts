import type { ReminderIntervalUnit, ReminderState, VoiceType } from '../types/reminder'
import { playCelebrationChime, playReminderSound, playWaterChime } from './sound'

export const STORAGE_KEY = 'aquadrop.state.v1'

export const DEFAULT_REMINDER_STATE: ReminderState = {
  enabled: false,
  intervalValue: 30,
  intervalUnit: 'minutes',
  nextReminder: null,
  snoozeMinutes: 5,
  notificationsEnabled: true,
  notificationSound: true,
  voiceType: 'female',
  trackingEnabled: true,
  servingSize: 250,
  hydrationHistory: [],
  reminderOpen: false,
  theme: 'system'
}

export function sanitizeReminderState(value: Partial<ReminderState> | null | undefined): ReminderState {
  const base = { ...DEFAULT_REMINDER_STATE }
  if (!value) return base

  const intervalValue = Number(value.intervalValue ?? base.intervalValue)
  const intervalUnit = value.intervalUnit === 'hours' ? 'hours' : 'minutes'

  return {
    ...base,
    ...value,
    intervalValue: Number.isFinite(intervalValue) && intervalValue > 0 ? intervalValue : base.intervalValue,
    intervalUnit,
    nextReminder: typeof value.nextReminder === 'number' ? value.nextReminder : null,
    snoozeMinutes: Number.isFinite(Number(value.snoozeMinutes)) && Number(value.snoozeMinutes) > 0 ? Number(value.snoozeMinutes) : base.snoozeMinutes,
    notificationsEnabled: Boolean(value.notificationsEnabled ?? base.notificationsEnabled),
    notificationSound: Boolean(value.notificationSound ?? base.notificationSound),
    voiceType: value.voiceType === 'male' || value.voiceType === 'chime-only' ? value.voiceType : 'female',
    trackingEnabled: Boolean(value.trackingEnabled ?? base.trackingEnabled),
    servingSize: Number.isFinite(Number(value.servingSize)) && Number(value.servingSize) > 0 ? Number(value.servingSize) : base.servingSize,
    hydrationHistory: Array.isArray(value.hydrationHistory) ? value.hydrationHistory : base.hydrationHistory,
    reminderOpen: Boolean(value.reminderOpen ?? base.reminderOpen),
    theme: value.theme === 'dark' || value.theme === 'light' ? value.theme : 'system'
  }
}

export function loadReminderState(): ReminderState {
  if (typeof window === 'undefined' || !window.localStorage) return { ...DEFAULT_REMINDER_STATE }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_REMINDER_STATE }
    return sanitizeReminderState(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_REMINDER_STATE }
  }
}

export function saveReminderState(state: ReminderState): void {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures gracefully.
  }
}

type Listener = () => void

export class ReminderEngine {
  private state: ReminderState
  private listeners = new Set<Listener>()
  private timerId: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.state = loadReminderState()
    this.reschedule()
  }

  on(event: 'change', listener: Listener): void {
    if (event === 'change') this.listeners.add(listener)
  }

  off(event: 'change', listener: Listener): void {
    if (event === 'change') this.listeners.delete(listener)
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener())
  }

  private persist(): void {
    saveReminderState(this.state)
    this.emit()
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  private intervalMs(): number {
    return this.state.intervalUnit === 'hours'
      ? this.state.intervalValue * 60 * 60 * 1000
      : this.state.intervalValue * 60 * 1000
  }

  private reschedule(): void {
    this.clearTimer()

    if (!this.state.enabled || !this.state.nextReminder || this.state.reminderOpen) {
      return
    }

    const delay = this.state.nextReminder - Date.now()

    if (delay <= 0) {
      this.triggerReminder()
      return
    }

    this.timerId = setTimeout(() => {
      this.triggerReminder()
    }, delay)
  }

  private triggerReminder(): void {
    this.state.enabled = true
    this.state.reminderOpen = true
    this.state.nextReminder = Date.now() + this.intervalMs()
    this.persist()

    if (this.state.notificationSound) {
      playReminderSound(this.state.voiceType || 'female')
    }

    if (
      this.state.notificationsEnabled &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification('AquaDrop', {
          body: 'Drink water, stay hydrated.',
          icon: '/water-drop-icon.svg'
        })
      } catch {
        // ignore browser notification failures
      }
    }
  }

  private ensureValidInterval(value: number, unit: ReminderIntervalUnit): number {
    const normalized = Number(value)

    if (!Number.isFinite(normalized) || normalized <= 0) {
      throw new Error('Reminder interval must be greater than zero.')
    }

    const maxAllowed = unit === 'minutes' ? 1440 : 24
    if (normalized > maxAllowed) {
      throw new Error(`The maximum allowed interval is ${maxAllowed} ${unit}.`)
    }

    return normalized
  }

  getCurrentState(): ReminderState {
    return {
      ...this.state,
      hydrationHistory: [...this.state.hydrationHistory]
    }
  }

  getMsToNext(): number {
    if (!this.state.nextReminder) return Number.POSITIVE_INFINITY
    return Math.max(0, this.state.nextReminder - Date.now())
  }

  setInterval(value: number, unit: ReminderIntervalUnit): void {
    const normalized = this.ensureValidInterval(value, unit)
    this.state.intervalValue = normalized
    this.state.intervalUnit = unit

    if (this.state.enabled) {
      this.state.nextReminder = Date.now() + this.intervalMs()
      this.state.reminderOpen = false
    }

    this.persist()
    this.reschedule()
  }

  setSnoozeMinutes(value: number): void {
    const normalized = Number(value)
    if (!Number.isFinite(normalized) || normalized <= 0) {
      throw new Error('Snooze duration must be greater than zero.')
    }

    this.state.snoozeMinutes = normalized
    this.persist()
  }

  setNotificationsEnabled(value: boolean): void {
    this.state.notificationsEnabled = value
    this.persist()
  }

  setNotificationSound(value: boolean): void {
    this.state.notificationSound = value
    this.persist()
  }

  setTrackingEnabled(value: boolean): void {
    this.state.trackingEnabled = value
    this.persist()
  }

  setServingSize(value: number): void {
    const normalized = Number(value)
    if (!Number.isFinite(normalized) || normalized <= 0) {
      throw new Error('Serving size must be greater than zero.')
    }

    this.state.servingSize = normalized
    this.persist()
  }

  setTheme(theme: ReminderState['theme']): void {
    this.state.theme = theme
    this.persist()
  }

  setVoiceType(voiceType: VoiceType): void {
    this.state.voiceType = voiceType === 'male' || voiceType === 'chime-only' ? voiceType : 'female'
    this.persist()
  }

  start(): void {
    if (this.state.enabled) return

    this.state.enabled = true
    this.state.reminderOpen = false
    this.state.nextReminder = Date.now() + this.intervalMs()
    this.persist()
    this.reschedule()
  }

  pause(): void {
    this.state.enabled = false
    this.state.nextReminder = null
    this.state.reminderOpen = false
    this.clearTimer()
    this.persist()
  }

  resume(): void {
    this.state.enabled = true
    this.state.reminderOpen = false
    this.state.nextReminder = Date.now() + this.intervalMs()
    this.persist()
    this.reschedule()
  }

  snooze(): void {
    this.snoozeFor(this.state.snoozeMinutes)
  }

  /**
   * Postpone or snooze the reminder.
   * - If the reminder modal is active (or reminder has already passed/expired),
   *   snoozes for `minutes` starting from NOW so the user is alerted again in X minutes.
   * - If an upcoming reminder is already counting down in the future (e.g. on the Dashboard),
   *   delays the schedule by adding `minutes` to the existing next reminder so the timer
   *   extends rather than jumping down to a shorter duration.
   */
  snoozeFor(minutes: number): void {
    const mins = Math.max(1, Number(minutes) || this.state.snoozeMinutes)
    this.state.enabled = true

    const now = Date.now()
    if (this.state.reminderOpen || !this.state.nextReminder || this.state.nextReminder <= now) {
      // Alert is firing now or expired: remind in `mins` from now
      this.state.nextReminder = now + mins * 60 * 1000
    } else {
      // Upcoming reminder in the future: delay by adding `mins` to current schedule
      this.state.nextReminder = this.state.nextReminder + mins * 60 * 1000
    }

    this.state.reminderOpen = false
    this.persist()
    this.reschedule()
  }

  dismiss(): void {
    this.state.reminderOpen = false
    this.state.enabled = true

    if (!this.state.nextReminder) {
      this.state.nextReminder = Date.now() + this.intervalMs()
    }

    this.persist()
    this.reschedule()
  }

  recordDrink(): void {
    if (this.state.trackingEnabled) {
      this.state.hydrationHistory = [
        {
          id: Date.now(),
          amount: this.state.servingSize,
          timestamp: Date.now()
        },
        ...this.state.hydrationHistory
      ].slice(0, 30)
    }

    this.state.enabled = true
    this.state.reminderOpen = false
    this.state.nextReminder = Date.now() + this.intervalMs()
    this.persist()
    this.reschedule()

    if (this.state.notificationSound) {
      playCelebrationChime()
    }
  }

  deleteHistory(): void {
    this.state.hydrationHistory = []
    this.persist()
  }

  undoLastDrink(): void {
    this.state.hydrationHistory = this.state.hydrationHistory.slice(1)
    this.persist()
  }

  ensureNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return Promise.resolve(false)
    }

    if (Notification.permission === 'granted') return Promise.resolve(true)
    if (Notification.permission === 'denied') return Promise.resolve(false)

    return Notification.requestPermission().then((permission) => permission === 'granted')
  }
}

export const reminderEngine = new ReminderEngine()

export function createDefaultReminderState(): ReminderState {
  return { ...DEFAULT_REMINDER_STATE }
}
