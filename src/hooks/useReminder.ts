import { useEffect, useState } from 'react'
import { reminderEngine } from '../services/reminder-engine'
import type { ReminderState } from '../types/reminder'

export function useReminder() {
  const [state, setState] = useState<ReminderState>(() => reminderEngine.getCurrentState())
  const [nextIn, setNextIn] = useState<string>('—')

  useEffect(() => {
    const sync = () => setState(reminderEngine.getCurrentState())
    reminderEngine.on('change', sync)

    const tick = () => {
      const ms = reminderEngine.getMsToNext()
      if (!Number.isFinite(ms) || ms <= 0) {
        setNextIn('Due')
      } else {
        const m = Math.floor(ms / 60000)
        const s = Math.floor((ms % 60000) / 1000)
        setNextIn(`${m}m ${s}s`)
      }
    }

    tick()
    const timer = window.setInterval(tick, 1000)

    return () => {
      reminderEngine.off('change', sync)
      window.clearInterval(timer)
    }
  }, [])

  return {
    state,
    nextIn,
    start: () => reminderEngine.start(),
    pause: () => reminderEngine.pause(),
    resume: () => reminderEngine.resume(),
    toggle: () => (reminderEngine.getCurrentState().enabled ? reminderEngine.pause() : reminderEngine.start()),
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
    ensurePermission: () => reminderEngine.ensureNotificationPermission(),
    getMsToNext: () => reminderEngine.getMsToNext()
  }
}
