import mascotUrl from '../../assets/water-drop-mascot.svg'

type ReminderModalProps = {
  isOpen: boolean
  onRecordDrink: () => void
  onSnooze: () => void
  onDismiss: () => void
}

export default function ReminderModal({ isOpen, onRecordDrink, onSnooze, onDismiss }: ReminderModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[28px] border border-primary/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(22,119,255,0.18)] animate-pop-in">
        <div className="flex justify-center mb-4">
          <img src={mascotUrl} alt="AquaDrop mascot" className="h-24 w-24 drop-shadow-[0_12px_24px_rgba(22,119,255,0.25)]" />
        </div>

        <h2 className="text-center text-2xl font-semibold text-primaryText">Drink water, stay hydrated.</h2>
        <p className="mt-2 text-center text-sm text-secondaryText">It&apos;s time for a water break.</p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={onRecordDrink}
            className="rounded-2xl bg-primary px-5 py-3 text-base font-medium text-white shadow-[0_12px_30px_rgba(22,119,255,0.25)] transition hover:-translate-y-0.5 hover:bg-accent active:translate-y-0"
          >
            I&apos;ve drunk water
          </button>

          <button
            type="button"
            onClick={onSnooze}
            className="rounded-2xl border border-border bg-white px-5 py-3 text-base font-medium text-primaryText transition hover:bg-sky-50"
          >
            Remind me later
          </button>

          <button type="button" onClick={onDismiss} className="text-sm text-secondaryText underline-offset-4 hover:underline">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
