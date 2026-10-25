import { AquaDropSnapshot, AquaDropState } from './types'
import { clampNumber, formatCountdown } from './utils'
import { AquaDropStorage } from './storage'

export interface ReminderDiagnostic {
  scheduledTime: number
  actualTime: number
  driftMs: number
}

export interface SchedulerCallbacks {
  onReminderDue: (diagnostic: ReminderDiagnostic) => void | Promise<void>
  onStateChange: (state: AquaDropState, snapshot: AquaDropSnapshot) => void | Promise<void>
  logDiagnostic?: (message: string) => void
}

export class AquaDropScheduler {
  private state: AquaDropState
  private readonly storage: AquaDropStorage
  private readonly callbacks: SchedulerCallbacks
  private timer: NodeJS.Timeout | undefined
  private isTriggering: boolean = false
  private isDisposed: boolean = false

  constructor(
    storage: AquaDropStorage,
    callbacks: SchedulerCallbacks
  ) {
    this.storage = storage
    this.callbacks = callbacks
    this.state = this.storage.loadState()
  }

  public getState(): Readonly<AquaDropState> {
    return this.state
  }

  public getSnapshot(): AquaDropSnapshot {
    const now = Date.now()
    const todayCount = this.storage.getTodayCount(this.state, now)
    const progressPercent = Math.min(
      100,
      Math.round((todayCount / Math.max(this.state.dailyGoal, 1)) * 100)
    )
    const isRunning = this.state.enabled && !this.state.paused
    const countdownText = isRunning ? formatCountdown(this.state.nextReminderAt, now) : 'Paused'

    return {
      enabled: this.state.enabled,
      paused: this.state.paused,
      intervalMinutes: this.state.intervalMinutes,
      snoozeMinutes: this.state.snoozeMinutes,
      notificationsEnabled: this.state.notificationsEnabled,
      soundEnabled: this.state.soundEnabled,
      voiceType: this.state.voiceType,
      dailyGoal: this.state.dailyGoal,
      appearance: this.state.appearance,
      nextReminderAt: this.state.nextReminderAt,
      lastDrinkAt: this.state.lastDrinkAt,
      todayCount,
      countdownText,
      progressPercent,
      history: this.state.history,
      recentHistory: this.storage.getRecentHistory(this.state, 7)
    }
  }

  public async start(): Promise<void> {
    if (this.isDisposed) {
      return
    }
    const now = Date.now()
    if (this.state.enabled && !this.state.paused) {
      if (this.state.nextReminderAt !== null && this.state.nextReminderAt <= now) {
        // Overdue handling: fire once and schedule next from now, preventing flooding
        await this.handleOverdue()
        return
      }

      if (this.state.nextReminderAt === null) {
        this.state.nextReminderAt = now + this.state.intervalMinutes * 60 * 1000
        await this.persistAndNotify()
      }
    }

    this.rescheduleTimer()
  }

  private async handleOverdue(): Promise<void> {
    const now = Date.now()
    const scheduledTime = this.state.nextReminderAt ?? now
    const driftMs = now - scheduledTime

    // Schedule next reminder from now
    this.state.nextReminderAt = now + this.state.intervalMinutes * 60 * 1000
    await this.persistAndNotify()
    this.rescheduleTimer()

    // Trigger one overdue notification safely
    if (!this.isTriggering) {
      this.isTriggering = true
      try {
        const result = this.callbacks.onReminderDue({
          scheduledTime,
          actualTime: now,
          driftMs
        })
        if (result && typeof (result as Promise<void>).catch === 'function') {
          ;(result as Promise<void>).catch((err) => {
            this.callbacks.logDiagnostic?.(`Error in overdue onReminderDue: ${String(err)}`)
          })
        }
      } catch (err) {
        this.callbacks.logDiagnostic?.(`Exception in overdue onReminderDue: ${String(err)}`)
      } finally {
        this.isTriggering = false
      }
    }
  }

  public async drinkWater(timestamp: number = Date.now()): Promise<void> {
    this.state = this.storage.recordWaterBreak(this.state, timestamp)
    this.state.enabled = true
    this.state.paused = false
    this.state.nextReminderAt = timestamp + this.state.intervalMinutes * 60 * 1000
    await this.persistAndNotify()
    this.rescheduleTimer()
  }

  public async snooze(customMinutes?: number): Promise<number> {
    const duration = clampNumber(customMinutes, 1, 180, this.state.snoozeMinutes)
    this.state.enabled = true
    this.state.paused = false
    this.state.nextReminderAt = Date.now() + duration * 60 * 1000
    await this.persistAndNotify()
    this.rescheduleTimer()
    return duration
  }

  public async pause(): Promise<void> {
    this.state.enabled = false
    this.state.paused = true
    this.state.nextReminderAt = null
    this.clearTimer()
    await this.persistAndNotify()
  }

  public async resume(): Promise<void> {
    this.state.enabled = true
    this.state.paused = false
    this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
    await this.persistAndNotify()
    this.rescheduleTimer()
  }

  public async toggle(): Promise<void> {
    if (this.state.paused || !this.state.enabled) {
      await this.resume()
    } else {
      await this.pause()
    }
  }

  public async resetDailyProgress(): Promise<void> {
    this.state = this.storage.resetTodayProgress(this.state)
    await this.persistAndNotify()
  }

  public async updateSettings(
    changes: Partial<Pick<AquaDropState, 'enabled' | 'paused' | 'intervalMinutes' | 'snoozeMinutes' | 'notificationsEnabled' | 'soundEnabled' | 'voiceType' | 'dailyGoal' | 'appearance'>>
  ): Promise<void> {
    let timerNeedsReschedule = false

    if (changes.intervalMinutes !== undefined) {
      const minutes = clampNumber(changes.intervalMinutes, 1, 1440, this.state.intervalMinutes)
      if (minutes !== this.state.intervalMinutes) {
        this.state.intervalMinutes = minutes
        if (this.state.enabled && !this.state.paused) {
          this.state.nextReminderAt = Date.now() + minutes * 60 * 1000
          timerNeedsReschedule = true
        }
      }
    }

    if (changes.snoozeMinutes !== undefined) {
      this.state.snoozeMinutes = clampNumber(changes.snoozeMinutes, 1, 180, this.state.snoozeMinutes)
    }

    if (changes.dailyGoal !== undefined) {
      this.state.dailyGoal = clampNumber(changes.dailyGoal, 1, 200, this.state.dailyGoal)
    }

    if (changes.notificationsEnabled !== undefined) {
      this.state.notificationsEnabled = Boolean(changes.notificationsEnabled)
    }

    if (changes.soundEnabled !== undefined) {
      this.state.soundEnabled = Boolean(changes.soundEnabled)
    }

    if (changes.voiceType !== undefined) {
      this.state.voiceType = changes.voiceType
    }

    if (changes.appearance !== undefined) {
      this.state.appearance = changes.appearance
    }

    if (changes.enabled !== undefined) {
      const enabled = Boolean(changes.enabled)
      if (enabled !== this.state.enabled) {
        this.state.enabled = enabled
        this.state.paused = !enabled
        if (enabled) {
          if (this.state.nextReminderAt === null || this.state.nextReminderAt <= Date.now()) {
            this.state.nextReminderAt = Date.now() + this.state.intervalMinutes * 60 * 1000
          }
        } else {
          this.state.nextReminderAt = null
        }
        timerNeedsReschedule = true
      }
    }

    await this.persistAndNotify()

    if (timerNeedsReschedule) {
      this.rescheduleTimer()
    }
  }

  public async syncConfigFromWorkspace(config: {
    intervalMinutes: number
    snoozeMinutes: number
    dailyGoal: number
    notificationsEnabled: boolean
    soundEnabled: boolean
    voiceType?: AquaDropState['voiceType']
    appearance: AquaDropState['appearance']
    remindersEnabled: boolean
  }): Promise<void> {
    await this.updateSettings({
      intervalMinutes: config.intervalMinutes,
      snoozeMinutes: config.snoozeMinutes,
      dailyGoal: config.dailyGoal,
      notificationsEnabled: config.notificationsEnabled,
      soundEnabled: config.soundEnabled,
      voiceType: config.voiceType ?? 'female',
      appearance: config.appearance,
      enabled: config.remindersEnabled
    })
  }

  public rescheduleTimer(): void {
    this.clearTimer()

    if (this.isDisposed || !this.state.enabled || this.state.paused || this.state.nextReminderAt === null) {
      return
    }

    const now = Date.now()
    const delay = this.state.nextReminderAt - now

    if (delay <= 0) {
      void this.triggerDueReminder()
      return
    }

    // Schedule single next timer with remaining time
    this.timer = setTimeout(() => {
      void this.triggerDueReminder()
    }, delay)

    if (this.timer && typeof (this.timer as any).unref === 'function') {
      ;(this.timer as any).unref()
    }
  }

  public async checkDue(): Promise<boolean> {
    if (this.isDisposed || !this.state.enabled || this.state.paused || this.state.nextReminderAt === null) {
      return false
    }
    if (Date.now() >= this.state.nextReminderAt) {
      await this.triggerDueReminder()
      return true
    }
    return false
  }

  public async triggerDueReminder(): Promise<void> {
    if (this.isDisposed || this.isTriggering) {
      return
    }
    this.isTriggering = true

    try {
      if (this.isDisposed || !this.state.enabled || this.state.paused) {
        return
      }

      const scheduledTime = this.state.nextReminderAt ?? Date.now()
      const actualTime = Date.now()
      const driftMs = actualTime - scheduledTime

      // Automatically advance to the next interval immediately
      this.state.nextReminderAt = actualTime + this.state.intervalMinutes * 60 * 1000
      await this.persistAndNotify()

      if (!this.isDisposed) {
        this.rescheduleTimer()
      }

      // Notify callback asynchronously without blocking subsequent timers or rescheduling
      try {
        const result = this.callbacks.onReminderDue({
          scheduledTime,
          actualTime,
          driftMs
        })
        if (result && typeof (result as Promise<void>).catch === 'function') {
          ;(result as Promise<void>).catch((err) => {
            this.callbacks.logDiagnostic?.(`Error in onReminderDue callback: ${String(err)}`)
          })
        }
      } catch (err) {
        this.callbacks.logDiagnostic?.(`Exception in onReminderDue callback: ${String(err)}`)
      }
    } finally {
      this.isTriggering = false
    }
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  private async persistAndNotify(): Promise<void> {
    await this.storage.saveState(this.state)
    await this.callbacks.onStateChange(this.state, this.getSnapshot())
  }

  public dispose(): void {
    this.isDisposed = true
    this.clearTimer()
  }
}
