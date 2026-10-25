import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { AquaDropStorage } from '../storage'
import { MockMemento } from './helpers'
import { STATE_KEY } from '../types'
import { getDateKey } from '../utils'

describe('AquaDropStorage', () => {
  it('loads default state when memento is empty', () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    const state = storage.loadState()

    assert.strictEqual(state.enabled, true)
    assert.strictEqual(state.paused, false)
    assert.strictEqual(state.intervalMinutes, 30)
    assert.strictEqual(state.snoozeMinutes, 5)
    assert.strictEqual(state.dailyGoal, 8)
    assert.strictEqual(state.notificationsEnabled, true)
    assert.strictEqual(state.appearance, 'system')
    assert.ok(typeof state.nextReminderAt === 'number')
    assert.strictEqual(state.lastDrinkAt, null)

    const todayKey = getDateKey(Date.now())
    assert.strictEqual(state.history[todayKey], 0)
  })

  it('sanitizes and clamps corrupt stored data safely', () => {
    const corrupt = {
      intervalMinutes: 999999, // exceeds 1440
      snoozeMinutes: -10, // below 1
      dailyGoal: 'not-a-number', // invalid
      notificationsEnabled: 'yes', // non-boolean
      appearance: 'rainbow', // invalid appearance
      history: {
        '2026-01-01': 5,
        badDate: 'invalid'
      }
    }
    const memento = new MockMemento({ [STATE_KEY]: corrupt })
    const storage = new AquaDropStorage(memento)
    const state = storage.loadState()

    assert.strictEqual(state.intervalMinutes, 1440)
    assert.strictEqual(state.snoozeMinutes, 1)
    assert.strictEqual(state.dailyGoal, 8) // defaulted
    assert.strictEqual(state.notificationsEnabled, true) // defaulted
    assert.strictEqual(state.appearance, 'system') // defaulted
    assert.strictEqual(state.history['2026-01-01'], 5)
    assert.strictEqual(state.history['badDate'], undefined)
  })

  it('records water breaks and increments count for the current day', () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let state = storage.loadState()

    const fixedTime = new Date('2026-10-24T12:00:00Z').getTime()
    state = storage.recordWaterBreak(state, fixedTime)
    assert.strictEqual(storage.getTodayCount(state, fixedTime), 1)
    assert.strictEqual(state.lastDrinkAt, fixedTime)

    state = storage.recordWaterBreak(state, fixedTime + 1000)
    assert.strictEqual(storage.getTodayCount(state, fixedTime), 2)
  })

  it('resets today progress without clearing historical days', () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    let state = storage.loadState()

    const today = new Date('2026-10-24T12:00:00Z').getTime()
    state.history['2026-10-23'] = 7 // yesterday
    state = storage.recordWaterBreak(state, today)
    assert.strictEqual(storage.getTodayCount(state, today), 1)

    state = storage.resetTodayProgress(state, today)
    assert.strictEqual(storage.getTodayCount(state, today), 0)
    assert.strictEqual(state.lastDrinkAt, null)
    assert.strictEqual(state.history['2026-10-23'], 7)
  })

  it('returns recent history sorted descending by date', () => {
    const memento = new MockMemento()
    const storage = new AquaDropStorage(memento)
    const state = storage.loadState()
    state.history = {
      '2026-10-20': 4,
      '2026-10-22': 8,
      '2026-10-21': 6
    }

    const recent = storage.getRecentHistory(state, 2)
    assert.strictEqual(recent.length, 2)
    assert.strictEqual(recent[0].date, '2026-10-22')
    assert.strictEqual(recent[0].count, 8)
    assert.strictEqual(recent[1].date, '2026-10-21')
    assert.strictEqual(recent[1].count, 6)
  })
})
