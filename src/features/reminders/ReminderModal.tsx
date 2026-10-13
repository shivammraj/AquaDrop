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
  onDismiss,
}: ReminderModalProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false)

  if (!isOpen && !showCelebration) return null

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

  const modalCardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-card)',
    boxShadow: '0 25px 70px var(--color-card-shadow)',
  }

  const insetStyle = {
    background: 'var(--color-bg-inset)',
    border: '1px solid var(--color-border)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md animate-fade-in">
      {!showCelebration ? (
        <div
          className="relative w-full max-w-lg overflow-visible rounded-[36px] p-8 backdrop-blur-2xl animate-pop-in"
          style={modalCardStyle}
        >
          {/* Aura blobs */}
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{ background: 'var(--color-aura-1)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full blur-3xl"
            style={{ background: 'var(--color-aura-2)' }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-5 top-5 rounded-full p-2 transition"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close reminder"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-7">
            {/* Mascot */}
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 scale-95 rounded-full blur-xl animate-pulse"
                style={{ background: 'rgba(36, 155, 255, 0.28)' }}
              />
              <img
                src={mascotUrl}
                alt="AquaDrop mascot"
                className="relative h-32 w-32 drop-shadow-[0_16px_28px_rgba(22,119,255,0.32)] transition-transform hover:scale-105 sm:h-36 sm:w-36"
              />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--color-text-primary)' }}>
                Drink water,
                <br className="hidden sm:inline" /> stay hydrated.
              </h2>
              <p className="mt-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                A small step for a healthier, happier you! 💙
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {/* Primary: I've drunk water */}
                <button
                  type="button"
                  onClick={handleRecordDrink}
                  className="group flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-[0_10px_25px_rgba(22,119,255,0.38)] transition-all hover:scale-[1.02] active:scale-[0.99]"
                  style={{ background: 'linear-gradient(to right, var(--color-accent-bright), var(--color-accent))' }}
                >
                  <div className="flex items-center gap-3">
                    <GlassWater className="h-5 w-5 transition-transform group-hover:rotate-6" />
                    <span className="font-semibold text-base">I&apos;ve drunk water</span>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white" style={{ color: 'var(--color-accent)' }}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </button>

                {/* Secondary: Remind me later */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                    className="flex w-full items-center justify-between rounded-2xl px-5 py-3 shadow-sm transition hover:shadow-md"
                    style={{
                      background: 'var(--color-bg-card-solid)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
                      <span className="font-medium text-sm">Remind me later</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showSnoozeMenu ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--color-text-secondary)' }}
                    />
                  </button>

                  {showSnoozeMenu && (
                    <div
                      className="mt-2.5 overflow-hidden rounded-2xl p-2 animate-pop-in"
                      style={{
                        background: 'var(--color-bg-inset)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div className="mb-1.5 px-1 text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        Snooze alarm for:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[5, 10, 15, 30].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              setShowSnoozeMenu(false)
                              onSnooze(mins)
                            }}
                            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              background: 'var(--color-bg-card-solid)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            <span>{mins} minutes</span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                              style={{
                                background: 'rgba(22, 119, 255, 0.12)',
                                color: 'var(--color-accent)',
                              }}
                            >
                              Snooze
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
      ) : (
        /* Celebration Modal */
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-[36px] p-7 text-center backdrop-blur-2xl animate-pop-in"
          style={modalCardStyle}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 transition"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close celebration"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative mx-auto mt-2 flex justify-center">
            <img
              src={celebrationUrl}
              alt="Great job mascot"
              className="h-36 w-36 drop-shadow-[0_16px_28px_rgba(22,119,255,0.3)] animate-bounce-gentle"
            />
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Great! 💙
          </h2>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Keep it up!
          </p>

          <div className="mt-6 rounded-2xl p-4" style={insetStyle}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                style={{ background: 'var(--color-bg-card-solid)', color: 'var(--color-accent)' }}
              >
                <GlassWater className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Water Intake Today
                </div>
                <div className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {displayGlasses} / {targetGlasses} glasses
                </div>
              </div>
            </div>

            <div className="mt-3.5 h-3 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(to right, var(--color-accent-bright), var(--color-accent))',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
