import { ReminderState } from '../types/reminder'

const STORAGE_KEY = 'aquadrop:reminder-state'

export function saveState(state: ReminderState){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadState(): ReminderState{
  const raw = localStorage.getItem(STORAGE_KEY)
  if(!raw){
    const def: ReminderState = {
      enabled: false,
      intervalValue: 60,
      intervalUnit: 'minutes',
      nextReminder: null,
      snoozeMinutes: 10,
      notificationsEnabled: true
    }
    saveState(def)
    return def
  }
  try {
    return JSON.parse(raw) as ReminderState
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return loadState()
  }
}
