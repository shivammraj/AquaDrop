import type { ReminderState } from '../types/reminder'

export const STORAGE_KEY = 'aquadrop.state.v1'

export const DEFAULT_REMINDER_STATE: ReminderState = {
  enabled: false,
  intervalValue: 30,
  intervalUnit: 'minutes',
  nextReminder: null,
  snoozeMinutes: 10,
  notificationsEnabled: true,
  notificationSound: true,
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
    trackingEnabled: Boolean(value.trackingEnabled ?? base.trackingEnabled),
    servingSize: Number.isFinite(Number(value.servingSize)) && Number(value.servingSize) > 0 ? Number(value.servingSize) : base.servingSize,
    hydrationHistory: Array.isArray(value.hydrationHistory) ? value.hydrationHistory : base.hydrationHistory,
    reminderOpen: Boolean(value.reminderOpen ?? base.reminderOpen),
    theme: value.theme === 'dark' || value.theme === 'light' ? value.theme : 'system'
  }
}

export function loadReminderState(): ReminderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_REMINDER_STATE }
    return sanitizeReminderState(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_REMINDER_STATE }
  }
}

export function saveReminderState(state: ReminderState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures gracefully.
  }
}
