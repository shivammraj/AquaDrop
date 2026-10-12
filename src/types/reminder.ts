export type IntervalUnit = 'minutes' | 'hours'

export type ReminderState = {
  enabled: boolean
  intervalValue: number
  intervalUnit: IntervalUnit
  nextReminder: number | null
  snoozeMinutes: number
  notificationsEnabled: boolean
}
