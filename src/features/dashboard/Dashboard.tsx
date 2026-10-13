import { useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  GlassWater,
  Sparkles,
  Volume2,
} from 'lucide-react'
import type { ReminderState } from '../../types/reminder'
import { playReminderSound } from '../../services/sound'
import mascotUrl from '../../assets/water-drop-mascot.svg'
import celebrationUrl from '../../assets/water-drop-celebration.svg'
import CompactDockWidget from './CompactDockWidget'
import DarkNotificationBanner from './DarkNotificationBanner'

type DashboardProps = {
  state: ReminderState
  countdownMs: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onOpenSettings: () => void
  onOpenIntervalModal: () => void
  onRecordDrink: () => void
  onSnooze: (minutes?: number) => void
  onIntervalChange: (value: number, unit: 'minutes' | 'hours') => void
  onDeleteHistory?: () => void
}

export default function Dashboard({
  state,
  countdownMs,
  onStart,
  onPause,
  onResume,
  onOpenSettings,
  onOpenIntervalModal,
  onRecordDrink,
  onSnooze,
  onIntervalChange,
  onDeleteHistory,
}: DashboardProps) {
  const [showToastPreview, setShowToastPreview] = useState(false)
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false)

  // Calculate today's intake metrics
  const todayTotal = state.hydrationHistory.reduce((sum, item) => sum + item.amount, 0)
  const servingSize = state.servingSize || 250
  const glasses = Math.floor(todayTotal / servingSize)
  const targetGlasses = 8
  const progressPercent = Math.min(100, Math.round((glasses / targetGlasses) * 100))

  const totalIntervalMs = state.intervalUnit === 'hours'
    ? state.intervalValue * 60 * 60 * 1000
    : state.intervalValue * 60 * 1000

  // Interval active state check
  const is30m = state.intervalValue === 30 && state.intervalUnit === 'minutes'
  const is1h  = (state.intervalValue === 1  && state.intervalUnit === 'hours') || (state.intervalValue === 60  && state.intervalUnit === 'minutes')
  const is2h  = (state.intervalValue === 2  && state.intervalUnit === 'hours') || (state.intervalValue === 120 && state.intervalUnit === 'minutes')

  // Format countdown
  const formatCountdown = (ms: number): string => {
    if (!Number.isFinite(ms) || ms <= 0) return 'Due now'
    const totalSecs = Math.floor(ms / 1000)
    const h = Math.floor(totalSecs / 3600)
    const m = Math.floor((totalSecs % 3600) / 60)
    const s = totalSecs % 60
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  }

  const cardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-card)',
    boxShadow: '0 20px 60px var(--color-card-shadow)',
  }

  const insetStyle = {
    background: 'var(--color-bg-inset)',
    border: '1px solid var(--color-border)',
  }

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* Top 3 Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card 1: Main Reminder Card */}
        <div
          className="relative overflow-hidden rounded-[36px] p-7 backdrop-blur-2xl lg:col-span-6"
          style={cardStyle}
        >
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'var(--color-aura-1)' }}
          />

          {/* Top Status Badge */}
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Current Reminder
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => playReminderSound(state.voiceType || 'female')}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--color-bg-card-solid)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-accent)',
                }}
                title="Play sound & voice preview"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Play Sound ({state.voiceType === 'male' ? 'Boy' : state.voiceType === 'chime-only' ? 'Chime' : 'Girl'})</span>
              </button>

              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={state.enabled
                  ? { background: 'rgba(36, 180, 126, 0.1)', color: '#15803D' }
                  : { background: 'rgba(243, 168, 71, 0.1)', color: '#B45309' }
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: state.enabled ? '#22C55E' : '#F59E0B' }}
                />
                {state.enabled ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-6">
            {/* Mascot */}
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 scale-95 rounded-full blur-xl animate-pulse"
                style={{ background: 'rgba(36, 155, 255, 0.25)' }}
              />
              <img
                src={mascotUrl}
                alt="AquaDrop mascot"
                className="relative h-28 w-28 drop-shadow-[0_14px_24px_rgba(22,119,255,0.3)] sm:h-32 sm:w-32"
              />
            </div>

            {/* Information & Actions */}
            <div className="flex flex-1 flex-col text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Drink water, stay hydrated.
              </h2>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                A small step for a healthier, happier you! 💙
              </p>

              {/* Live Countdown Timer */}
              <div className="mt-3.5 flex items-center gap-3 rounded-2xl px-4 py-2.5" style={insetStyle}>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: 'var(--color-bg-card-solid)', color: 'var(--color-accent)' }}
                >
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Next break in</div>
                  <div className="font-mono text-base font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                    {state.enabled
                      ? formatCountdown(countdownMs)
                      : 'Reminders paused'}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {/* I've drunk water */}
                <button
                  type="button"
                  onClick={onRecordDrink}
                  className="group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-white shadow-[0_8px_20px_rgba(22,119,255,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_12px_28px_rgba(22,119,255,0.45)] active:scale-[0.99]"
                  style={{ background: 'linear-gradient(to right, var(--color-accent-bright), var(--color-accent))' }}
                >
                  <div className="flex items-center gap-2.5">
                    <GlassWater className="h-5 w-5" />
                    <span className="text-sm font-semibold">I&apos;ve drunk water</span>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white" style={{ color: 'var(--color-accent)' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Remind me later — with delay drawer */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-2.5 shadow-sm transition hover:shadow-md"
                    style={{
                      background: 'var(--color-bg-card-solid)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                      <span className="text-xs font-semibold">Remind me later</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showSnoozeMenu ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--color-text-secondary)' }}
                    />
                  </button>

                  {/* Delay options drawer (rendered in-flow so it never clips inside the card) */}
                  {showSnoozeMenu && (
                    <div
                      className="mt-2.5 overflow-hidden rounded-2xl p-2 animate-pop-in"
                      style={{
                        background: 'var(--color-bg-inset)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div className="mb-1.5 px-1 text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        Postpone next break by:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[5, 10, 15, 30].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setShowSnoozeMenu(false)
                              onSnooze(m)
                            }}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              background: 'var(--color-bg-card-solid)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            <span>+{m} min</span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                              style={{
                                background: 'rgba(22, 119, 255, 0.12)',
                                color: 'var(--color-accent)',
                              }}
                            >
                              Delay
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Remind me every */}
        <div
          className="relative overflow-hidden rounded-[36px] p-6 backdrop-blur-2xl lg:col-span-3"
          style={cardStyle}
        >
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Remind me every</h3>
            </div>
            <button
              type="button"
              onClick={onOpenIntervalModal}
              className="text-xs font-bold transition hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Change
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {[
              { label: '30 minutes', active: is30m, onClick: () => onIntervalChange(30, 'minutes') },
              { label: '1 hour',     active: is1h,  onClick: () => onIntervalChange(1, 'hours') },
              { label: '2 hours',    active: is2h,  onClick: () => onIntervalChange(2, 'hours') },
            ].map(({ label, active, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition"
                style={active
                  ? { background: 'var(--color-accent-bg)', border: '1px solid var(--color-accent)', opacity: 1 }
                  : { background: 'var(--color-bg-card-solid)', border: '1px solid var(--color-border)' }
                }
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full border-2"
                  style={{ borderColor: active ? 'var(--color-accent)' : 'var(--color-border)' }}
                >
                  {active && <div className="h-2 w-2 rounded-full" style={{ background: 'var(--color-accent)' }} />}
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={onOpenIntervalModal}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition"
              style={
                !is30m && !is1h && !is2h
                  ? { background: 'var(--color-accent-bg)', border: '1px solid var(--color-accent)' }
                  : { background: 'var(--color-bg-card-solid)', border: '1px solid var(--color-border)' }
              }
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Custom ({state.intervalValue} {state.intervalUnit})
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>→</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenIntervalModal}
            className="mt-4 w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition hover:scale-[1.01]"
            style={{ background: 'linear-gradient(to right, var(--color-accent-bright), var(--color-accent))' }}
          >
            Adjust Schedule
          </button>
        </div>

        {/* Card 3: Daily Intake */}
        <div
          className="relative overflow-hidden rounded-[36px] p-6 backdrop-blur-2xl lg:col-span-3"
          style={cardStyle}
        >
          <div className="flex flex-col items-center text-center">
            <img
              src={celebrationUrl}
              alt="Hydration status"
              className="h-20 w-20 drop-shadow-[0_8px_16px_rgba(22,119,255,0.25)]"
            />
            <div className="mt-2 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Great! 💙</div>
            <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Keep it up!</div>
          </div>

          <div className="mt-4 rounded-2xl p-3.5" style={insetStyle}>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
                style={{ background: 'var(--color-bg-card-solid)', color: 'var(--color-accent)' }}
              >
                <GlassWater className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Water Intake Today
                </div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {glasses} / {targetGlasses} glasses ({todayTotal} mL)
                </div>
              </div>
            </div>

            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(to right, var(--color-accent-bright), var(--color-accent))',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onRecordDrink}
            className="mt-3.5 w-full rounded-xl py-2 text-xs font-bold transition hover:scale-[1.01] shadow-sm"
            style={{
              background: 'var(--color-bg-card-solid)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-accent)',
            }}
          >
            + Log 1 Glass
          </button>
        </div>
      </div>

      {/* Banner: Preview dark notification */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-3xl p-4 shadow-sm backdrop-blur-md"
        style={{
          background: 'var(--color-bg-nav)',
          border: '1px solid var(--color-border-card)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Preview dark notification banner
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowToastPreview(!showToastPreview)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition"
          style={{ background: '#102A56' }}
        >
          {showToastPreview ? 'Hide Banner' : 'Show Banner'}
        </button>
      </div>

      {/* Dark Notification Toast Preview */}
      {showToastPreview && (
        <div className="flex justify-center sm:justify-end animate-fade-in">
          <DarkNotificationBanner
            isOpen={showToastPreview}
            onRecordDrink={onRecordDrink}
            onSnooze={onSnooze}
            onClose={() => setShowToastPreview(false)}
          />
        </div>
      )}

      {/* Today's Hydration Logs — Displays all logged drinks */}
      <div
        className="rounded-[32px] p-6 shadow-sm backdrop-blur-md"
        style={{
          background: 'var(--color-bg-nav)',
          border: '1px solid var(--color-border-card)',
        }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h4 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Today&apos;s Hydration Logs
            </h4>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{
                background: 'rgba(22, 119, 255, 0.1)',
                color: 'var(--color-accent)',
              }}
            >
              {state.hydrationHistory.length} {state.hydrationHistory.length === 1 ? 'log' : 'logs'} · {todayTotal} mL
            </span>
          </div>

          {state.hydrationHistory.length > 0 && onDeleteHistory && (
            <button
              type="button"
              onClick={onDeleteHistory}
              className="text-[11px] font-semibold transition hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Clear all
            </button>
          )}
        </div>

        {state.hydrationHistory.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {state.hydrationHistory.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-1.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold shadow-sm transition hover:scale-[1.02]"
                style={insetStyle}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(22, 119, 255, 0.12)', color: 'var(--color-accent)' }}
                  >
                    <GlassWater className="h-3.5 w-3.5" />
                  </div>
                  <span style={{ color: 'var(--color-text-primary)' }}>{log.amount} mL</span>
                </div>
                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-2 rounded-2xl py-6 text-xs font-medium"
            style={insetStyle}
          >
            <GlassWater className="h-4 w-4 opacity-50" style={{ color: 'var(--color-accent)' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>
              No water logged yet today. Click &quot;I&apos;ve drunk water&quot; above to record your first glass!
            </span>
          </div>
        )}
      </div>

      {/* Bottom Dock Widget */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <CompactDockWidget
            enabled={state.enabled}
            countdownMs={countdownMs}
            totalIntervalMs={totalIntervalMs}
            onToggle={() => (state.enabled ? onPause() : (state.nextReminder ? onResume() : onStart()))}
            onOpenSettings={onOpenSettings}
            onOpenIntervalModal={onOpenIntervalModal}
          />
        </div>
      </div>
    </div>
  )
}
