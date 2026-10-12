import { useState } from 'react'
import {
  Bell,
  Clock,
  Volume2,
  GlassWater,
  Settings as SettingsIcon,
  Palette,
  BarChart3,
  Info,
  Sliders,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import type { ThemeMode } from '../../types/reminder'
import { playWaterChime } from '../../services/sound'

type SettingsProps = {
  intervalValue: number
  intervalUnit: 'minutes' | 'hours'
  snoozeMinutes: number
  notificationsEnabled: boolean
  notificationSound: boolean
  trackingEnabled: boolean
  servingSize: number
  theme: ThemeMode
  onIntervalChange: (value: number, unit: 'minutes' | 'hours') => void
  onSnoozeChange: (value: number) => void
  onNotificationsToggle: (value: boolean) => void
  onNotificationSoundToggle: (value: boolean) => void
  onTrackingToggle: (value: boolean) => void
  onServingSizeChange: (value: number) => void
  onThemeChange: (value: ThemeMode) => void
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
  const [activeTab, setActiveTab] = useState<'settings' | 'reminders' | 'appearance' | 'stats' | 'notifications' | 'about'>('settings')

  // Detect which preset is selected
  const is30m = intervalValue === 30 && intervalUnit === 'minutes'
  const is1h = (intervalValue === 1 && intervalUnit === 'hours') || (intervalValue === 60 && intervalUnit === 'minutes')
  const is2h = (intervalValue === 2 && intervalUnit === 'hours') || (intervalValue === 120 && intervalUnit === 'minutes')
  const isCustom = !is30m && !is1h && !is2h

  const [customMinutes, setCustomMinutes] = useState(
    intervalUnit === 'hours' ? intervalValue * 60 : intervalValue
  )

  const handleCustomChange = (val: number) => {
    const mins = Math.max(1, Math.min(1440, val))
    setCustomMinutes(mins)
    onIntervalChange(mins, 'minutes')
  }

  const navItems = [
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'reminders', label: 'Reminders', icon: Clock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'about', label: 'About', icon: Info }
  ] as const

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/80 bg-white/95 shadow-[0_20px_60px_rgba(22,119,255,0.12)] backdrop-blur-2xl">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Left Sidebar */}
        <aside className="border-b border-[#DCE8F7] bg-[#F7FAFC]/80 p-5 md:border-b-0 md:border-r">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#EBF5FF] text-[#1677FF] shadow-sm'
                      : 'text-[#60738F] hover:bg-slate-100 hover:text-[#102A56]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#1677FF]' : 'text-[#60738F]'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Right Content Panel */}
        <div className="p-6 sm:p-8">
          {(activeTab === 'settings' || activeTab === 'reminders') && (
            <div>
              {/* Reminder Interval Section */}
              <div>
                <h3 className="text-base font-bold text-[#102A56]">Reminder Interval</h3>

                {/* 4 Cards Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {/* 30 minutes */}
                  <button
                    type="button"
                    onClick={() => onIntervalChange(30, 'minutes')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-5 transition ${
                      is30m
                        ? 'border-[#249BFF] bg-[#F1F8FF] shadow-[0_4px_16px_rgba(22,119,255,0.15)] ring-2 ring-[#249BFF]/30'
                        : 'border-[#DCE8F7] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Clock className={`h-6 w-6 ${is30m ? 'text-[#1677FF]' : 'text-[#60738F]'}`} />
                    <span className="mt-2 text-xl font-bold text-[#102A56]">30</span>
                    <span className="text-xs font-medium text-[#60738F]">minutes</span>
                  </button>

                  {/* 1 hour */}
                  <button
                    type="button"
                    onClick={() => onIntervalChange(1, 'hours')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-5 transition ${
                      is1h
                        ? 'border-[#249BFF] bg-[#F1F8FF] shadow-[0_4px_16px_rgba(22,119,255,0.15)] ring-2 ring-[#249BFF]/30'
                        : 'border-[#DCE8F7] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Clock className={`h-6 w-6 ${is1h ? 'text-[#1677FF]' : 'text-[#60738F]'}`} />
                    <span className="mt-2 text-xl font-bold text-[#102A56]">1</span>
                    <span className="text-xs font-medium text-[#60738F]">hour</span>
                  </button>

                  {/* 2 hours */}
                  <button
                    type="button"
                    onClick={() => onIntervalChange(2, 'hours')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-5 transition ${
                      is2h
                        ? 'border-[#249BFF] bg-[#F1F8FF] shadow-[0_4px_16px_rgba(22,119,255,0.15)] ring-2 ring-[#249BFF]/30'
                        : 'border-[#DCE8F7] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Clock className={`h-6 w-6 ${is2h ? 'text-[#1677FF]' : 'text-[#60738F]'}`} />
                    <span className="mt-2 text-xl font-bold text-[#102A56]">2</span>
                    <span className="text-xs font-medium text-[#60738F]">hours</span>
                  </button>

                  {/* Custom */}
                  <button
                    type="button"
                    onClick={() => handleCustomChange(customMinutes)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-5 transition ${
                      isCustom
                        ? 'border-[#249BFF] bg-[#F1F8FF] shadow-[0_4px_16px_rgba(22,119,255,0.15)] ring-2 ring-[#249BFF]/30'
                        : 'border-[#DCE8F7] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Sliders className={`h-6 w-6 ${isCustom ? 'text-[#1677FF]' : 'text-[#60738F]'}`} />
                    <span className="mt-2 text-sm font-bold text-[#102A56]">Custom</span>
                    <span className="text-xs font-medium text-[#60738F]">{customMinutes}m</span>
                  </button>
                </div>

                {/* Custom Interval Row */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#102A56]">Custom Interval</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={customMinutes}
                      onChange={(e) => handleCustomChange(Number(e.target.value))}
                      className="w-20 rounded-xl border border-[#DCE8F7] bg-white px-3 py-1.5 text-center text-sm font-bold text-[#102A56] outline-none focus:border-[#1677FF]"
                    />
                    <span className="text-sm font-medium text-[#60738F]">minutes</span>
                  </div>
                </div>
              </div>

              {/* Toggles List matching mockup bottom-left card */}
              <div className="mt-8 space-y-4 border-t border-[#DCE8F7] pt-6">
                {/* Show notifications */}
                <div className="flex items-center justify-between rounded-2xl border border-transparent p-2 transition hover:bg-slate-50">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#1677FF]">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#102A56]">Show notifications</div>
                      <div className="text-xs font-medium text-[#60738F]">Get reminder pop-ups</div>
                    </div>
                  </div>
                  {/* Apple Style Blue Switch */}
                  <button
                    type="button"
                    onClick={() => onNotificationsToggle(!notificationsEnabled)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-[#1677FF]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                        notificationsEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Play sound */}
                <div className="flex items-center justify-between rounded-2xl border border-transparent p-2 transition hover:bg-slate-50">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#1677FF]">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#102A56]">Play sound</div>
                      <div className="text-xs font-medium text-[#60738F]">Play a gentle notification sound</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !notificationSound
                      onNotificationSoundToggle(next)
                      if (next) playWaterChime()
                    }}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      notificationSound ? 'bg-[#1677FF]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                        notificationSound ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Track daily intake */}
                <div className="flex items-center justify-between rounded-2xl border border-transparent p-2 transition hover:bg-slate-50">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#1677FF]">
                      <GlassWater className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#102A56]">Track daily intake</div>
                      <div className="text-xs font-medium text-[#60738F]">Monitor your water drinking habit</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTrackingToggle(!trackingEnabled)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      trackingEnabled ? 'bg-[#1677FF]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                        trackingEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-base font-bold text-[#102A56]">Appearance</h3>
              <p className="text-sm text-[#60738F]">
                Choose how AquaDrop looks on your device.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onThemeChange(mode)}
                    className={`rounded-2xl border p-4 text-center capitalize transition ${
                      theme === mode
                        ? 'border-[#249BFF] bg-[#F1F8FF] font-bold text-[#1677FF] ring-2 ring-[#249BFF]/30'
                        : 'border-[#DCE8F7] bg-white font-medium text-[#102A56] hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-base font-bold text-[#102A56]">Hydration Settings & Goals</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#DCE8F7] bg-[#F1F8FF] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#60738F]">
                    Serving Size
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="50"
                      step="50"
                      value={servingSize}
                      onChange={(e) => onServingSizeChange(Number(e.target.value))}
                      className="w-24 rounded-xl border border-[#DCE8F7] bg-white px-3 py-2 text-base font-bold text-[#102A56] outline-none focus:border-[#1677FF]"
                    />
                    <span className="text-sm font-semibold text-[#102A56]">mL per glass</span>
                  </div>
                  <p className="mt-2 text-xs text-[#60738F]">Standard 250 mL = 1 glass of water</p>
                </div>

                <div className="rounded-2xl border border-[#DCE8F7] bg-[#F1F8FF] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#60738F]">
                    Snooze Duration
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={snoozeMinutes}
                      onChange={(e) => onSnoozeChange(Number(e.target.value))}
                      className="w-24 rounded-xl border border-[#DCE8F7] bg-white px-3 py-2 text-base font-bold text-[#102A56] outline-none focus:border-[#1677FF]"
                    />
                    <span className="text-sm font-semibold text-[#102A56]">minutes</span>
                  </div>
                  <p className="mt-2 text-xs text-[#60738F]">How long to delay when choosing remind me later</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-bold text-[#102A56]">Browser Notification Permissions</h3>
              <p className="text-sm text-[#60738F]">
                AquaDrop uses standard Web Notifications to remind you gently even when you are in other tabs or apps.
              </p>
              <div className="rounded-2xl border border-[#DCE8F7] bg-[#F1F8FF] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#102A56]">System Status</div>
                    <div className="text-xs text-[#60738F]">
                      {typeof Notification !== 'undefined' && Notification.permission === 'granted'
                        ? '✓ Notifications granted and active'
                        : 'Notifications require browser permission'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof Notification !== 'undefined') {
                        Notification.requestPermission()
                      }
                    }}
                    className="rounded-xl bg-[#1677FF] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#249BFF]"
                  >
                    Check permission
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fade-in text-center sm:text-left">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[#1677FF]" />
                <h3 className="text-lg font-bold text-[#102A56]">AquaDrop 0.1.0</h3>
              </div>
              <p className="text-sm leading-relaxed text-[#60738F]">
                AquaDrop is designed to help you build healthy hydration habits throughout your working day with gentle, customizable reminders, quick intake tracking, and friendly mascot cheers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
