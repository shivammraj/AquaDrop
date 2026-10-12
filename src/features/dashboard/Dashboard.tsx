import { useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  GlassWater,
  RotateCcw,
  Sparkles,
  Volume2,
  Sliders,
  ChevronRight
} from 'lucide-react'
import type { ReminderState } from '../../types/reminder'
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
  onIntervalChange
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
  const is1h = (state.intervalValue === 1 && state.intervalUnit === 'hours') || (state.intervalValue === 60 && state.intervalUnit === 'minutes')
  const is2h = (state.intervalValue === 2 && state.intervalUnit === 'hours') || (state.intervalValue === 120 && state.intervalUnit === 'minutes')

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Top 3 Cards Grid Matching Mockup Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card 1: Main Reminder Card (Top Left in Mockup) */}
        <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/90 p-7 shadow-[0_20px_60px_rgba(22,119,255,0.12)] backdrop-blur-2xl lg:col-span-6">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-sky-200/35 blur-3xl" />

          {/* Top Status Badge */}
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#60738F]">
              Current Reminder
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                state.enabled
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${state.enabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {state.enabled ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-6">
            {/* 3D Mascot */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 scale-95 rounded-full bg-sky-300/30 blur-xl animate-pulse" />
              <img
                src={mascotUrl}
                alt="AquaDrop mascot"
                className="relative h-28 w-28 drop-shadow-[0_14px_24px_rgba(22,119,255,0.3)] sm:h-32 sm:w-32"
              />
            </div>

            {/* Information & Actions */}
            <div className="flex flex-1 flex-col text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-[#102A56]">
                Drink water, stay hydrated.
              </h2>
              <p className="mt-1 text-sm font-medium text-[#60738F]">
                A small step for a healthier, happier you! 💙
              </p>

              {/* Live Seconds Countdown Timer */}
              <div className="mt-3.5 flex items-center gap-3 rounded-2xl border border-[#DCE8F7] bg-[#F1F8FF]/80 px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#1677FF] shadow-sm">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#60738F]">Next break in</div>
                  <div className="font-mono text-base font-bold tracking-tight text-[#102A56]">
                    {state.enabled && Number.isFinite(countdownMs) && countdownMs > 0 ? (
                      (() => {
                        const totalSecs = Math.floor(countdownMs / 1000)
                        const h = Math.floor(totalSecs / 3600)
                        const m = Math.floor((totalSecs % 3600) / 60)
                        const s = totalSecs % 60
                        if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
                        return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
                      })()
                    ) : state.enabled ? (
                      'Due now'
                    ) : (
                      'Reminders paused'
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {/* Button 1: I've drunk water */}
                <button
                  type="button"
                  onClick={onRecordDrink}
                  className="group flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#249BFF] to-[#1677FF] px-4 py-3 text-white shadow-[0_8px_20px_rgba(22,119,255,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_12px_28px_rgba(22,119,255,0.45)] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <GlassWater className="h-5 w-5" />
                    <span className="text-sm font-semibold">I&apos;ve drunk water</span>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#1677FF]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Button 2: Remind me later */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#DCE8F7] bg-white/90 px-4 py-2.5 text-[#102A56] shadow-sm transition hover:bg-sky-50/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-[#60738F]" />
                      <span className="text-xs font-semibold text-[#102A56]">Remind me later</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-[#60738F] transition-transform ${showSnoozeMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showSnoozeMenu && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#DCE8F7] bg-white p-1 shadow-xl animate-pop-in">
                      {[5, 10, 15, 30].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setShowSnoozeMenu(false)
                            onSnooze(m)
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#102A56] hover:bg-sky-50"
                        >
                          <span>In {m} minutes</span>
                          <span className="text-[10px] text-[#60738F]">Snooze</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Remind me every Quick Card (Top Middle in Mockup) */}
        <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(22,119,255,0.12)] backdrop-blur-2xl lg:col-span-3">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#102A56]" />
              <h3 className="text-sm font-bold text-[#102A56]">Remind me every</h3>
            </div>
            <button
              type="button"
              onClick={onOpenIntervalModal}
              className="text-xs font-bold text-[#1677FF] hover:underline"
            >
              Change
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {/* 30 minutes */}
            <button
              type="button"
              onClick={() => onIntervalChange(30, 'minutes')}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                is30m
                  ? 'border-[#249BFF]/60 bg-sky-100/70'
                  : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
              }`}
            >
              <span className="text-xs font-semibold text-[#102A56]">30 minutes</span>
              <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${is30m ? 'border-[#1677FF]' : 'border-[#DCE8F7]'}`}>
                {is30m && <div className="h-2 w-2 rounded-full bg-[#1677FF]" />}
              </div>
            </button>

            {/* 1 hour */}
            <button
              type="button"
              onClick={() => onIntervalChange(1, 'hours')}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                is1h
                  ? 'border-[#249BFF]/60 bg-sky-100/70'
                  : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
              }`}
            >
              <span className="text-xs font-semibold text-[#102A56]">1 hour</span>
              <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${is1h ? 'border-[#1677FF]' : 'border-[#DCE8F7]'}`}>
                {is1h && <div className="h-2 w-2 rounded-full bg-[#1677FF]" />}
              </div>
            </button>

            {/* 2 hours */}
            <button
              type="button"
              onClick={() => onIntervalChange(2, 'hours')}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                is2h
                  ? 'border-[#249BFF]/60 bg-sky-100/70'
                  : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
              }`}
            >
              <span className="text-xs font-semibold text-[#102A56]">2 hours</span>
              <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${is2h ? 'border-[#1677FF]' : 'border-[#DCE8F7]'}`}>
                {is2h && <div className="h-2 w-2 rounded-full bg-[#1677FF]" />}
              </div>
            </button>

            {/* Custom */}
            <button
              type="button"
              onClick={onOpenIntervalModal}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                !is30m && !is1h && !is2h
                  ? 'border-[#249BFF]/60 bg-sky-100/70'
                  : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
              }`}
            >
              <span className="text-xs font-semibold text-[#102A56]">
                Custom ({state.intervalValue} {state.intervalUnit})
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#60738F]" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenIntervalModal}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#249BFF] to-[#1677FF] py-2.5 text-xs font-bold text-white shadow-sm hover:scale-[1.01]"
          >
            Adjust Schedule
          </button>
        </div>

        {/* Card 3: Great! Keep it up / Daily Intake (Top Right in Mockup) */}
        <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(22,119,255,0.12)] backdrop-blur-2xl lg:col-span-3">
          <div className="flex flex-col items-center text-center">
            {/* Mascot with floating blue hearts */}
            <img
              src={celebrationUrl}
              alt="Hydration status"
              className="h-20 w-20 drop-shadow-[0_8px_16px_rgba(22,119,255,0.25)]"
            />
            <div className="mt-2 text-xl font-bold text-[#102A56]">Great! 💙</div>
            <div className="text-xs font-medium text-[#60738F]">Keep it up!</div>
          </div>

          {/* Water Intake Today Box */}
          <div className="mt-4 rounded-2xl border border-[#DCE8F7] bg-[#F1F8FF]/80 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm text-primary">
                <GlassWater className="h-4 w-4 text-[#1677FF]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#60738F]">
                  Water Intake Today
                </div>
                <div className="text-xs font-bold text-[#102A56]">
                  {glasses} / {targetGlasses} glasses ({todayTotal} mL)
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#DCE8F7]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#249BFF] to-[#1677FF] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onRecordDrink}
            className="mt-3.5 w-full rounded-xl border border-[#DCE8F7] bg-white py-2 text-xs font-bold text-[#1677FF] transition hover:bg-sky-50 shadow-sm"
          >
            + Log 1 Glass
          </button>
        </div>
      </div>

      {/* Floating Dark Notification Toast Preview trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-[#1677FF]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-[#102A56]">
            Preview modern dark notification banner from mockup
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowToastPreview(!showToastPreview)}
          className="rounded-xl bg-[#102A56] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#1E3A8A]"
        >
          {showToastPreview ? 'Hide Banner' : 'Show Banner'}
        </button>
      </div>

      {/* Center-Right Dark Notification Toast (if toggled) */}
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

      {/* Recent Logged Water History */}
      {state.hydrationHistory.length > 0 && (
        <div className="rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-md">
          <h4 className="text-sm font-bold text-[#102A56]">Today&apos;s Hydration Logs</h4>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {state.hydrationHistory.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-2 rounded-xl border border-[#DCE8F7] bg-[#F1F8FF] px-3 py-2 text-xs font-semibold text-[#102A56]"
              >
                <GlassWater className="h-3.5 w-3.5 text-[#1677FF]" />
                <span>{log.amount} mL</span>
                <span className="text-[10px] text-[#60738F]">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed / Prominent Bottom Center Dock Widget */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <CompactDockWidget
            enabled={state.enabled}
            countdownMs={countdownMs}
            totalIntervalMs={totalIntervalMs}
            onToggle={() => (state.enabled ? onPause() : onResume())}
            onOpenSettings={onOpenSettings}
            onOpenIntervalModal={onOpenIntervalModal}
          />
        </div>
      </div>
    </div>
  )
}
