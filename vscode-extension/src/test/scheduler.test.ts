import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { AquaDropScheduler } from '../scheduler'
import { AquaDropStorage } from '../storage'
import { MockMemento } from './helpers'
import { STATE_KEY } from '../types'

describe('AquaDropScheduler', () => {
  it('initializes and provides correct initial snapshot', () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let dueCount = 0

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => { dueCount++ },
      onStateChange: () => {}
    })

    const snapshot = scheduler.getSnapshot()
    assert.strictEqual(snapshot.enabled, true)
    assert.strictEqual(snapshot.paused, false)
    assert.strictEqual(snapshot.intervalMinutes, 30)
    assert.strictEqual(snapshot.snoozeMinutes, 5)
    assert.strictEqual(snapshot.dailyGoal, 8)
    assert.strictEqual(snapshot.todayCount, 0)
    assert.strictEqual(snapshot.progressPercent, 0)
    assert.ok(snapshot.countdownText.length > 0)
    assert.strictEqual(dueCount, 0)

    scheduler.dispose()
  })

  it('handles drink water break correctly', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let stateChanges = 0

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => { stateChanges++ }
    })

    const fixedTime = Date.now()
    await scheduler.drinkWater(fixedTime)

    const state = scheduler.getState()
    assert.strictEqual(state.lastDrinkAt, fixedTime)
    assert.strictEqual(state.enabled, true)
    assert.strictEqual(state.paused, false)
    assert.strictEqual(state.nextReminderAt, fixedTime + 30 * 60 * 1000)
    assert.strictEqual(scheduler.getSnapshot().todayCount, 1)
    assert.ok(stateChanges > 0)

    scheduler.dispose()
  })

  it('snoozes for specified or default duration and updates schedule', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    const before = Date.now()
    const duration = await scheduler.snooze(10)
    assert.strictEqual(duration, 10)

    const state = scheduler.getState()
    assert.strictEqual(state.enabled, true)
    assert.strictEqual(state.paused, false)
    assert.ok(state.nextReminderAt !== null && state.nextReminderAt >= before + 10 * 60 * 1000)

    // Test default snooze duration
    const defaultDuration = await scheduler.snooze()
    assert.strictEqual(defaultDuration, 5)

    scheduler.dispose()
  })

  it('pauses and resumes reminders properly', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    await scheduler.pause()
    assert.strictEqual(scheduler.getState().enabled, false)
    assert.strictEqual(scheduler.getState().paused, true)
    assert.strictEqual(scheduler.getState().nextReminderAt, null)
    assert.strictEqual(scheduler.getSnapshot().countdownText, 'Paused')

    await scheduler.resume()
    assert.strictEqual(scheduler.getState().enabled, true)
    assert.strictEqual(scheduler.getState().paused, false)
    assert.ok(scheduler.getState().nextReminderAt !== null)

    await scheduler.toggle()
    assert.strictEqual(scheduler.getState().paused, true)

    await scheduler.toggle()
    assert.strictEqual(scheduler.getState().paused, false)

    scheduler.dispose()
  })

  it('handles overdue reminders safely without flooding', async () => {
    const pastTime = Date.now() - 3600 * 1000 // 1 hour ago
    const memento = new MockMemento({
      [STATE_KEY]: {
        enabled: true,
        paused: false,
        intervalMinutes: 30,
        snoozeMinutes: 5,
        dailyGoal: 8,
        notificationsEnabled: true,
        appearance: 'system',
        nextReminderAt: pastTime,
        lastDrinkAt: null,
        history: {}
      }
    })

    const storage = new AquaDropStorage(memento)
    let reminderCalls = 0

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {
        reminderCalls++
      },
      onStateChange: () => {}
    })

    // Calling start on overdue state should fire at most ONCE and advance schedule into the future
    await scheduler.start()

    assert.strictEqual(reminderCalls, 1)
    const next = scheduler.getState().nextReminderAt
    assert.ok(next !== null && next > Date.now(), 'Next reminder is scheduled in future')

    scheduler.dispose()
  })

  it('prevents duplicate timers when rescheduled rapidly', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    // Call rescheduleTimer multiple times rapidly
    scheduler.rescheduleTimer()
    scheduler.rescheduleTimer()
    scheduler.rescheduleTimer()

    // Internal timer reference should still be single and active
    assert.ok((scheduler as any).timer !== undefined)

    scheduler.dispose()
    assert.strictEqual((scheduler as any).timer, undefined)
  })

  it('updates settings and recalculates schedule when interval changes', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    const now = Date.now()
    await scheduler.updateSettings({
      intervalMinutes: 45,
      dailyGoal: 10,
      notificationsEnabled: false,
      soundEnabled: false
    })

    const state = scheduler.getState()
    assert.strictEqual(state.intervalMinutes, 45)
    assert.strictEqual(state.dailyGoal, 10)
    assert.strictEqual(state.notificationsEnabled, false)
    assert.strictEqual(state.soundEnabled, false)
    assert.ok(state.nextReminderAt !== null && state.nextReminderAt >= now + 44 * 60 * 1000)

    scheduler.dispose()
  })

  it('supports 1-minute interval and provides diagnostic timing data', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let diagnosticReceived: any = null

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: (diagnostic) => {
        diagnosticReceived = diagnostic
      },
      onStateChange: () => {}
    })

    await scheduler.updateSettings({ intervalMinutes: 1 })
    const state = scheduler.getState()
    assert.strictEqual(state.intervalMinutes, 1)
    assert.ok(state.nextReminderAt !== null)
    const delayMs = state.nextReminderAt - Date.now()
    assert.ok(delayMs > 0 && delayMs <= 60000, 'Delay is within 1 minute')

    // Simulate due trigger
    await scheduler.triggerDueReminder()
    assert.ok(diagnosticReceived !== null, 'Diagnostic was provided to callback')
    assert.strictEqual(typeof diagnosticReceived.scheduledTime, 'number')
    assert.strictEqual(typeof diagnosticReceived.actualTime, 'number')
    assert.strictEqual(typeof diagnosticReceived.driftMs, 'number')

    scheduler.dispose()
  })

  it('preserves existing schedule on restart and does not overwrite future nextReminderAt', async () => {
    const futureTime = Date.now() + 45 * 1000 // 45 seconds in the future
    const memento = new MockMemento({
      [STATE_KEY]: {
        enabled: true,
        paused: false,
        intervalMinutes: 1,
        snoozeMinutes: 5,
        dailyGoal: 8,
        notificationsEnabled: true,
        soundEnabled: true,
        appearance: 'system',
        nextReminderAt: futureTime,
        lastDrinkAt: null,
        history: {}
      }
    })

    const storage = new AquaDropStorage(memento)
    let dueCalls = 0

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => { dueCalls++ },
      onStateChange: () => {}
    })

    // Simulate workspace config synchronization on startup
    await scheduler.syncConfigFromWorkspace({
      intervalMinutes: 1,
      snoozeMinutes: 5,
      dailyGoal: 8,
      notificationsEnabled: true,
      soundEnabled: true,
      appearance: 'system',
      remindersEnabled: true
    })

    // Assert future nextReminderAt was preserved
    assert.strictEqual(scheduler.getState().nextReminderAt, futureTime)

    await scheduler.start()
    assert.strictEqual(scheduler.getState().nextReminderAt, futureTime)
    assert.strictEqual(dueCalls, 0)

    scheduler.dispose()
  })

  it('updating unrelated settings does not reset active countdown schedule', async () => {
    const targetSchedule = Date.now() + 20 * 60 * 1000 // 20m from now
    const memento = new MockMemento({
      [STATE_KEY]: {
        enabled: true,
        paused: false,
        intervalMinutes: 30,
        snoozeMinutes: 5,
        dailyGoal: 8,
        notificationsEnabled: true,
        soundEnabled: true,
        appearance: 'system',
        nextReminderAt: targetSchedule,
        lastDrinkAt: null,
        history: {}
      }
    })

    const storage = new AquaDropStorage(memento)
    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    // Change appearance and dailyGoal
    await scheduler.updateSettings({
      appearance: 'dark',
      dailyGoal: 12,
      soundEnabled: false
    })

    assert.strictEqual(scheduler.getState().appearance, 'dark')
    assert.strictEqual(scheduler.getState().dailyGoal, 12)
    assert.strictEqual(scheduler.getState().soundEnabled, false)
    assert.strictEqual(scheduler.getState().nextReminderAt, targetSchedule)

    scheduler.dispose()
  })

  it('checkDue triggers when past due without busy polling', async () => {
    const pastTime = Date.now() - 500
    const memento = new MockMemento({
      [STATE_KEY]: {
        enabled: true,
        paused: false,
        intervalMinutes: 1,
        snoozeMinutes: 5,
        dailyGoal: 8,
        notificationsEnabled: true,
        soundEnabled: true,
        appearance: 'system',
        nextReminderAt: pastTime,
        lastDrinkAt: null,
        history: {}
      }
    })

    const storage = new AquaDropStorage(memento)
    let triggered = false

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => { triggered = true },
      onStateChange: () => {}
    })

    const wasDue = await scheduler.checkDue()
    assert.strictEqual(wasDue, true)
    assert.strictEqual(triggered, true)

    scheduler.dispose()
  })

  it('cleans up resources cleanly on dispose', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)

    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    await scheduler.start()
    assert.ok((scheduler as any).timer !== undefined)

    scheduler.dispose()
    assert.strictEqual((scheduler as any).timer, undefined)
  })
})
