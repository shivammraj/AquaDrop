export type ReminderIntervalUnit = 'minutes' | 'hours'
export type ThemeMode = 'light' | 'dark' | 'system'

export type HydrationEntry = {
  id: number
  amount: number
  timestamp: number
}

export interface ReminderState {
  enabled: boolean
  intervalValue: number
  intervalUnit: ReminderIntervalUnit
  nextReminder: number | null
  snoozeMinutes: number
  notificationsEnabled: boolean
  notificationSound: boolean
  trackingEnabled: boolean
  servingSize: number
  hydrationHistory: HydrationEntry[]
  reminderOpen: boolean
  theme: ThemeMode
}
