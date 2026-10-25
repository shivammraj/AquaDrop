import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { validateWebviewMessage } from '../utils'

describe('Webview Message Validation', () => {
  it('accepts valid ready message', () => {
    const res = validateWebviewMessage({ type: 'ready' })
    assert.deepStrictEqual(res, { type: 'ready' })
  })

  it('accepts valid commands and preserves payload', () => {
    const validCommands = [
      'drinkWater',
      'snoozeReminder',
      'pauseReminders',
      'resumeReminders',
      'toggleReminders',
      'openDashboard',
      'resetDailyProgress',
      'startReminders',
      'openSettings',
      'changeInterval',
      'logWater',
      'testSound'
    ]

    for (const cmd of validCommands) {
      const res = validateWebviewMessage({ type: 'command', command: cmd, payload: { minutes: 10 } })
      assert.ok(res !== null, `Expected command ${cmd} to be valid`)
      assert.strictEqual(res.type, 'command')
      if (res.type === 'command') {
        assert.strictEqual(res.command, cmd)
        assert.deepStrictEqual(res.payload, { minutes: 10 })
      }
    }
  })

  it('accepts valid dismissToast and testSound messages', () => {
    const dismissRes = validateWebviewMessage({ type: 'dismissToast' })
    assert.deepStrictEqual(dismissRes, { type: 'dismissToast' })

    const soundRes = validateWebviewMessage({ type: 'testSound' })
    assert.deepStrictEqual(soundRes, { type: 'testSound' })
  })

  it('rejects unknown or arbitrary commands', () => {
    const malformed = [
      { type: 'command', command: 'eval' },
      { type: 'command', command: 'executeSystemCommand' },
      { type: 'command', command: '../hack' },
      { type: 'command' },
      { type: 'command', command: 123 }
    ]

    for (const item of malformed) {
      assert.strictEqual(validateWebviewMessage(item), null)
    }
  })

  it('accepts valid setting keys and values', () => {
    const validSettings = [
      { key: 'remindersEnabled', value: true },
      { key: 'intervalMinutes', value: 45 },
      { key: 'snoozeMinutes', value: 10 },
      { key: 'notificationsEnabled', value: false },
      { key: 'soundEnabled', value: true },
      { key: 'dailyGoal', value: 12 },
      { key: 'appearance', value: 'dark' }
    ]

    for (const s of validSettings) {
      const res = validateWebviewMessage({ type: 'updateSetting', key: s.key, value: s.value })
      assert.ok(res !== null, `Expected setting ${s.key} to be valid`)
      assert.strictEqual(res.type, 'updateSetting')
      if (res.type === 'updateSetting') {
        assert.strictEqual(res.key, s.key)
        assert.strictEqual(res.value, s.value)
      }
    }
  })

  it('rejects unknown or arbitrary setting keys', () => {
    const badSettings = [
      { type: 'updateSetting', key: '__proto__', value: 'exploit' },
      { type: 'updateSetting', key: 'admin', value: true },
      { type: 'updateSetting' },
      { type: 'updateSetting', key: 999 }
    ]

    for (const item of badSettings) {
      assert.strictEqual(validateWebviewMessage(item), null)
    }
  })

  it('rejects null, undefined, primitive, or unknown message types', () => {
    assert.strictEqual(validateWebviewMessage(null), null)
    assert.strictEqual(validateWebviewMessage(undefined), null)
    assert.strictEqual(validateWebviewMessage(12345), null)
    assert.strictEqual(validateWebviewMessage('string'), null)
    assert.strictEqual(validateWebviewMessage({ type: 'unknownType' }), null)
  })
})
