import { useEffect, useState } from 'react'
import { reminderEngine } from '../services/reminder-engine'
import type { ReminderState } from '../types/reminder'

export function useReminder() {
  const [state, setState] = useState<ReminderState>(() => reminderEngine.getCurrentState())
  const [countdownMs, setCountdownMs] = useState<number>(() => reminderEngine.getMsToNext())
  const [nextIn, setNextIn] = useState<string>('—')

  useEffect(() => {
    const sync = () => {
      setState(reminderEngine.getCurrentState())
      setCountdownMs(reminderEngine.getMsToNext())
    }
    reminderEngine.on('change', sync)

    const tick = () => {
      const ms = reminderEngine.getMsToNext()
      setCountdownMs(ms)

      if (!Number.isFinite(ms) || ms <= 0) {
        setNextIn('Due')
      } else {
        const totalSecs = Math.floor(ms / 1000)
        const h = Math.floor(totalSecs / 3600)
        const m = Math.floor((totalSecs % 3600) / 60)
        const s = totalSecs % 60
        if (h > 0) {
          setNextIn(`${h}h ${m}m ${s}s`)
        } else {
          setNextIn(`${m}m ${s}s`)
        }
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
    countdownMs,
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
