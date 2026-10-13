import { useState } from 'react'
import { Clock, X, ChevronRight } from 'lucide-react'

type ReminderIntervalModalProps = {
  isOpen: boolean
  currentValue: number
  currentUnit: 'minutes' | 'hours'
  onSave: (value: number, unit: 'minutes' | 'hours') => void
  onClose: () => void
}

export default function ReminderIntervalModal({
  isOpen,
  currentValue,
  currentUnit,
  onSave,
  onClose,
}: ReminderIntervalModalProps) {
  const is30m = currentValue === 30 && currentUnit === 'minutes'
  const is1h  = (currentValue === 1  && currentUnit === 'hours') || (currentValue === 60  && currentUnit === 'minutes')
  const is2h  = (currentValue === 2  && currentUnit === 'hours') || (currentValue === 120 && currentUnit === 'minutes')
  const initialMode = is30m ? '30m' : is1h ? '1h' : is2h ? '2h' : 'custom'

  const [selectedMode, setSelectedMode] = useState<'30m' | '1h' | '2h' | 'custom'>(initialMode)
  const [customValue, setCustomValue] = useState(initialMode === 'custom' ? currentValue : 45)
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours'>(currentUnit)

  if (!isOpen) return null

  const handleSave = () => {
    if (selectedMode === '30m')     onSave(30, 'minutes')
    else if (selectedMode === '1h') onSave(1, 'hours')
    else if (selectedMode === '2h') onSave(2, 'hours')
    else {
      const val = Math.max(1, Number(customValue) || 30)
      onSave(val, customUnit)
    }
    onClose()
  }

  const modalCardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-card)',
    boxShadow: '0 25px 70px var(--color-card-shadow)',
  }

  const optionActiveStyle = {
    background: 'var(--color-accent-bg)',
    border: '1px solid var(--color-accent)',
    boxShadow: '0 2px 8px rgba(22,119,255,0.12)',
  }

  const optionIdleStyle = {
    background: 'var(--color-bg-card-solid)',
    border: '1px solid var(--color-border)',
  }

  const inputStyle = {
    background: 'var(--color-bg-input)',
    border: '1px solid var(--color-border-input)',
    color: 'var(--color-text-primary)',
  }

  const options = [
    { mode: '30m' as const, label: '30 minutes' },
    { mode: '1h'  as const, label: '1 hour' },
    { mode: '2h'  as const, label: '2 hours' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-[32px] p-6 backdrop-blur-2xl animate-pop-in"
        style={modalCardStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Remind me every</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 transition"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options */}
        <div className="mt-2 space-y-2.5">
          {options.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSelectedMode(mode)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition"
              style={selectedMode === mode ? optionActiveStyle : optionIdleStyle}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
              </div>
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition"
                style={selectedMode === mode
                  ? { borderColor: 'var(--color-accent)', background: 'var(--color-bg-card-solid)' }
                  : { borderColor: 'var(--color-border)', background: 'transparent' }
                }
              >
                {selectedMode === mode && (
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                )}
              </div>
            </button>
          ))}

          {/* Custom */}
          <div
            className="rounded-2xl transition"
            style={selectedMode === 'custom' ? optionActiveStyle : optionIdleStyle}
          >
            <button
              type="button"
              onClick={() => setSelectedMode('custom')}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Custom</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${selectedMode === 'custom' ? 'rotate-90' : ''}`}
                style={{ color: selectedMode === 'custom' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
              />
            </button>

            {selectedMode === 'custom' && (
              <div
                className="px-4 pb-4 pt-3 animate-fade-in"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={customUnit === 'minutes' ? 1440 : 24}
                    value={customValue}
                    onChange={(e) => setCustomValue(Number(e.target.value))}
                    className="w-24 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
                    style={inputStyle}
                  />
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'hours')}
                    className="rounded-xl px-3 py-2 text-sm font-semibold outline-none"
                    style={inputStyle}
                  >
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="mt-6 w-full rounded-2xl py-3.5 text-center text-base font-semibold text-white shadow-[0_8px_20px_rgba(22,119,255,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(to right, var(--color-accent-bright), var(--color-accent))' }}
        >
          Save
        </button>
      </div>
    </div>
  )
}
