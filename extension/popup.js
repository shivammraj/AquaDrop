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
      playDrinkingSound()
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

function playDrinkingSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const now = ctx.currentTime

    const createGulp = (startTime, startFreq, endFreq, vol) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(startFreq, startTime)
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.14)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.18)

      const subOsc = ctx.createOscillator()
      const subGain = ctx.createGain()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(140, startTime + 0.02)
      subOsc.frequency.exponentialRampToValueAtTime(70, startTime + 0.13)

      subGain.gain.setValueAtTime(0, startTime + 0.02)
      subGain.gain.linearRampToValueAtTime(vol * 0.6, startTime + 0.04)
      subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15)

      subOsc.connect(subGain)
      subGain.connect(ctx.destination)
      subOsc.start(startTime + 0.02)
      subOsc.stop(startTime + 0.16)
    }

    createGulp(now, 420, 220, 0.28)
    createGulp(now + 0.22, 380, 190, 0.25)
    createGulp(now + 0.44, 340, 170, 0.22)

    const dropOsc = ctx.createOscillator()
    const dropGain = ctx.createGain()
    dropOsc.type = 'sine'
    dropOsc.frequency.setValueAtTime(1300, now + 0.64)
    dropOsc.frequency.exponentialRampToValueAtTime(1850, now + 0.72)
    dropOsc.frequency.exponentialRampToValueAtTime(1450, now + 0.84)

    dropGain.gain.setValueAtTime(0, now + 0.64)
    dropGain.gain.linearRampToValueAtTime(0.18, now + 0.66)
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95)

    dropOsc.connect(dropGain)
    dropGain.connect(ctx.destination)
    dropOsc.start(now + 0.64)
    dropOsc.stop(now + 0.98)
  } catch (err) {
    // Ignore audio context errors
  }
}
