import { AquaDropState, DEFAULT_CONFIG, STATE_KEY } from './types'
import { clampNumber, getDateKey, normalizeAppearance, normalizeVoiceType } from './utils'

export interface StorageMemento {
  get<T>(key: string): T | undefined
  get<T>(key: string, defaultValue: T): T
  update(key: string, value: unknown): Thenable<void>
}

export class AquaDropStorage {
  private readonly memento: StorageMemento

  constructor(memento: StorageMemento) {
    this.memento = memento
  }

  public getInitialDefaultState(): AquaDropState {
    const now = Date.now()
    return {
      enabled: DEFAULT_CONFIG.enabled,
      paused: DEFAULT_CONFIG.paused,
      intervalMinutes: DEFAULT_CONFIG.intervalMinutes,
      snoozeMinutes: DEFAULT_CONFIG.snoozeMinutes,
      notificationsEnabled: DEFAULT_CONFIG.notificationsEnabled,
      soundEnabled: DEFAULT_CONFIG.soundEnabled,
      voiceType: DEFAULT_CONFIG.voiceType,
      dailyGoal: DEFAULT_CONFIG.dailyGoal,
      appearance: DEFAULT_CONFIG.appearance,
      nextReminderAt: now + DEFAULT_CONFIG.intervalMinutes * 60 * 1000,
      lastDrinkAt: null,
      history: {
        [getDateKey(now)]: 0
      }
    }
  }

  public loadState(): AquaDropState {
    const defaults = this.getInitialDefaultState()
    const saved = this.memento.get<Partial<AquaDropState>>(STATE_KEY)

    if (!saved || typeof saved !== 'object') {
      return defaults
    }

    const sanitizedHistory: Record<string, number> = {}
    if (saved.history && typeof saved.history === 'object') {
      for (const [key, val] of Object.entries(saved.history)) {
        if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val) && val >= 0) {
          sanitizedHistory[key] = Math.floor(val)
        }
      }
    }

    const todayKey = getDateKey(Date.now())
    if (sanitizedHistory[todayKey] === undefined) {
      sanitizedHistory[todayKey] = 0
    }

    const intervalMinutes = clampNumber(saved.intervalMinutes, 1, 1440, defaults.intervalMinutes)
    const snoozeMinutes = clampNumber(saved.snoozeMinutes, 1, 180, defaults.snoozeMinutes)
    const dailyGoal = clampNumber(saved.dailyGoal, 1, 200, defaults.dailyGoal)
    const notificationsEnabled = typeof saved.notificationsEnabled === 'boolean'
      ? saved.notificationsEnabled
      : defaults.notificationsEnabled
    const soundEnabled = typeof saved.soundEnabled === 'boolean'
      ? saved.soundEnabled
      : defaults.soundEnabled
    const voiceType = normalizeVoiceType(saved.voiceType ?? defaults.voiceType)
    const appearance = normalizeAppearance(saved.appearance)

    const enabled = typeof saved.enabled === 'boolean' ? saved.enabled : defaults.enabled
    const paused = typeof saved.paused === 'boolean' ? saved.paused : defaults.paused

    let nextReminderAt: number | null = null
    if (typeof saved.nextReminderAt === 'number' && Number.isFinite(saved.nextReminderAt)) {
      nextReminderAt = saved.nextReminderAt
    } else if (enabled && !paused) {
      nextReminderAt = Date.now() + intervalMinutes * 60 * 1000
    }

    let lastDrinkAt: number | null = null
    if (typeof saved.lastDrinkAt === 'number' && Number.isFinite(saved.lastDrinkAt)) {
      lastDrinkAt = saved.lastDrinkAt
    }

    return {
      enabled,
      paused,
      intervalMinutes,
      snoozeMinutes,
      notificationsEnabled,
      soundEnabled,
      voiceType,
      dailyGoal,
      appearance,
      nextReminderAt,
      lastDrinkAt,
      history: sanitizedHistory
    }
  }

  public async saveState(state: AquaDropState): Promise<void> {
    await this.memento.update(STATE_KEY, state)
  }

  public recordWaterBreak(state: AquaDropState, timestamp: number = Date.now()): AquaDropState {
    const todayKey = getDateKey(timestamp)
    const current = state.history[todayKey] ?? 0
    const updatedHistory = {
      ...state.history,
      [todayKey]: current + 1
    }

    return {
      ...state,
      lastDrinkAt: timestamp,
      history: updatedHistory
    }
  }

  public resetTodayProgress(state: AquaDropState, timestamp: number = Date.now()): AquaDropState {
    const todayKey = getDateKey(timestamp)
    const updatedHistory = {
      ...state.history,
      [todayKey]: 0
    }

    return {
      ...state,
      lastDrinkAt: null,
      history: updatedHistory
    }
  }

  public getTodayCount(state: AquaDropState, timestamp: number = Date.now()): number {
    const todayKey = getDateKey(timestamp)
    return state.history[todayKey] ?? 0
  }

  public getRecentHistory(state: AquaDropState, limit: number = 7): Array<{ date: string; count: number }> {
    return Object.keys(state.history)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, limit)
      .map((date) => ({
        date,
        count: state.history[date] ?? 0
      }))
  }
}
