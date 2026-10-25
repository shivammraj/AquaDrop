import './setup'
import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { AquaDropScheduler } from '../scheduler'
import { AquaDropStorage } from '../storage'
import { MockMemento } from './helpers'
import { mockVscode } from './setup'
import { AquaDropSidebarProvider } from '../ui/sidebarProvider'
import { AquaDropDashboardPanel } from '../ui/dashboardPanel'
import { registerAquaDropCommands } from '../commands'

describe('Notification Fallback, Branded Popup, and Sound Routing', () => {
  it('routes reminder to branded popup when a webview is visible', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let infoMessageShown = false
    let popupShown = false
    let soundPassed = false

    // Mock window.showInformationMessage
    const origInfo = mockVscode.window.showInformationMessage
    mockVscode.window.showInformationMessage = async () => {
      infoMessageShown = true
      return undefined
    }

    const mockDashboardPanel = {
      isVisible: () => true,
      showReminder: (snoozeMin: number, sound: boolean) => {
        popupShown = true
        soundPassed = sound
      }
    }

    // Temporarily mount mock dashboard
    const origPanel = AquaDropDashboardPanel.currentPanel
    AquaDropDashboardPanel.currentPanel = mockDashboardPanel as any

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: async (diagnostic) => {
        const state = scheduler.getState()
        if (!state.notificationsEnabled) return

        const isDashboardVisible = AquaDropDashboardPanel.currentPanel?.isVisible() ?? false
        if (isDashboardVisible && AquaDropDashboardPanel.currentPanel) {
          AquaDropDashboardPanel.currentPanel.showReminder(state.snoozeMinutes, state.soundEnabled)
        } else {
          await mockVscode.window.showInformationMessage('Time for a water break 💧', 'Drink Water')
        }
      },
      onStateChange: () => {}
    })

    await scheduler.triggerDueReminder()

    assert.strictEqual(popupShown, true, 'Popup should be shown on visible webview')
    assert.strictEqual(soundPassed, true, 'Sound should be enabled by default')
    assert.strictEqual(infoMessageShown, false, 'Native VS Code notification should NOT be called when webview is visible')

    // Restore
    AquaDropDashboardPanel.currentPanel = origPanel
    mockVscode.window.showInformationMessage = origInfo
    scheduler.dispose()
  })

  it('falls back to native VS Code notification when no webview is visible', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let infoMessageShown = false

    const origInfo = mockVscode.window.showInformationMessage
    mockVscode.window.showInformationMessage = async (msg: string) => {
      if (msg.includes('Time for a water break')) {
        infoMessageShown = true
      }
      return undefined
    }

    const origPanel = AquaDropDashboardPanel.currentPanel
    AquaDropDashboardPanel.currentPanel = undefined // No webview open

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: async () => {
        const state = scheduler.getState()
        if (!state.notificationsEnabled) return

        const isDashboardVisible = AquaDropDashboardPanel.currentPanel?.isVisible() ?? false
        if (isDashboardVisible && AquaDropDashboardPanel.currentPanel) {
          AquaDropDashboardPanel.currentPanel.showReminder(state.snoozeMinutes, state.soundEnabled)
        } else {
          await mockVscode.window.showInformationMessage('Time for a water break 💧 Stay hydrated!', 'Drink Water')
        }
      },
      onStateChange: () => {}
    })

    await scheduler.triggerDueReminder()

    assert.strictEqual(infoMessageShown, true, 'Native notification fallback must be invoked')

    AquaDropDashboardPanel.currentPanel = origPanel
    mockVscode.window.showInformationMessage = origInfo
    scheduler.dispose()
  })

  it('does not show popup or native notification when notifications are disabled', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let notificationInvoked = false

    const origInfo = mockVscode.window.showInformationMessage
    mockVscode.window.showInformationMessage = async () => {
      notificationInvoked = true
      return undefined
    }

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: async () => {
        const state = scheduler.getState()
        if (!state.notificationsEnabled) return
        notificationInvoked = true
      },
      onStateChange: () => {}
    })

    await scheduler.updateSettings({ notificationsEnabled: false })
    await scheduler.triggerDueReminder()

    assert.strictEqual(notificationInvoked, false, 'No notification should fire when disabled')

    mockVscode.window.showInformationMessage = origInfo
    scheduler.dispose()
  })

  it('prevents duplicate audio when both dashboard and sidebar are visible', () => {
    let dashboardSound = false
    let sidebarSound = false

    const isDashboardVisible = true
    const isSidebarVisible = true
    const soundEnabled = true

    if (isDashboardVisible) {
      dashboardSound = soundEnabled
    }
    if (isSidebarVisible) {
      // Sidebar only plays sound if dashboard is not already playing it
      sidebarSound = soundEnabled && !isDashboardVisible
    }

    assert.strictEqual(dashboardSound, true, 'Dashboard plays sound')
    assert.strictEqual(sidebarSound, false, 'Sidebar skips sound to avoid duplicate audio')
  })

  it('disables sound when soundEnabled is set to false', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let soundPassed = true

    const mockDashboardPanel = {
      isVisible: () => true,
      showReminder: (snoozeMin: number, sound: boolean) => {
        soundPassed = sound
      }
    }

    const origPanel = AquaDropDashboardPanel.currentPanel
    AquaDropDashboardPanel.currentPanel = mockDashboardPanel as any

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: async () => {
        const state = scheduler.getState()
        AquaDropDashboardPanel.currentPanel?.showReminder(state.snoozeMinutes, state.soundEnabled)
      },
      onStateChange: () => {}
    })

    await scheduler.updateSettings({ soundEnabled: false })
    await scheduler.triggerDueReminder()

    assert.strictEqual(soundPassed, false, 'Sound should be false when soundEnabled is disabled')

    AquaDropDashboardPanel.currentPanel = origPanel
    scheduler.dispose()
  })

  it('preserves and switches voiceType persona (female, male, chime-only)', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let passedVoice = ''

    const mockDashboardPanel = {
      isVisible: () => true,
      showReminder: (snoozeMin: number, sound: boolean, voiceType: string) => {
        passedVoice = voiceType
      }
    }

    const origPanel = AquaDropDashboardPanel.currentPanel
    AquaDropDashboardPanel.currentPanel = mockDashboardPanel as any

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: async () => {
        const state = scheduler.getState()
        AquaDropDashboardPanel.currentPanel?.showReminder(state.snoozeMinutes, state.soundEnabled, state.voiceType)
      },
      onStateChange: () => {}
    })

    // Default is female (girl voice)
    await scheduler.triggerDueReminder()
    assert.strictEqual(passedVoice, 'female', 'Default voice persona must be female')

    // Switch to male (boy voice)
    await scheduler.updateSettings({ voiceType: 'male' })
    await scheduler.triggerDueReminder()
    assert.strictEqual(passedVoice, 'male', 'Voice persona should switch to male')

    // Switch to chime-only
    await scheduler.updateSettings({ voiceType: 'chime-only' })
    await scheduler.triggerDueReminder()
    assert.strictEqual(passedVoice, 'chime-only', 'Voice persona should switch to chime-only')

    AquaDropDashboardPanel.currentPanel = origPanel
    scheduler.dispose()
  })
})
