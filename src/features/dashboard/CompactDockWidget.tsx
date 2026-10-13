import { Play, Pause, Settings as SettingsIcon, GlassWater } from 'lucide-react'

type CompactDockWidgetProps = {
  enabled: boolean
  countdownMs: number
  totalIntervalMs: number
  onToggle: () => void
  onOpenSettings: () => void
  onOpenIntervalModal: () => void
}

export default function CompactDockWidget({
  enabled,
  countdownMs,
  totalIntervalMs,
  onToggle,
  onOpenSettings,
  onOpenIntervalModal,
}: CompactDockWidgetProps) {
  const formatTimePill = (ms: number): string => {
    if (!enabled || !Number.isFinite(ms) || ms <= 0) return '00:00'
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const fractionLeft = totalIntervalMs > 0 && Number.isFinite(countdownMs)
    ? Math.max(0, Math.min(1, countdownMs / totalIntervalMs))
    : 0

  return (
    <div
      className="flex items-center gap-4 rounded-full px-5 py-3 backdrop-blur-xl transition-all"
      style={{
        background: 'var(--color-bg-dock)',
        border: '1px solid var(--color-border-card)',
        boxShadow: '0 14px 45px var(--color-dock-shadow)',
      }}
    >
      {/* Water Glass Icon */}
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner"
        style={{
          background: 'var(--color-bg-inset)',
          color: 'var(--color-accent)',
        }}
      >
        <GlassWater className="h-6 w-6" />
      </div>

      {/* Countdown Info */}
      <div
        onClick={onOpenIntervalModal}
        className="cursor-pointer text-left select-none"
        title="Click to adjust interval"
      >
        <div className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          Next reminder in
        </div>
        <div className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {enabled ? formatTimePill(countdownMs) : 'Paused'}
        </div>
        {/* Mini progress line */}
        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: enabled ? `${fractionLeft * 100}%` : '0%',
              background: 'linear-gradient(to right, var(--color-accent-bright), var(--color-accent))',
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pl-2">
        {/* Play/Pause */}
        <button
          type="button"
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[0_4px_14px_rgba(22,119,255,0.4)] transition hover:scale-105 active:scale-95"
          style={{ background: 'var(--color-accent)' }}
          aria-label={enabled ? 'Pause reminders' : 'Start reminders'}
        >
          {enabled
            ? <Pause className="h-4 w-4 fill-white" />
            : <Play className="h-4 w-4 fill-white pl-0.5" />}
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-full transition"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Open settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
