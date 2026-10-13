import { describe, expect, it } from 'vitest'
import { ReminderEngine } from './reminder-engine'

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

  it('delays an upcoming reminder further into the future', () => {
    const engine = new ReminderEngine()
    engine.setInterval(30, 'minutes')
    engine.start()
    const before = engine.getCurrentState().nextReminder
    engine.snooze()
    const after = engine.getCurrentState().nextReminder
    expect(before).not.toBeNull()
    expect(after).not.toBeNull()
    expect(after).toBeGreaterThan(before as number)
    expect(engine.getCurrentState().enabled).toBe(true)
    expect(engine.getCurrentState().reminderOpen).toBe(false)
  })

  it('snoozes an active reminder for snooze duration from now', () => {
    const engine = new ReminderEngine()
    engine.setInterval(30, 'minutes')
    engine.start()
    // Simulate reminder trigger open
    ;(engine as any).state.reminderOpen = true
    engine.snooze()
    const after = engine.getCurrentState().nextReminder
    expect(after).not.toBeNull()
    expect(after).toBeGreaterThan(Date.now() - 100)
    expect(after).toBeLessThanOrEqual(Date.now() + 5 * 60 * 1000 + 1000)
    expect(engine.getCurrentState().reminderOpen).toBe(false)
  })

  it('delays an upcoming reminder by an explicit number of minutes', () => {
    const engine = new ReminderEngine()
    engine.setInterval(30, 'minutes')
    engine.start()
    const before = engine.getCurrentState().nextReminder!
    engine.snoozeFor(15)
    const after = engine.getCurrentState().nextReminder!
    expect(after).toBe(before + 15 * 60 * 1000)
  })

  it('updates voice type correctly', () => {
    const engine = new ReminderEngine()
    expect(engine.getCurrentState().voiceType).toBe('female')
    engine.setVoiceType('male')
    expect(engine.getCurrentState().voiceType).toBe('male')
    engine.setVoiceType('chime-only')
    expect(engine.getCurrentState().voiceType).toBe('chime-only')
  })
})
