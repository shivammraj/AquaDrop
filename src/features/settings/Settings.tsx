import { useMemo } from 'react'
import type { ReminderState } from '../../types/reminder'

function formatCountdown(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return 'Due now'

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function formatTime(timestamp: number | null): string {
  if (!timestamp) return 'Not scheduled'
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

type DashboardProps = {
  state: ReminderState
  countdownMs: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onOpenSettings: () => void
  onRecordDrink: () => void
}

export default function Dashboard({
  state,
  countdownMs,
  onStart,
  onPause,
  onResume,
  onOpenSettings,
  onRecordDrink
}: DashboardProps) {
  const todayTotal = useMemo(
    () => state.hydrationHistory.reduce((sum, item) => sum + item.amount, 0),
    [state.hydrationHistory]
  )

  const upcomingLabel = state.enabled ? 'Next reminder' : 'Reminder paused'

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.7fr]">
      <section className="rounded-[28px] border border-border bg-white/85 p-6 shadow-[0_14px_48px_rgba(16,42,86,0.06)] backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src="/water-drop-mascot.svg" alt="AquaDrop mascot" className="h-16 w-16 md:h-20 md:w-20" />
            <div>
              <p className="text-sm font-medium text-secondaryText">Stay refreshed.</p>
              <h1 className="text-3xl font-semibold text-primaryText md:text-4xl">Drink water, stay hydrated.</h1>
              <p className="mt-1 text-sm text-secondaryText">Small sips. Better breaks.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-ice px-3 py-2">
            <span className={`h-2.5 w-2.5 rounded-full ${state.enabled ? 'bg-success' : 'bg-warning'}`} />
            <span className="text-sm font-medium text-primaryText">{state.enabled ? 'Active' : 'Paused'}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[24px] border border-border bg-gradient-to-br from-sky-50 to-white p-5">
            <div className="flex items-center justify-between text-sm text-secondaryText">
              <span>Selected interval</span>
              <span className="font-medium text-primaryText">{state.intervalValue} {state.intervalUnit}</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-primaryText">{formatCountdown(countdownMs)}</span>
              <span className="text-sm text-secondaryText">to next reminder</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {state.enabled ? (
                <button onClick={onPause} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-primaryText shadow-sm transition hover:bg-slate-50">
                  Pause reminders
                </button>
              ) : (
                <button onClick={onResume} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(22,119,255,0.2)] transition hover:bg-accent">
                  Start reminders
                </button>
              )}

              <button onClick={onOpenSettings} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-primaryText transition hover:bg-slate-50">
                Settings
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-white p-5">
            <p className="text-sm text-secondaryText">{upcomingLabel}</p>
            <p className="mt-3 text-2xl font-semibold text-primaryText">{formatTime(state.nextReminder)}</p>
            <div className="mt-5 space-y-3 text-sm text-secondaryText">
              <div className="flex items-center justify-between">
                <span>Sound</span>
                <span className="font-medium text-primaryText">{state.notificationSound ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tracking</span>
                <span className="font-medium text-primaryText">{state.trackingEnabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-[28px] border border-border bg-white/85 p-5 shadow-[0_14px_48px_rgba(16,42,86,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondaryText">Hydration</p>
            <h2 className="text-xl font-semibold text-primaryText">Today</h2>
          </div>
          <button onClick={onRecordDrink} className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-primary">
            Log water
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-primaryText">{todayTotal} mL</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-sky-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((todayTotal / 2000) * 100, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-secondaryText">{state.servingSize} mL per recorded drink</p>
        </div>

        <div className="mt-6 space-y-3">
          {state.hydrationHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-sky-50 p-4 text-sm text-secondaryText">
              No drinks logged yet.
            </div>
          ) : (
            state.hydrationHistory.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-border bg-ice px-3 py-2 text-sm">
                <span className="font-medium text-primaryText">{entry.amount} mL</span>
                <span className="text-secondaryText">{formatDate(entry.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
