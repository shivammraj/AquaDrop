// Simple background service worker using chrome.alarms to schedule reminders.
const STORAGE_KEY = 'aquadrop.extension.state'

const defaultState = {
  enabled: false,
  intervalValue: 30,
  intervalUnit: 'minutes',
  nextReminder: null,
  snoozeMinutes: 10
}

function loadState(callback) {
  chrome.storage.local.get([STORAGE_KEY], (res) => {
    const s = res[STORAGE_KEY]
    callback(Object.assign({}, defaultState, s || {}))
  })
}

function saveState(state, callback) {
  const obj = {}
  obj[STORAGE_KEY] = state
  chrome.storage.local.set(obj, callback)
}

function scheduleAlarm(state) {
  chrome.alarms.clear('aquadrop')
  let delayInMinutes = state.intervalValue
  if (state.intervalUnit === 'hours') delayInMinutes = state.intervalValue * 60
  chrome.alarms.create('aquadrop', { delayInMinutes })
}

chrome.runtime.onInstalled.addListener(() => {
  // ensure initial state
  saveState(defaultState, () => {})
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'start') {
    loadState((state) => {
      state.enabled = true
      state.nextReminder = Date.now() + (state.intervalUnit === 'hours' ? state.intervalValue * 3600000 : state.intervalValue * 60000)
      saveState(state, () => {
        scheduleAlarm(state)
        sendResponse({ ok: true, state })
      })
    })
    return true
  }

  if (message?.type === 'pause') {
    chrome.alarms.clear('aquadrop')
    loadState((state) => {
      state.enabled = false
      state.nextReminder = null
      saveState(state, () => sendResponse({ ok: true, state }))
    })
    return true
  }

  if (message?.type === 'setInterval') {
    loadState((state) => {
      state.intervalValue = message.value
      state.intervalUnit = message.unit
      saveState(state, () => {
        if (state.enabled) scheduleAlarm(state)
        sendResponse({ ok: true, state })
      })
    })
    return true
  }

  if (message?.type === 'snooze') {
    loadState((state) => {
      const snoozeMs = (state.snoozeMinutes || 10) * 60 * 1000
      state.nextReminder = Date.now() + snoozeMs
      saveState(state, () => {
        chrome.alarms.clear('aquadrop')
        chrome.alarms.create('aquadrop', { delayInMinutes: (snoozeMs / 60000) })
        sendResponse({ ok: true, state })
      })
    })
    return true
  }

  if (message?.type === 'getState') {
    loadState((state) => sendResponse({ ok: true, state }))
    return true
  }

  if (message?.type === 'recordDrink') {
    // simple notification + keep schedule
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'AquaDrop',
      message: 'Logged a drink.'
    }, () => {})
    sendResponse({ ok: true })
    return true
  }
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'aquadrop') return
  // Show a native Chrome notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'AquaDrop',
    message: 'Drink water, stay hydrated.'
  }, () => {})

  // Reschedule next alarm using stored interval
  loadState((state) => {
    if (state.enabled) {
      scheduleAlarm(state)
    }
  })
})
