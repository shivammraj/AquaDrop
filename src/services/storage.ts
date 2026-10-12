import { useEffect, useState } from 'react'
import { reminderEngine } from '../services/reminder-engine'
import type { ReminderState } from '../types/reminder'

export function useReminder() {
  const [state, setState] = useState<ReminderState>(() => reminderEngine.getCurrentState())

  useEffect(() => {
    const sync = () => setState(reminderEngine.getCurrentState())
    reminderEngine.on('change', sync)
    return () => reminderEngine.off('change', sync)
  }, [])

  return {
    state,
    start: () => reminderEngine.start(),
    pause: () => reminderEngine.pause(),
    resume: () => reminderEngine.resume(),
    snooze: () => reminderEngine.snooze(),
    dismiss: () => reminderEngine.dismiss(),
    recordDrink: () => reminderEngine.recordDrink(),
    setInterval: (value: number, unit: ReminderState['intervalUnit']) => reminderEngine.setInterval(value, unit),
    setSnoozeMinutes: (value: number) => reminderEngine.setSnoozeMinutes(value),
    setNotificationsEnabled: (value: boolean) => reminderEngine.setNotificationsEnabled(value),
    setNotificationSound: (value: boolean) => reminderEngine.setNotificationSound(value),
    setTrackingEnabled: (value: boolean) => reminderEngine.setTrackingEnabled(value),
    setServingSize: (value: number) => reminderEngine.setServingSize(value),
    setTheme: (value: ReminderState['theme']) => reminderEngine.setTheme(value),
    ensureNotificationPermission: () => reminderEngine.ensureNotificationPermission(),
    getMsToNext: () => reminderEngine.getMsToNext()
  }
}
