import type { ReminderState, ReminderIntervalUnit } from '../types/reminder'
import { DEFAULT_REMINDER_STATE, loadReminderState, saveReminderState } from './storage'

export type ReminderEngineEvents = 'change'

type Listener = () => void

export class ReminderEngine {
  private state: ReminderState
  private listeners = new Set<Listener>()
  private timerId: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.state = loadReminderState()
    this.reschedule()
  }

  on(event: ReminderEngineEvents, listener: Listener): void {
    if (event === 'change') {
      this.listeners.add(listener)
    }
  }

  off(event: ReminderEngineEvents, listener: Listener): void {
    if (event === 'change') {
      this.listeners.delete(listener)
    }
  }

  getState(): ReminderState {
    return {
      ...this.state,
      hydrationHistory: [...this.state.hydrationHistory]
    }
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

  private isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  private reschedule(): void {
    this.clearTimer()

    if (!this.state.enabled || !this.state.nextReminder || this.state.reminderOpen) {
      return
    }

    const msUntilNext = this.state.nextReminder - Date.now()

    if (msUntilNext <= 0) {
      this.triggerReminder()
      return
    }

    this.timerId = setTimeout(() => {
      this.triggerReminder()
    }, msUntilNext)
  }

  private triggerReminder(): void {
    this.state.reminderOpen = true
    this.persist()

    if (this.state.notificationsEnabled && this.isBrowser() && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('AquaDrop', {
          body: 'Drink water, stay hydrated.',
          icon: '/water-drop-icon.svg'
        })

        notification.onclick = () => {
          if (this.isBrowser()) {
            window.focus()
          }
          notification.close()
        }
      } catch {
        // Ignore notification issues gracefully.
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

  setTheme(theme: ReminderState['theme']): void {
    this.state.theme = theme
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

  start(): void {
    if (!this.state.enabled) {
      this.state.enabled = true
      this.state.reminderOpen = false
      this.state.nextReminder = Date.now() + this.intervalMs()
      this.persist()
      this.reschedule()
    }
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
    this.state.enabled = true
    this.state.reminderOpen = false
    this.state.nextReminder = Date.now() + this.state.snoozeMinutes * 60 * 1000
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
    if (!this.isBrowser() || !('Notification' in window)) {
      return Promise.resolve(false)
    }

    if (Notification.permission === 'granted') {
      return Promise.resolve(true)
    }

    if (Notification.permission === 'denied') {
      return Promise.resolve(false)
    }

    return Notification.requestPermission().then((permission) => permission === 'granted')
  }

  getMsToNext(): number {
    if (!this.state.nextReminder) {
      return Number.POSITIVE_INFINITY
    }

    return Math.max(0, this.state.nextReminder - Date.now())
  }

  getCurrentState(): ReminderState {
    return this.getState()
  }
}

export const reminderEngine = new ReminderEngine()

export function createDefaultReminderState(): ReminderState {
  return { ...DEFAULT_REMINDER_STATE }
}
