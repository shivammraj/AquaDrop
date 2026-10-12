document.addEventListener('DOMContentLoaded', () => {
  const statusText = document.getElementById('statusText')
  const dot = document.getElementById('dot')
  const drinksCount = document.getElementById('drinksCount')
  const secTimer = document.getElementById('secTimer')
  const toggleBtn = document.getElementById('toggleBtn')
  const logDrinkBtn = document.getElementById('logDrinkBtn')
  const snoozeBtn = document.getElementById('snoozeBtn')
  const p30 = document.getElementById('p30')
  const p60 = document.getElementById('p60')
  const p120 = document.getElementById('p120')
  const customValue = document.getElementById('customValue')
  const customUnit = document.getElementById('customUnit')
  const setCustomBtn = document.getElementById('setCustomBtn')
  const notice = document.getElementById('notice')

  let currentState = null

  function showNotice(msg) {
    if (!notice) return
    notice.textContent = msg
    notice.style.display = 'block'
    setTimeout(() => {
      notice.style.display = 'none'
    }, 2500)
  }

  function render(state) {
    if (!state) return
    currentState = state

    // Status text, dot & seconds timer
    if (state.enabled && state.nextReminder) {
      const diffMs = state.nextReminder - Date.now()
      if (diffMs <= 0) {
        statusText.textContent = 'Active · Due now'
        if (secTimer) secTimer.textContent = '00:00'
      } else {
        const totalSecs = Math.floor(diffMs / 1000)
        const h = Math.floor(totalSecs / 3600)
        const m = Math.floor((totalSecs % 3600) / 60)
        const s = totalSecs % 60
        const formatted = h > 0
          ? `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
          : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
        statusText.textContent = `Active · ${formatted}`

        if (secTimer) {
          secTimer.textContent = h > 0
            ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        }
      }
      dot.className = 'dot'
      toggleBtn.textContent = 'Pause Reminders'
      toggleBtn.className = 'btn'
    } else {
      statusText.textContent = 'Paused'
      if (secTimer) secTimer.textContent = '--:--'
      dot.className = 'dot paused'
      toggleBtn.textContent = 'Start Reminders'
      toggleBtn.className = 'btn btn-primary'
    }

    // Drinks count
    drinksCount.textContent = `${state.loggedDrinks || 0} logged`

    // Presets
    const is30 = state.intervalValue === 30 && state.intervalUnit === 'minutes'
    const is60 = (state.intervalValue === 1 && state.intervalUnit === 'hours') || (state.intervalValue === 60 && state.intervalUnit === 'minutes')
    const is120 = (state.intervalValue === 2 && state.intervalUnit === 'hours') || (state.intervalValue === 120 && state.intervalUnit === 'minutes')

    p30.className = is30 ? 'preset-btn active' : 'preset-btn'
    p60.className = is60 ? 'preset-btn active' : 'preset-btn'
    p120.className = is120 ? 'preset-btn active' : 'preset-btn'

    customValue.value = state.intervalValue
    customUnit.value = state.intervalUnit
  }

  function refresh() {
    chrome.runtime.sendMessage({ type: 'getState' }, (resp) => {
      if (resp && resp.state) {
        render(resp.state)
      }
    })
  }

  // Live 1-second ticker for smooth seconds countdown
  setInterval(() => {
    if (currentState && currentState.enabled && currentState.nextReminder) {
      render(currentState)
    }
  }, 1000)

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (currentState && currentState.enabled) {
        chrome.runtime.sendMessage({ type: 'pause' }, (resp) => {
          if (resp && resp.state) render(resp.state)
        })
      } else {
        chrome.runtime.sendMessage({ type: 'start' }, (resp) => {
          if (resp && resp.state) render(resp.state)
        })
      }
    })
  }

  if (logDrinkBtn) {
    logDrinkBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'recordDrink' }, (resp) => {
        showNotice('Great! Water logged 💧')
        if (resp && resp.state) render(resp.state)
      })
    })
  }

  if (snoozeBtn) {
    snoozeBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'snooze' }, (resp) => {
        showNotice('Snoozed for 10 minutes ⏱')
        if (resp && resp.state) render(resp.state)
      })
    })
  }

  function setIntervalPreset(val, unit) {
    chrome.runtime.sendMessage({ type: 'setInterval', value: val, unit: unit }, (resp) => {
      if (resp && resp.state) render(resp.state)
    })
  }

  if (p30) p30.addEventListener('click', () => setIntervalPreset(30, 'minutes'))
  if (p60) p60.addEventListener('click', () => setIntervalPreset(1, 'hours'))
  if (p120) p120.addEventListener('click', () => setIntervalPreset(2, 'hours'))

  if (setCustomBtn) {
    setCustomBtn.addEventListener('click', () => {
      const val = Math.max(1, Number(customValue.value) || 30)
      const unit = customUnit.value || 'minutes'
      setIntervalPreset(val, unit)
      showNotice(`Interval set to ${val} ${unit}`)
    })
  }

  refresh()
})
