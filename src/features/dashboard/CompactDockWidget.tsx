import { useState } from 'react'
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
  onOpenIntervalModal
}: CompactDockWidgetProps) {
  // Format MM:SS for the compact pill
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
    /* Bottom-Center Mockup Design: Compact Dock Capsule */
    <div className="flex items-center gap-4 rounded-full border border-white/80 bg-white/95 px-5 py-3 shadow-[0_14px_45px_rgba(22,119,255,0.18)] backdrop-blur-xl transition-all hover:shadow-[0_18px_55px_rgba(22,119,255,0.24)]">
      {/* Animated Water Glass Icon */}
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 text-[#1677FF] shadow-inner">
        <GlassWater className="h-6 w-6 text-[#1677FF]" />
      </div>

      {/* Countdown Info */}
      <div
        onClick={onOpenIntervalModal}
        className="cursor-pointer text-left select-none"
        title="Click to adjust interval"
      >
        <div className="text-[11px] font-semibold text-[#60738F]">Next reminder in</div>
        <div className="text-xl font-bold tracking-tight text-[#102A56]">
          {enabled ? formatTimePill(countdownMs) : 'Paused'}
        </div>
        {/* Mini progress line */}
        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[#E2EEFC]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#249BFF] to-[#1677FF] transition-all duration-500"
            style={{ width: enabled ? `${fractionLeft * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pl-2">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1677FF] text-white shadow-[0_4px_14px_rgba(22,119,255,0.4)] transition hover:scale-105 hover:bg-[#249BFF] active:scale-95"
          aria-label={enabled ? 'Pause reminders' : 'Start reminders'}
        >
          {enabled ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white pl-0.5" />}
        </button>

        {/* Settings Gear Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#60738F] transition hover:bg-slate-100 hover:text-[#102A56]"
          aria-label="Open settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
