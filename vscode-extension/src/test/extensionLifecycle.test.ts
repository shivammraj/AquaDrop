import './setup'
import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { activate, deactivate } from '../extension'
import { MockMemento } from './helpers'
import { mockVscode } from './setup'

describe('Extension Lifecycle (Activation and Deactivation)', () => {
  it('activates successfully, registers views, commands and subscriptions, and deactivates cleanly', async () => {
    const subscriptions: Array<{ dispose: () => any }> = []
    const memento = new MockMemento()

    const mockContext: any = {
      subscriptions,
      globalState: memento,
      extensionUri: { fsPath: '/test/path' }
    }

    await activate(mockContext)

    // Verify commands were registered in mockVscode
    assert.ok(mockVscode.commands.registered.has('aquadrop.openDashboard'))
    assert.ok(mockVscode.commands.registered.has('aquadrop.drinkWater'))
    assert.ok(mockVscode.commands.registered.has('aquadrop.snoozeReminder'))
    assert.ok(mockVscode.commands.registered.has('aquadrop.pauseReminders'))
    assert.ok(mockVscode.commands.registered.has('aquadrop.resumeReminders'))
    assert.ok(mockVscode.commands.registered.has('aquadrop.toggleReminders'))
    assert.ok(mockVscode.commands.registered.has('aquadrop.resetDailyProgress'))

    // Verify subscriptions were added
    assert.ok(subscriptions.length >= 5)

    // Deactivate cleanly
    deactivate()

    // Dispose subscriptions
    for (const sub of subscriptions) {
      if (typeof sub.dispose === 'function') {
        sub.dispose()
      }
    }
  })
})
