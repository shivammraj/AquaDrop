import { useState } from 'react'
import { Bell, Clock, Volume2, GlassWater, Sliders, Play } from 'lucide-react'
import { playReminderSound, playWaterChime } from '../../services/sound'
import type { VoiceType } from '../../types/reminder'

type RemindersScreenProps = {
  intervalValue: number
  intervalUnit: 'minutes' | 'hours'
  snoozeMinutes: number
  notificationsEnabled: boolean
  notificationSound: boolean
  voiceType?: VoiceType
  trackingEnabled: boolean
  servingSize: number
  onIntervalChange: (value: number, unit: 'minutes' | 'hours') => void
  onSnoozeChange: (value: number) => void
  onNotificationsToggle: (value: boolean) => void
  onNotificationSoundToggle: (value: boolean) => void
  onVoiceTypeChange?: (value: VoiceType) => void
  onTrackingToggle: (value: boolean) => void
  onServingSizeChange: (value: number) => void
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="relative h-7 w-12 flex-shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: enabled ? 'var(--color-accent)' : 'var(--color-toggle-off)',
        outlineColor: 'var(--color-accent)',
      }}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
        style={{ left: enabled ? '1.375rem' : '0.25rem' }}
      />
    </button>
  )
}

export default function RemindersScreen({
  intervalValue,
  intervalUnit,
  snoozeMinutes,
  notificationsEnabled,
  notificationSound,
  voiceType = 'female',
  trackingEnabled,
  servingSize,
  onIntervalChange,
  onSnoozeChange,
  onNotificationsToggle,
  onNotificationSoundToggle,
  onVoiceTypeChange,
  onTrackingToggle,
  onServingSizeChange,
}: RemindersScreenProps) {
  const is30m = intervalValue === 30 && intervalUnit === 'minutes'
  const is1h  = (intervalValue === 1 && intervalUnit === 'hours') || (intervalValue === 60 && intervalUnit === 'minutes')
  const is2h  = (intervalValue === 2 && intervalUnit === 'hours') || (intervalValue === 120 && intervalUnit === 'minutes')
  const isCustom = !is30m && !is1h && !is2h

  const [customMinutes, setCustomMinutes] = useState(
    intervalUnit === 'hours' ? intervalValue * 60 : intervalValue
  )

  const handleCustomChange = (val: number) => {
    const mins = Math.max(1, Math.min(1440, val || 1))
    setCustomMinutes(mins)
    onIntervalChange(mins, 'minutes')
  }

  const notifPermission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'

  const cardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  const insetStyle = {
    background: 'var(--color-bg-inset)',
    border: '1px solid var(--color-border)',
  }

  const inputStyle = {
    background: 'var(--color-bg-input)',
    border: '1px solid var(--color-border-input)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-[36px] shadow-[0_20px_60px_var(--color-card-shadow)] backdrop-blur-2xl animate-fade-in"
      style={cardStyle}
    >
      <div className="p-6 sm:p-8 space-y-8">
        {/* Section: Reminder Interval */}
        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
            >
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Reminder Interval</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>How often should AquaDrop remind you?</p>
            </div>
          </div>

          {/* Preset Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: '30', sub: 'minutes', active: is30m, onClick: () => onIntervalChange(30, 'minutes') },
              { label: '1',  sub: 'hour',    active: is1h,  onClick: () => onIntervalChange(1, 'hours') },
              { label: '2',  sub: 'hours',   active: is2h,  onClick: () => onIntervalChange(2, 'hours') },
            ].map(({ label, sub, active, onClick }) => (
              <button
                key={`${label}-${sub}`}
                type="button"
                onClick={onClick}
                className="flex flex-col items-center justify-center rounded-2xl border p-5 transition"
                style={active
                  ? { background: 'var(--color-accent-bg)', borderColor: 'var(--color-accent)', boxShadow: '0 4px 16px rgba(22,119,255,0.18)' }
                  : { background: 'var(--color-bg-card-solid)', borderColor: 'var(--color-border)' }
                }
              >
                <Clock className="h-5 w-5" style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} />
                <span className="mt-2 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{sub}</span>
              </button>
            ))}

            {/* Custom */}
            <button
              type="button"
              onClick={() => handleCustomChange(customMinutes)}
              className="flex flex-col items-center justify-center rounded-2xl border p-5 transition"
              style={isCustom
                ? { background: 'var(--color-accent-bg)', borderColor: 'var(--color-accent)', boxShadow: '0 4px 16px rgba(22,119,255,0.18)' }
                : { background: 'var(--color-bg-card-solid)', borderColor: 'var(--color-border)' }
              }
            >
              <Sliders className="h-5 w-5" style={{ color: isCustom ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} />
              <span className="mt-2 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Custom</span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{customMinutes}m</span>
            </button>
          </div>

          {/* Custom Input Row */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Custom Interval</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1440"
                value={customMinutes}
                onChange={(e) => handleCustomChange(Number(e.target.value))}
                className="w-20 rounded-xl px-3 py-1.5 text-center text-sm font-bold outline-none transition focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>minutes</span>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />

        {/* Section: Snooze & Serving Size */}
        <section>
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Preferences</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Snooze Duration */}
            <div className="rounded-2xl p-5" style={insetStyle}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Snooze Duration
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={snoozeMinutes}
                  onChange={(e) => onSnoozeChange(Number(e.target.value))}
                  className="w-24 rounded-xl px-3 py-2 text-base font-bold outline-none"
                  style={inputStyle}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>minutes</span>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                How long to wait when you choose "Remind me later". Default is 5 min.
              </p>
              {/* Quick snooze presets */}
              <div className="mt-3 flex gap-2">
                {[5, 10, 15].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onSnoozeChange(m)}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold transition"
                    style={snoozeMinutes === m
                      ? { background: 'var(--color-accent)', color: '#fff' }
                      : { background: 'var(--color-bg-card-solid)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }
                    }
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Serving Size */}
            <div className="rounded-2xl p-5" style={insetStyle}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Serving Size
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={servingSize}
                  onChange={(e) => onServingSizeChange(Number(e.target.value))}
                  className="w-24 rounded-xl px-3 py-2 text-base font-bold outline-none"
                  style={inputStyle}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>mL per glass</span>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Standard 250 mL = 1 glass of water
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />

        {/* Section: Notifications & Sound */}
        <section className="space-y-3">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Notifications & Sound</h3>

          {/* Notification permission status */}
          {notifPermission === 'denied' && (
            <div
              className="flex items-start gap-3 rounded-2xl p-4 text-sm"
              style={{ background: 'rgba(243, 168, 71, 0.12)', border: '1px solid rgba(243, 168, 71, 0.3)', color: '#B45309' }}
            >
              <Bell className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <div className="font-bold">Notifications blocked</div>
                <div className="text-xs mt-0.5 opacity-80">
                  Browser notifications are blocked. Open your browser settings (🔒 icon in the address bar) and allow notifications for this site to receive reminders when you're in another tab.
                </div>
              </div>
            </div>
          )}

          {notifPermission === 'default' && (
            <div
              className="flex items-center justify-between rounded-2xl p-4"
              style={insetStyle}
            >
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Grant notification permission</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Required for browser notifications when you switch tabs</div>
              </div>
              <button
                type="button"
                onClick={() => Notification.requestPermission()}
                className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                style={{ background: 'var(--color-accent)' }}
              >
                Allow
              </button>
            </div>
          )}

          {notifPermission === 'granted' && (
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold"
              style={{ background: 'rgba(36, 180, 126, 0.1)', border: '1px solid rgba(36, 180, 126, 0.25)', color: '#15803D' }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Notifications granted — browser reminders active
            </div>
          )}

          {/* Toggles */}
          {[
            {
              icon: <Bell className="h-5 w-5" />,
              label: 'Show notifications',
              sub: 'Get browser reminder pop-ups',
              value: notificationsEnabled,
              onToggle: () => onNotificationsToggle(!notificationsEnabled),
            },
            {
              icon: <Volume2 className="h-5 w-5" />,
              label: 'Play sound & voice',
              sub: 'Play a water drop chime and spoken voice alert',
              value: notificationSound,
              onToggle: () => {
                const next = !notificationSound
                onNotificationSoundToggle(next)
                if (next) playReminderSound(voiceType)
              },
            },
            {
              icon: <GlassWater className="h-5 w-5" />,
              label: 'Track daily intake',
              sub: 'Record and count your water glasses',
              value: trackingEnabled,
              onToggle: () => onTrackingToggle(!trackingEnabled),
            },
          ].map(({ icon, label, sub, value, onToggle }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl border border-transparent p-3 transition"
              style={{ ':hover': { background: 'var(--color-bg-hover)' } } as React.CSSProperties}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
                >
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{sub}</div>
                </div>
              </div>
              <Toggle enabled={value} onToggle={onToggle} />
            </div>
          ))}

          {/* Spoken Voice Reminder Selector */}
          {notificationSound && (
            <div className="mt-3 rounded-2xl p-4 animate-fade-in" style={insetStyle}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Spoken Voice Alert
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Speaks: &ldquo;Drink water, stay hydrated, and continue your work!&rdquo;
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => playReminderSound(voiceType)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition hover:scale-105 active:scale-95"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}
                  title="Test current sound and voice"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play Test</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'female', label: '👧 Girl Voice', sub: 'Friendly & warm' },
                  { id: 'male',   label: '👦 Boy Voice',  sub: 'Encouraging & clear' },
                  { id: 'chime-only', label: '🔔 Chime Only', sub: 'Bubble chime only' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (onVoiceTypeChange) onVoiceTypeChange(opt.id as VoiceType)
                      playReminderSound(opt.id as VoiceType)
                    }}
                    className="flex flex-col items-start rounded-xl p-3 text-left transition hover:scale-[1.02] active:scale-[0.98]"
                    style={
                      voiceType === opt.id
                        ? {
                            background: 'var(--color-accent)',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)',
                          }
                        : {
                            background: 'var(--color-bg-card-solid)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }
                    }
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span
                      className="text-[10px] mt-0.5 font-medium"
                      style={{ color: voiceType === opt.id ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)' }}
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section: Focus Mode (documented future feature) */}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />
        <section>
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-bg-inset)', border: '1px dashed var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Coming Soon
              </span>
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Focus Mode & Quiet Hours</div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Pause reminders during focused work sessions or set daily quiet hours.
              These features are planned for the next update.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
