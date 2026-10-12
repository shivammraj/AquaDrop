import { useEffect, useMemo, useState } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import Settings from './features/settings/Settings'
import ReminderModal from './features/reminders/ReminderModal'
import ReminderIntervalModal from './features/reminders/ReminderIntervalModal'
import { useReminder } from './hooks/useReminder'
import mascotUrl from './assets/water-drop-mascot.svg'
import { Bell, Sparkles } from 'lucide-react'

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
  const [intervalModalOpen, setIntervalModalOpen] = useState(false)
  const [manualReminderOpen, setManualReminderOpen] = useState(false)

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

  const handleRecordDrink = () => {
    recordDrink()
  }

  const handleSnooze = (minutes?: number) => {
    if (minutes && minutes > 0) {
      setSnoozeMinutes(minutes)
    }
    snooze()
  }

  const isModalOpen = state.reminderOpen || manualReminderOpen

  const todayIntake = state.hydrationHistory.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF5FF] via-[#F4F9FF] to-[#E5F2FF] text-[#13294B] antialiased selection:bg-[#249BFF]/20 selection:text-[#1677FF]">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#BCEEFF]/40 blur-[100px]" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[#DCE8F7]/60 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#E0F2FE]/50 blur-[90px]" />
      </div>

      <div className="relative z-10 px-4 py-6 sm:px-6 md:px-8">
        {/* App Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between pb-8">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-[0_8px_20px_rgba(22,119,255,0.12)] backdrop-blur-md">
              <img src={mascotUrl} alt="AquaDrop logo" className="h-9 w-9" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#60738F]">AquaDrop</p>
              <h1 className="text-lg font-bold tracking-tight text-[#102A56] sm:text-xl">
                Drink water, stay hydrated.
              </h1>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Pop-up Preview Button */}
            <button
              type="button"
              onClick={() => setManualReminderOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-bold text-[#1677FF] shadow-sm backdrop-blur-md transition hover:bg-white hover:shadow-md sm:flex"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Test Pop-up</span>
            </button>

            {/* Nav Pill */}
            <nav className="flex gap-1.5 rounded-full border border-white/80 bg-white/75 p-1.5 shadow-[0_4px_16px_rgba(22,119,255,0.06)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setScreen('dashboard')}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  screen === 'dashboard'
                    ? 'bg-[#1677FF] text-white shadow-[0_4px_12px_rgba(22,119,255,0.35)]'
                    : 'text-[#60738F] hover:text-[#102A56]'
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setScreen('settings')}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  screen === 'settings'
                    ? 'bg-[#1677FF] text-white shadow-[0_4px_12px_rgba(22,119,255,0.35)]'
                    : 'text-[#60738F] hover:text-[#102A56]'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto max-w-6xl">
          {screen === 'dashboard' ? (
            <Dashboard
              state={state}
              countdownMs={countdownMs}
              onStart={handleStart}
              onPause={pause}
              onResume={resume}
              onOpenSettings={() => setScreen('settings')}
              onOpenIntervalModal={() => setIntervalModalOpen(true)}
              onRecordDrink={handleRecordDrink}
              onSnooze={handleSnooze}
              onIntervalChange={setInterval}
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
              onNotificationSoundToggle={setNotificationSound}
              onTrackingToggle={setTrackingEnabled}
              onServingSizeChange={setServingSize}
              onThemeChange={setTheme}
            />
          )}
        </main>

        {/* Main Reminder Modal (Matches Mockup Top-Left and Top-Right) */}
        <ReminderModal
          isOpen={isModalOpen}
          servingSize={state.servingSize}
          todayIntake={todayIntake}
          onRecordDrink={handleRecordDrink}
          onSnooze={handleSnooze}
          onDismiss={() => {
            setManualReminderOpen(false)
            dismiss()
          }}
        />

        {/* Interval Modal (Matches Mockup Top-Middle "Remind me every") */}
        <ReminderIntervalModal
          isOpen={intervalModalOpen}
          currentValue={state.intervalValue}
          currentUnit={state.intervalUnit}
          onSave={setInterval}
          onClose={() => setIntervalModalOpen(false)}
        />
      </div>
    </div>
  )
}
