// Background service worker using chrome.alarms and chrome.notifications
const STORAGE_KEY = 'aquadrop.extension.state'

const defaultState = {
  enabled: false,
  intervalValue: 30,
  intervalUnit: 'minutes',
  nextReminder: null,
  snoozeMinutes: 10,
  loggedDrinks: 0,
  lastDrinkAt: null
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
  chrome.storage.local.set(obj, () => {
    updateBadge(state)
    if (callback) callback()
  })
}

function updateBadge(state) {
  if (chrome.action) {
    if (state.enabled) {
      chrome.action.setBadgeText({ text: 'ON' })
      chrome.action.setBadgeBackgroundColor({ color: '#1677FF' })
    } else {
      chrome.action.setBadgeText({ text: '' })
    }
  }
}

function intervalMs(state) {
  return state.intervalUnit === 'hours'
    ? state.intervalValue * 60 * 60 * 1000
    : state.intervalValue * 60 * 1000
}

function scheduleAlarm(state) {
  chrome.alarms.clear('aquadrop', () => {
    if (!state.enabled) return
    let delayInMinutes = state.intervalValue
    if (state.intervalUnit === 'hours') delayInMinutes = state.intervalValue * 60
    chrome.alarms.create('aquadrop', { delayInMinutes, periodInMinutes: delayInMinutes })
  })
}

chrome.runtime.onInstalled.addListener(() => {
  loadState((state) => {
    saveState(state)
  })
})

function fireReminderNotification() {
  chrome.notifications.create('aquadrop-reminder', {
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Drink Water',
    message: 'Drink water, stay hydrated. It’s time for a water break! 💙',
    buttons: [
      { title: "I've drunk water" },
      { title: 'Remind me later' }
    ],
    priority: 2
  })
}

chrome.notifications.onButtonClicked.addListener((notifId, buttonIndex) => {
  if (notifId !== 'aquadrop-reminder') return

  if (buttonIndex === 0) {
    // I've drunk water
    loadState((state) => {
      state.loggedDrinks = (state.loggedDrinks || 0) + 1
      state.lastDrinkAt = Date.now()
      state.nextReminder = Date.now() + intervalMs(state)
      saveState(state, () => {
        scheduleAlarm(state)
        chrome.notifications.clear('aquadrop-reminder')
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'Drink Water',
          message: 'Great! Keep it up. 💙'
        })
      })
    })
  } else if (buttonIndex === 1) {
    // Remind me later
    loadState((state) => {
      const snoozeMs = (state.snoozeMinutes || 10) * 60 * 1000
      state.nextReminder = Date.now() + snoozeMs
      saveState(state, () => {
        chrome.alarms.clear('aquadrop', () => {
          chrome.alarms.create('aquadrop', { delayInMinutes: snoozeMs / 60000 })
        })
        chrome.notifications.clear('aquadrop-reminder')
      })
    })
  }
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'aquadrop') return
  fireReminderNotification()

  loadState((state) => {
    if (state.enabled) {
      state.nextReminder = Date.now() + intervalMs(state)
      saveState(state)
    }
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return

  if (message.type === 'start') {
    loadState((state) => {
      state.enabled = true
      state.nextReminder = Date.now() + intervalMs(state)
      saveState(state, () => {
        scheduleAlarm(state)
        sendResponse({ ok: true, state })
      })
    })
    return true
  }

  if (message.type === 'pause') {
    chrome.alarms.clear('aquadrop', () => {
      loadState((state) => {
        state.enabled = false
        state.nextReminder = null
        saveState(state, () => sendResponse({ ok: true, state }))
      })
    })
    return true
  }

  if (message.type === 'setInterval') {
    loadState((state) => {
      state.intervalValue = Number(message.value) || 30
      state.intervalUnit = message.unit === 'hours' ? 'hours' : 'minutes'
      if (state.enabled) {
        state.nextReminder = Date.now() + intervalMs(state)
      }
      saveState(state, () => {
        if (state.enabled) scheduleAlarm(state)
        sendResponse({ ok: true, state })
      })
    })
    return true
  }

  if (message.type === 'snooze') {
    loadState((state) => {
      const snoozeMs = (state.snoozeMinutes || 10) * 60 * 1000
      state.nextReminder = Date.now() + snoozeMs
      saveState(state, () => {
        chrome.alarms.clear('aquadrop', () => {
          chrome.alarms.create('aquadrop', { delayInMinutes: snoozeMs / 60000 })
        })
        sendResponse({ ok: true, state })
      })
    })
    return true
  }

  if (message.type === 'getState') {
    loadState((state) => sendResponse({ ok: true, state }))
    return true
  }

  if (message.type === 'recordDrink') {
    loadState((state) => {
      state.loggedDrinks = (state.loggedDrinks || 0) + 1
      state.lastDrinkAt = Date.now()
      if (state.enabled) {
        state.nextReminder = Date.now() + intervalMs(state)
        scheduleAlarm(state)
      }
      saveState(state, () => {
        sendResponse({ ok: true, state })
      })
    })
    return true
  }
})
