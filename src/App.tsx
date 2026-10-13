import { useEffect, useState, useCallback } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import RemindersScreen from './features/reminders/RemindersScreen'
import AppearanceScreen from './features/settings/AppearanceScreen'
import AboutScreen from './features/settings/AboutScreen'
import ReminderModal from './features/reminders/ReminderModal'
import ReminderIntervalModal from './features/reminders/ReminderIntervalModal'
import { useReminder } from './hooks/useReminder'
import mascotUrl from './assets/water-drop-mascot.svg'
import { Bell } from 'lucide-react'
import { playReminderSound } from './services/sound'

type Screen = 'dashboard' | 'reminders' | 'appearance' | 'about'

export default function App() {
  const {
    state,
    countdownMs,
    start,
    pause,
    resume,
    snoozeFor,
    dismiss,
    recordDrink,
    setInterval,
    setSnoozeMinutes,
    setNotificationsEnabled,
    setNotificationSound,
    setVoiceType,
    setTrackingEnabled,
    setServingSize,
    setTheme,
    ensureNotificationPermission,
    deleteHistory
  } = useReminder()

  const [screen, setScreen] = useState<Screen>('dashboard')
  const [intervalModalOpen, setIntervalModalOpen] = useState(false)
  const [manualReminderOpen, setManualReminderOpen] = useState(false)
  const [snoozeToast, setSnoozeToast] = useState<string | null>(null)

  // ── Apply theme attribute ────────────────────────────────────
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = state.theme
    }
  }, [state.theme])

  // ── Listen for OS theme changes in System mode ───────────────
  useEffect(() => {
    if (state.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // data-theme stays "system"; CSS @media handles the variable swap.
      // Trigger a re-paint by toggling the attribute momentarily.
      document.documentElement.dataset.theme = 'system'
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [state.theme])

  // ── Handlers ─────────────────────────────────────────────────
  const handleStart = async () => {
    if (state.notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await ensureNotificationPermission()
    }
    start()
  }

  const handleRecordDrink = useCallback(() => {
    recordDrink()
  }, [recordDrink])

  /** Snooze or delay for an explicit number of minutes. */
  const handleSnooze = useCallback((minutes?: number) => {
    const mins = minutes && minutes > 0 ? minutes : state.snoozeMinutes
    const wasModalOpen = state.reminderOpen || manualReminderOpen
    snoozeFor(mins)
    if (manualReminderOpen) {
      setManualReminderOpen(false)
    }
    if (wasModalOpen) {
      setSnoozeToast(`Reminder snoozed for ${mins} minute${mins !== 1 ? 's' : ''}.`)
    } else {
      setSnoozeToast(`Next break delayed by ${mins} minute${mins !== 1 ? 's' : ''}.`)
    }
    setTimeout(() => setSnoozeToast(null), 3500)
  }, [snoozeFor, state.reminderOpen, manualReminderOpen, state.snoozeMinutes])

  const isModalOpen = state.reminderOpen || manualReminderOpen
  const todayIntake = state.hydrationHistory.reduce((sum, item) => sum + item.amount, 0)

  const navItems: { id: Screen; label: string }[] = [
    { id: 'dashboard',   label: 'Dashboard' },
    { id: 'reminders',   label: 'Reminders' },
    { id: 'appearance',  label: 'Appearance' },
    { id: 'about',       label: 'About' },
  ]

  return (
    <div
      className="min-h-screen antialiased transition-colors duration-200"
      style={{
        background: `linear-gradient(135deg, var(--color-bg-page) 0%, var(--color-bg-page-mid) 50%, var(--color-bg-page-end) 100%)`,
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-96 w-96 rounded-full blur-[100px]"
          style={{ background: 'var(--color-aura-1)' }}
        />
        <div
          className="absolute right-0 top-1/4 h-96 w-96 rounded-full blur-[120px]"
          style={{ background: 'var(--color-aura-2)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-[90px]"
          style={{ background: 'var(--color-aura-3)' }}
        />
      </div>

      <div className="relative z-10 px-4 py-6 sm:px-6 md:px-8">
        {/* App Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between pb-8">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg backdrop-blur-md"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-card)' }}
            >
              <img src={mascotUrl} alt="AquaDrop logo" className="h-9 w-9" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-secondary)' }}>
                AquaDrop
              </p>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl" style={{ color: 'var(--color-text-primary)' }}>
                Drink water, stay hydrated.
              </h1>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Pop-up Preview Button */}
            <button
              type="button"
              onClick={() => {
                setManualReminderOpen(true)
                if (state.notificationSound) {
                  playReminderSound(state.voiceType || 'female')
                }
              }}
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition hover:shadow-md sm:flex"
              style={{
                background: 'var(--color-bg-nav)',
                border: '1px solid var(--color-border-card)',
                color: 'var(--color-accent)',
              }}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Test Pop-up & Voice</span>
            </button>

            {/* Nav Pill */}
            <nav
              className="flex gap-1 rounded-full p-1.5 shadow-sm backdrop-blur-md"
              style={{
                background: 'var(--color-bg-nav)',
                border: '1px solid var(--color-border-card)',
              }}
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScreen(item.id)}
                  className="rounded-full px-4 py-2 text-xs font-bold transition-all"
                  style={
                    screen === item.id
                      ? {
                          background: 'var(--color-accent)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(22,119,255,0.35)',
                        }
                      : { color: 'var(--color-text-secondary)' }
                  }
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto max-w-6xl">
          {screen === 'dashboard' && (
            <Dashboard
              state={state}
              countdownMs={countdownMs}
              onStart={handleStart}
              onPause={pause}
              onResume={resume}
              onOpenSettings={() => setScreen('reminders')}
              onOpenIntervalModal={() => setIntervalModalOpen(true)}
              onRecordDrink={handleRecordDrink}
              onSnooze={handleSnooze}
              onIntervalChange={setInterval}
              onDeleteHistory={deleteHistory}
            />
          )}

          {screen === 'reminders' && (
            <RemindersScreen
              intervalValue={state.intervalValue}
              intervalUnit={state.intervalUnit}
              snoozeMinutes={state.snoozeMinutes}
              notificationsEnabled={state.notificationsEnabled}
              notificationSound={state.notificationSound}
              voiceType={state.voiceType}
              trackingEnabled={state.trackingEnabled}
              servingSize={state.servingSize}
              onIntervalChange={setInterval}
              onSnoozeChange={setSnoozeMinutes}
              onNotificationsToggle={setNotificationsEnabled}
              onNotificationSoundToggle={setNotificationSound}
              onVoiceTypeChange={setVoiceType}
              onTrackingToggle={setTrackingEnabled}
              onServingSizeChange={setServingSize}
            />
          )}

          {screen === 'appearance' && (
            <AppearanceScreen
              theme={state.theme}
              onThemeChange={setTheme}
            />
          )}

          {screen === 'about' && (
            <AboutScreen />
          )}
        </main>

        {/* Main Reminder Modal */}
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

        {/* Interval Modal */}
        <ReminderIntervalModal
          isOpen={intervalModalOpen}
          currentValue={state.intervalValue}
          currentUnit={state.intervalUnit}
          onSave={setInterval}
          onClose={() => setIntervalModalOpen(false)}
        />

        {/* Snooze confirmation toast */}
        {snoozeToast && (
          <div
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-pop-in"
            style={{ background: '#1677FF' }}
          >
            {snoozeToast}
          </div>
        )}
      </div>
    </div>
  )
}
