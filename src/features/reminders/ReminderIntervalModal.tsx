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
  onClose
}: ReminderIntervalModalProps) {
  // Determine selected preset
  const is30m = currentValue === 30 && currentUnit === 'minutes'
  const is1h = (currentValue === 1 && currentUnit === 'hours') || (currentValue === 60 && currentUnit === 'minutes')
  const is2h = (currentValue === 2 && currentUnit === 'hours') || (currentValue === 120 && currentUnit === 'minutes')
  const initialMode = is30m ? '30m' : is1h ? '1h' : is2h ? '2h' : 'custom'

  const [selectedMode, setSelectedMode] = useState<'30m' | '1h' | '2h' | 'custom'>(initialMode)
  const [customValue, setCustomValue] = useState(
    initialMode === 'custom' ? currentValue : 45
  )
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours'>(currentUnit)

  if (!isOpen) return null

  const handleSave = () => {
    if (selectedMode === '30m') {
      onSave(30, 'minutes')
    } else if (selectedMode === '1h') {
      onSave(1, 'hours')
    } else if (selectedMode === '2h') {
      onSave(2, 'hours')
    } else {
      const val = Math.max(1, Number(customValue) || 30)
      onSave(val, customUnit)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md animate-fade-in">
      {/* Top Middle Card: Remind me every */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-[0_25px_70px_rgba(22,119,255,0.22)] backdrop-blur-2xl animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-[#102A56]" />
            <h3 className="text-lg font-bold text-[#102A56]">Remind me every</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="mt-2 space-y-2.5">
          {/* 30 minutes */}
          <button
            type="button"
            onClick={() => setSelectedMode('30m')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
              selectedMode === '30m'
                ? 'border-[#249BFF]/60 bg-sky-100/70 shadow-sm'
                : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-[#60738F]" />
              <span className="text-sm font-semibold text-[#102A56]">30 minutes</span>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                selectedMode === '30m'
                  ? 'border-[#1677FF] bg-white'
                  : 'border-[#DCE8F7] bg-transparent'
              }`}
            >
              {selectedMode === '30m' && (
                <div className="h-2.5 w-2.5 rounded-full bg-[#1677FF]" />
              )}
            </div>
          </button>

          {/* 1 hour */}
          <button
            type="button"
            onClick={() => setSelectedMode('1h')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
              selectedMode === '1h'
                ? 'border-[#249BFF]/60 bg-sky-100/70 shadow-sm'
                : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-[#60738F]" />
              <span className="text-sm font-semibold text-[#102A56]">1 hour</span>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                selectedMode === '1h'
                  ? 'border-[#1677FF] bg-white'
                  : 'border-[#DCE8F7] bg-transparent'
              }`}
            >
              {selectedMode === '1h' && (
                <div className="h-2.5 w-2.5 rounded-full bg-[#1677FF]" />
              )}
            </div>
          </button>

          {/* 2 hours */}
          <button
            type="button"
            onClick={() => setSelectedMode('2h')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
              selectedMode === '2h'
                ? 'border-[#249BFF]/60 bg-sky-100/70 shadow-sm'
                : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-[#60738F]" />
              <span className="text-sm font-semibold text-[#102A56]">2 hours</span>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                selectedMode === '2h'
                  ? 'border-[#1677FF] bg-white'
                  : 'border-[#DCE8F7] bg-transparent'
              }`}
            >
              {selectedMode === '2h' && (
                <div className="h-2.5 w-2.5 rounded-full bg-[#1677FF]" />
              )}
            </div>
          </button>

          {/* Custom */}
          <div
            className={`rounded-2xl border transition ${
              selectedMode === 'custom'
                ? 'border-[#249BFF]/60 bg-sky-100/70 shadow-sm'
                : 'border-[#DCE8F7] bg-white hover:bg-sky-50/50'
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedMode('custom')}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#60738F]" />
                <span className="text-sm font-semibold text-[#102A56]">Custom</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 text-[#60738F] transition-transform ${
                  selectedMode === 'custom' ? 'rotate-90 text-[#1677FF]' : ''
                }`}
              />
            </button>

            {selectedMode === 'custom' && (
              <div className="border-t border-[#DCE8F7]/60 px-4 pb-4 pt-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={customUnit === 'minutes' ? 1440 : 24}
                    value={customValue}
                    onChange={(e) => setCustomValue(Number(e.target.value))}
                    className="w-24 rounded-xl border border-[#DCE8F7] bg-white px-3 py-2 text-sm font-semibold text-[#102A56] outline-none focus:border-[#1677FF]"
                  />
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'hours')}
                    className="rounded-xl border border-[#DCE8F7] bg-white px-3 py-2 text-sm font-semibold text-[#102A56] outline-none focus:border-[#1677FF]"
                  >
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#249BFF] to-[#1677FF] py-3.5 text-center text-base font-semibold text-white shadow-[0_8px_20px_rgba(22,119,255,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_12px_28px_rgba(22,119,255,0.45)] active:scale-[0.99]"
        >
          Save
        </button>
      </div>
    </div>
  )
}
