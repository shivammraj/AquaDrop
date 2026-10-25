import './setup'
import * as assert from 'node:assert'
import { AquaDropScheduler, ReminderDiagnostic } from '../scheduler'
import { AquaDropStorage } from '../storage'
import { MockMemento } from './helpers'

async function runOneMinuteSmokeTest() {
  console.log('[Real 1-Minute Smoke Test] Starting test at:', new Date().toLocaleTimeString())
  const memento = new MockMemento()
  const storage = new AquaDropStorage(memento)

  let triggered = false
  let diagnosticData: ReminderDiagnostic | null = null
  const t0 = Date.now()

  const scheduler = new AquaDropScheduler(storage, {
    onReminderDue: (diagnostic) => {
      triggered = true
      diagnosticData = diagnostic
      const t1 = Date.now()
      const elapsed = t1 - t0
      console.log(`[Real 1-Minute Smoke Test] Callback fired at: ${new Date().toLocaleTimeString()} (Elapsed: ${elapsed}ms)`)
      console.log(`[Real 1-Minute Smoke Test] Diagnostic: scheduledTime=${new Date(diagnostic.scheduledTime).toLocaleTimeString()}, actualTime=${new Date(diagnostic.actualTime).toLocaleTimeString()}, drift=${diagnostic.driftMs}ms`)
    },
    onStateChange: () => {},
    logDiagnostic: (msg) => console.log(`[Diagnostic Log] ${msg}`)
  })

  // Configure 1-minute interval
  await scheduler.updateSettings({ intervalMinutes: 1 })
  const initialNext = scheduler.getState().nextReminderAt
  assert.ok(initialNext !== null, 'nextReminderAt must be set')
  console.log(`[Real 1-Minute Smoke Test] Target nextReminderAt: ${new Date(initialNext).toLocaleTimeString()} (in ${(initialNext - t0) / 1000}s)`)

  // Wait 61 seconds for the real timer to trigger
  console.log('[Real 1-Minute Smoke Test] Waiting 61 seconds for real 1-minute timer to fire...')
  await new Promise((resolve) => setTimeout(resolve, 61500))

  assert.strictEqual(triggered, true, 'Reminder must have triggered within 61.5 seconds')
  assert.ok(diagnosticData !== null, 'Diagnostic data must be populated')
  assert.ok(Math.abs((diagnosticData as ReminderDiagnostic).driftMs) < 2000, 'Drift should be small under normal scheduler conditions')

  const nextAfter = scheduler.getState().nextReminderAt
  assert.ok(nextAfter !== null && nextAfter > Date.now(), 'Next reminder schedule advanced into future')

  scheduler.dispose()
  console.log('[Real 1-Minute Smoke Test] PASSED successfully!')
}

runOneMinuteSmokeTest().catch((err) => {
  console.error('[Real 1-Minute Smoke Test] FAILED:', err)
  process.exit(1)
})
