import { useMemo, useState } from 'react'

const presetOptions = [
  { label: '30 minutes', value: 30, unit: 'minutes' },
  { label: '1 hour', value: 1, unit: 'hours' },
  { label: '2 hours', value: 2, unit: 'hours' }
] as const

type SettingsProps = {
  intervalValue: number
  intervalUnit: 'minutes' | 'hours'
  snoozeMinutes: number
  notificationsEnabled: boolean
  notificationSound: boolean
  trackingEnabled: boolean
  servingSize: number
  theme: 'light' | 'dark' | 'system'
  onIntervalChange: (value: number, unit: 'minutes' | 'hours') => void
  onSnoozeChange: (value: number) => void
  onNotificationsToggle: (value: boolean) => void
  onNotificationSoundToggle: (value: boolean) => void
  onTrackingToggle: (value: boolean) => void
  onServingSizeChange: (value: number) => void
  onThemeChange: (value: 'light' | 'dark' | 'system') => void
}

export default function Settings({
  intervalValue,
  intervalUnit,
  snoozeMinutes,
  notificationsEnabled,
  notificationSound,
  trackingEnabled,
  servingSize,
  theme,
  onIntervalChange,
  onSnoozeChange,
  onNotificationsToggle,
  onNotificationSoundToggle,
  onTrackingToggle,
  onServingSizeChange,
  onThemeChange
}: SettingsProps) {
  const [customValue, setCustomValue] = useState(intervalValue)
  const [customUnit, setCustomUnit] = useState(intervalUnit)
  const [error, setError] = useState('')

  const selectedLabel = useMemo(() => {
    if (intervalValue === 30 && intervalUnit === 'minutes') return '30 minutes'
    if (intervalValue === 60 && intervalUnit === 'minutes') return '1 hour'
    if (intervalValue === 120 && intervalUnit === 'minutes') return '2 hours'
    return `${intervalValue} ${intervalUnit}`
  }, [intervalValue, intervalUnit])

  const applyCustom = () => {
    const value = Number(customValue)

    if (!Number.isFinite(value) || value <= 0) {
      setError('Please enter a positive number.')
      return
    }

    if (customUnit === 'minutes' && value > 1440) {
      setError('Minutes must be 1440 or less.')
      return
    }

    if (customUnit === 'hours' && value > 24) {
      setError('Hours must be 24 or less.')
      return
    }

    setError('')
    onIntervalChange(value, customUnit)
  }

  return (
    <div className="rounded-[28px] border border-border bg-white/90 p-6 shadow-[0_14px_48px_rgba(16,42,86,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-secondaryText">Reminder setup</p>
          <h2 className="text-2xl font-semibold text-primaryText">Remind me every</h2>
        </div>
        <div className="rounded-full border border-border bg-sky-50 px-3 py-1.5 text-sm text-primary font-medium">
          {selectedLabel}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {presetOptions.map((preset) => {
          const active = preset.value === intervalValue && preset.unit === intervalUnit

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onIntervalChange(preset.value, preset.unit)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                active ? 'border-primary bg-sky-50 shadow-[0_8px_24px_rgba(22,119,255,0.12)]' : 'border-border bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-base font-medium text-primaryText">{preset.label}</div>
            </button>
          )
        })}

        <div className="rounded-2xl border border-border bg-white p-3">
          <div className="text-sm text-secondaryText">Custom</div>
          <div className="mt-3 flex gap-2">
            <input
              aria-label="Custom reminder interval value"
              type="number"
              min="1"
              max={customUnit === 'minutes' ? 1440 : 24}
              value={customValue}
              onChange={(e) => setCustomValue(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-sky-50 px-3 py-2 text-primaryText outline-none focus:border-primary"
            />
            <select
              aria-label="Custom reminder interval unit"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'hours')}
              className="rounded-xl border border-border bg-white px-3 py-2 text-primaryText outline-none focus:border-primary"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
          <button
            type="button"
            onClick={applyCustom}
            className="mt-3 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-accent"
          >
            Save custom
          </button>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-ice p-4">
          <div className="flex items-center justify-between text-sm text-secondaryText">
            <span>Notifications</span>
            <button
              type="button"
              onClick={() => onNotificationsToggle(!notificationsEnabled)}
              className={`relative h-7 w-12 rounded-full transition ${notificationsEnabled ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-secondaryText">
            <span>Notification sound</span>
            <button
              type="button"
              onClick={() => onNotificationSoundToggle(!notificationSound)}
              className={`relative h-7 w-12 rounded-full transition ${notificationSound ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${notificationSound ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-secondaryText">
            <span>Hydration tracking</span>
            <button
              type="button"
              onClick={() => onTrackingToggle(!trackingEnabled)}
              className={`relative h-7 w-12 rounded-full transition ${trackingEnabled ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${trackingEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-ice p-4">
          <div className="text-sm text-secondaryText">Theme</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onThemeChange(mode)}
                className={`rounded-xl border px-3 py-2 text-sm capitalize transition ${theme === mode ? 'border-primary bg-white text-primary font-medium' : 'border-border bg-white text-primaryText hover:bg-slate-50'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-sm text-secondaryText">Snooze duration</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={snoozeMinutes}
                onChange={(e) => onSnoozeChange(Number(e.target.value))}
                className="w-24 rounded-xl border border-border bg-white px-3 py-2 text-primaryText outline-none focus:border-primary"
              />
              <span className="text-sm text-secondaryText">minutes</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm text-secondaryText">Serving size</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="50"
                value={servingSize}
                onChange={(e) => onServingSizeChange(Number(e.target.value))}
                className="w-24 rounded-xl border border-border bg-white px-3 py-2 text-primaryText outline-none focus:border-primary"
              />
              <span className="text-sm text-secondaryText">mL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-sky-50 p-4 text-sm text-secondaryText">
        Browser notifications require HTTPS or localhost, and permission is granted only after explicit user action. If a browser blocks notifications, AquaDrop will keep scheduling reminders locally and show a clear explanation in the interface.
      </div>
    </div>
  )
}
