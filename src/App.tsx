import { useEffect, useMemo, useState } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import Settings from './features/settings/Settings'
import ReminderModal from './features/reminders/ReminderModal'
import { useReminder } from './hooks/useReminder'
import mascotUrl from './assets/water-drop-mascot.svg'

export default function App() {
  const {
    state,
    start,
    pause,
    resume,
    snooze,
    dismiss,
    recordDrink,
    setInterval,
    setSnoozeMinutes,
    setNotificationsEnabled,
    setNotificationSound,
    setTrackingEnabled,
    setServingSize,
    setTheme,
    ensureNotificationPermission
  } = useReminder()
  const [screen, setScreen] = useState<'dashboard' | 'settings'>('dashboard')

  const countdownMs = useMemo(() => {
    if (!state.nextReminder) return Number.POSITIVE_INFINITY
    return Math.max(0, state.nextReminder - Date.now())
  }, [state.nextReminder])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = state.theme
    }
  }, [state.theme])

  const handleStart = async () => {
    if (state.notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await ensureNotificationPermission()
    }
    start()
  }

  const handlePause = () => pause()
  const handleResume = () => resume()
  const handleOpenSettings = () => setScreen('settings')

  return (
    <div className="min-h-screen bg-ice px-4 py-6 text-primaryText md:px-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-3">
          <img src={mascotUrl} alt="AquaDrop logo" className="h-12 w-12" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-secondaryText">AquaDrop</p>
            <h1 className="text-xl font-semibold">Drink water, stay hydrated.</h1>
          </div>
        </div>

        <nav className="flex gap-2 rounded-full border border-border bg-white/70 p-1.5 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setScreen('dashboard')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${screen === 'dashboard' ? 'bg-primary text-white shadow-sm' : 'text-primaryText hover:bg-white'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setScreen('settings')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${screen === 'settings' ? 'bg-primary text-white shadow-sm' : 'text-primaryText hover:bg-white'}`}
          >
            Settings
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl">
        {screen === 'dashboard' ? (
          <Dashboard
            state={state}
            countdownMs={countdownMs}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onOpenSettings={handleOpenSettings}
            onRecordDrink={recordDrink}
          />
        ) : (
          <Settings
            intervalValue={state.intervalValue}
            intervalUnit={state.intervalUnit}
            snoozeMinutes={state.snoozeMinutes}
            notificationsEnabled={state.notificationsEnabled}
            notificationSound={state.notificationSound}
            trackingEnabled={state.trackingEnabled}
            servingSize={state.servingSize}
            theme={state.theme}
            onIntervalChange={setInterval}
            onSnoozeChange={setSnoozeMinutes}
            onNotificationsToggle={setNotificationsEnabled}
            onNotificationSoundToggle={(value) => setNotificationSound(value)}
            onTrackingToggle={setTrackingEnabled}
            onServingSizeChange={setServingSize}
            onThemeChange={setTheme}
          />
        )}
      </main>

      <ReminderModal
        isOpen={state.reminderOpen}
        onRecordDrink={recordDrink}
        onSnooze={snooze}
        onDismiss={dismiss}
      />
    </div>
  )
}
