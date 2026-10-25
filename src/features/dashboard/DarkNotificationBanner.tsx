import { useState } from 'react'
import { GlassWater, Clock, ChevronDown, X } from 'lucide-react'
import mascotUrl from '../../assets/water-drop-mascot.svg'

type DarkNotificationBannerProps = {
  isOpen: boolean
  onRecordDrink: () => void
  onSnooze: (minutes?: number) => void
  onClose: () => void
}

export default function DarkNotificationBanner({
  isOpen,
  onRecordDrink,
  onSnooze,
  onClose,
}: DarkNotificationBannerProps) {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false)

  if (!isOpen) return null

  return (
    /* Always uses a dark glass notification style — intentionally dark in all themes */
    <div className="relative flex w-full max-w-md flex-col overflow-visible rounded-2xl border border-white/10 bg-[#1E293B]/95 p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl animate-pop-in">
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3.5 top-3.5 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3.5 pr-6">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sky-900/40 p-1">
          <img src={mascotUrl} alt="Drink Water" className="h-9 w-9 drop-shadow-sm" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">Drink water, stay hydrated.</div>
          <div className="text-xs text-sky-200">It&apos;s time for a water break! 💙</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-3.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            onRecordDrink()
            onClose()
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1677FF] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#249BFF]"
        >
          <GlassWater className="h-3.5 w-3.5" />
          <span>I&apos;ve drunk water</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Remind later</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showSnoozeMenu && (
            <div className="absolute right-0 bottom-full z-30 mb-1.5 w-32 overflow-hidden rounded-xl border border-white/10 bg-slate-800 p-1 shadow-2xl animate-pop-in">
              {[5, 10, 15].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setShowSnoozeMenu(false)
                    onSnooze(m)
                    onClose()
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                >
                  <span>{m} mins</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
