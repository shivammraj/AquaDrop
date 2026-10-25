import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { clampNumber, normalizeAppearance, formatCountdown, getDateKey, generateNonce } from '../utils'

describe('Utility Functions', () => {
  it('clampNumber correctly clamps and handles invalid inputs', () => {
    assert.strictEqual(clampNumber(30, 1, 1440, 30), 30)
    assert.strictEqual(clampNumber(0, 1, 1440, 30), 1)
    assert.strictEqual(clampNumber(2000, 1, 1440, 30), 1440)
    assert.strictEqual(clampNumber('45', 1, 1440, 30), 45)
    assert.strictEqual(clampNumber('invalid', 1, 1440, 30), 30)
    assert.strictEqual(clampNumber(NaN, 1, 1440, 30), 30)
    assert.strictEqual(clampNumber(Infinity, 1, 1440, 30), 30)
  })

  it('normalizeAppearance safely falls back to system', () => {
    assert.strictEqual(normalizeAppearance('light'), 'light')
    assert.strictEqual(normalizeAppearance('dark'), 'dark')
    assert.strictEqual(normalizeAppearance('system'), 'system')
    assert.strictEqual(normalizeAppearance('unknown'), 'system')
    assert.strictEqual(normalizeAppearance(undefined), 'system')
  })

  it('getDateKey formats YYYY-MM-DD properly', () => {
    const fixed = new Date('2026-10-24T10:15:30Z')
    const key = getDateKey(fixed.getTime())
    assert.match(key, /^\d{4}-\d{2}-\d{2}$/)
  })

  it('formatCountdown formats minutes and seconds correctly', () => {
    const now = 1000000
    assert.strictEqual(formatCountdown(null, now), 'Paused')
    assert.strictEqual(formatCountdown(now - 100, now), 'Due now')
    assert.strictEqual(formatCountdown(now + 65 * 1000, now), '01m 05s')
    assert.strictEqual(formatCountdown(now + 3665 * 1000, now), '1h 01m 05s')
  })

  it('generateNonce creates 32-character random string', () => {
    const n1 = generateNonce()
    const n2 = generateNonce()
    assert.strictEqual(n1.length, 32)
    assert.strictEqual(n2.length, 32)
    assert.notStrictEqual(n1, n2)
  })
})
