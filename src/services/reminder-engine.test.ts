import { describe, expect, it } from 'vitest'
import { ReminderEngine } from './services/reminder-engine'

describe('ReminderEngine', () => {
  it('creates a valid schedule when started', () => {
    const engine = new ReminderEngine()
    const stateBefore = engine.getCurrentState()
    engine.setInterval(30, 'minutes')
    engine.start()
    const state = engine.getCurrentState()

    expect(stateBefore.enabled).toBe(false)
    expect(state.enabled).toBe(true)
    expect(state.nextReminder).not.toBeNull()
  })

  it('pauses reminders and clears the next reminder', () => {
    const engine = new ReminderEngine()
    engine.setInterval(30, 'minutes')
    engine.start()
    engine.pause()
    const state = engine.getCurrentState()
    expect(state.enabled).toBe(false)
    expect(state.nextReminder).toBeNull()
  })

  it('resumes reminders with a new future date', () => {
    const engine = new ReminderEngine()
    engine.setInterval(1, 'hours')
    engine.resume()
    const state = engine.getCurrentState()
    expect(state.enabled).toBe(true)
    expect(state.nextReminder).not.toBeNull()
  })

  it('rejects invalid intervals and snooze values', () => {
    const engine = new ReminderEngine()
    expect(() => engine.setInterval(0, 'minutes')).toThrow()
    expect(() => engine.setSnoozeMinutes(0)).toThrow()
  })

  it('snoozes once and keeps a single active schedule', () => {
    const engine = new ReminderEngine()
    engine.setInterval(30, 'minutes')
    engine.start()
    const before = engine.getCurrentState().nextReminder
    engine.snooze()
    const after = engine.getCurrentState().nextReminder
    expect(before).not.toBeNull()
    expect(after).not.toBeNull()
    expect(after).toBeGreaterThan(before as number)
  })
})
