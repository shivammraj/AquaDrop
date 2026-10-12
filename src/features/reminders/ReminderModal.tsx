import { useState } from 'react'
import { CheckCircle2, ChevronDown, Clock, GlassWater, X } from 'lucide-react'
import mascotUrl from '../../assets/water-drop-mascot.svg'
import celebrationUrl from '../../assets/water-drop-celebration.svg'

type ReminderModalProps = {
  isOpen: boolean
  servingSize?: number
  todayIntake?: number
  onRecordDrink: () => void
  onSnooze: (minutes?: number) => void
  onDismiss: () => void
}

export default function ReminderModal({
  isOpen,
  servingSize = 250,
  todayIntake = 0,
  onRecordDrink,
  onSnooze,
  onDismiss
}: ReminderModalProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false)

  if (!isOpen && !showCelebration) return null

  // Calculate glasses based on 250mL standard glass
  const currentGlasses = Math.floor(todayIntake / servingSize)
  const targetGlasses = 8
  const displayGlasses = showCelebration ? currentGlasses + 1 : currentGlasses
  const progressPercent = Math.min(100, Math.round((displayGlasses / targetGlasses) * 100))

  const handleRecordDrink = () => {
    onRecordDrink()
    setShowCelebration(true)
    setTimeout(() => {
      setShowCelebration(false)
      onDismiss()
    }, 2800)
  }

  const handleClose = () => {
    setShowCelebration(false)
    setShowSnoozeMenu(false)
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md animate-fade-in">
      {!showCelebration ? (
        /* Top Left Card Design: Main Reminder Modal */
        <div className="relative w-full max-w-lg overflow-hidden rounded-[36px] border border-white/80 bg-white/95 p-8 shadow-[0_25px_70px_rgba(22,119,255,0.22)] backdrop-blur-2xl animate-pop-in">
          {/* Subtle Water Splash Aura Background */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100/80 hover:text-slate-700"
            aria-label="Close reminder"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-7">
            {/* 3D Glossy Mascot with animated breathing */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 scale-95 rounded-full bg-sky-300/30 blur-xl animate-pulse" />
              <img
                src={mascotUrl}
                alt="AquaDrop mascot"
                className="relative h-32 w-32 drop-shadow-[0_16px_28px_rgba(22,119,255,0.32)] transition-transform hover:scale-105 sm:h-36 sm:w-36"
              />
            </div>

            {/* Content & Actions */}
            <div className="flex flex-1 flex-col text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-[#102A56] sm:text-3xl">
                Drink water,
                <br className="hidden sm:inline" /> stay hydrated.
              </h2>
              <p className="mt-2 text-sm font-medium text-[#60738F]">
                A small step for a healthier, happier you! 💙
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                {/* Primary: "I've drunk water" */}
                <button
                  type="button"
                  onClick={handleRecordDrink}
                  className="group flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#249BFF] to-[#1677FF] px-5 py-3.5 text-white shadow-[0_10px_25px_rgba(22,119,255,0.38)] transition-all hover:scale-[1.02] hover:shadow-[0_14px_32px_rgba(22,119,255,0.48)] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <GlassWater className="h-5 w-5 transition-transform group-hover:rotate-6" />
                    <span className="font-semibold text-base">I&apos;ve drunk water</span>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1677FF]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </button>

                {/* Secondary: "Remind me later" with dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#DCE8F7] bg-white/90 px-5 py-3 text-[#102A56] shadow-sm transition hover:bg-sky-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[#60738F]" />
                      <span className="font-medium text-sm text-[#102A56]">Remind me later</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-[#60738F] transition-transform ${showSnoozeMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Snooze options dropdown */}
                  {showSnoozeMenu && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-2xl border border-[#DCE8F7] bg-white p-1.5 shadow-xl animate-pop-in">
                      {[5, 10, 15, 30].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setShowSnoozeMenu(false)
                            onSnooze(mins)
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-[#102A56] transition hover:bg-sky-50"
                        >
                          <span>In {mins} minutes</span>
                          <span className="text-xs text-[#60738F]">Snooze</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Top Right Card Design: Celebration Modal ("Great! 💙 Keep it up!") */
        <div className="relative w-full max-w-sm overflow-hidden rounded-[36px] border border-white/80 bg-white/95 p-7 text-center shadow-[0_25px_70px_rgba(22,119,255,0.25)] backdrop-blur-2xl animate-pop-in">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close celebration"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Celebration Mascot with floating hearts */}
          <div className="relative mx-auto mt-2 flex justify-center">
            <img
              src={celebrationUrl}
              alt="Great job mascot"
              className="h-36 w-36 drop-shadow-[0_16px_28px_rgba(22,119,255,0.3)] animate-bounce-gentle"
            />
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#102A56]">
            Great! 💙
          </h2>
          <p className="mt-1 text-sm font-medium text-[#60738F]">
            Keep it up!
          </p>

          {/* Water Intake Today Container */}
          <div className="mt-6 rounded-2xl border border-[#DCE8F7] bg-[#F1F8FF]/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-primary">
                <GlassWater className="h-6 w-6 text-[#1677FF]" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#60738F]">
                  Water Intake Today
                </div>
                <div className="text-base font-bold text-[#102A56]">
                  {displayGlasses} / {targetGlasses} glasses
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 h-3 overflow-hidden rounded-full bg-[#DCE8F7]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#249BFF] to-[#1677FF] transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
