import React from 'react'
import { useReminder } from '../../hooks/useReminder'

export default function ReminderCard(){
  const { state, start, pause, nextIn, toggle, ensurePermission } = useReminder()

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/src/assets/water-drop-icon.svg" alt="mascot" className="w-16 h-16" />
          <div>
            <div className="text-sm text-secondaryText">Status</div>
            <div className="text-lg font-medium">{state.enabled ? 'Active' : 'Paused'}</div>
            <div className="text-sm text-secondaryText mt-1">Next: {state.nextReminder ? new Date(state.nextReminder).toLocaleTimeString() : '—'}</div>
          </div>
        </div>
        <div>
          {state.enabled ? (
            <button onClick={pause} className="bg-white border border-border px-4 py-2 rounded-xl">Pause Reminders</button>
          ) : (
            <button onClick={() => { ensurePermission(); start() }} className="bg-primary text-white px-4 py-2 rounded-xl">Start Reminders</button>
          )}
        </div>
      </div>
      <div className="mt-6">
        <div className="text-sm text-secondaryText">Interval</div>
        <div className="mt-2 font-medium">{state.intervalValue} {state.intervalUnit}</div>
        <div className="mt-4 text-sm text-secondaryText">Countdown: {nextIn}</div>
      </div>
    </div>
  )
}
