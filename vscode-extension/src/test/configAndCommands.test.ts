import './setup'
import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { executeNamedCommand } from '../commands'
import { AquaDropScheduler } from '../scheduler'
import { AquaDropStorage } from '../storage'
import { MockMemento } from './helpers'
import { AquaDropConfigManager } from '../config'

describe('Named Commands and Configuration Manager', () => {
  it('executes resetDailyProgress and resets snapshot today count', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    await scheduler.drinkWater()
    assert.strictEqual(scheduler.getSnapshot().todayCount, 1)

    let refreshCalled = false
    await executeNamedCommand('resetDailyProgress', {
      scheduler,
      extensionUri: {} as any,
      refreshWebviews: () => { refreshCalled = true }
    })

    assert.strictEqual(scheduler.getSnapshot().todayCount, 0)
    assert.strictEqual(refreshCalled, true)

    scheduler.dispose()
  })

  it('safely ignores unknown named commands without throwing', async () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    const scheduler = new AquaDropScheduler(storage, {
      onReminderDue: () => {},
      onStateChange: () => {}
    })

    await executeNamedCommand('unknownCommand', {
      scheduler,
      extensionUri: {} as any,
      refreshWebviews: () => {}
    })

    scheduler.dispose()
  })

  it('AquaDropConfigManager updates settings safely', async () => {
    await AquaDropConfigManager.updateSetting('intervalMinutes', 45)
    await AquaDropConfigManager.updateSetting('snoozeMinutes', 10)
    await AquaDropConfigManager.updateSetting('dailyGoal', 12)
    await AquaDropConfigManager.updateSetting('appearance', 'dark')

    const config = AquaDropConfigManager.getConfig()
    assert.strictEqual(config.intervalMinutes, 45)
    assert.strictEqual(config.snoozeMinutes, 10)
    assert.strictEqual(config.dailyGoal, 12)
    assert.strictEqual(config.appearance, 'dark')
  })
})
