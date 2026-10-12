document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status')
  const startBtn = document.getElementById('start')
  const pauseBtn = document.getElementById('pause')
  const setBtn = document.getElementById('setInterval')
  const intervalValue = document.getElementById('intervalValue')
  const intervalUnit = document.getElementById('intervalUnit')
  const snoozeBtn = document.getElementById('snooze')
  const logBtn = document.getElementById('log')

  function refresh() {
    chrome.runtime.sendMessage({ type: 'getState' }, (resp) => {
      if (resp && resp.state) {
        const s = resp.state
        statusEl.textContent = s.enabled ? `Active · next in ${Math.round((s.nextReminder - Date.now())/60000)}m` : 'Paused'
        intervalValue.value = s.intervalValue
        intervalUnit.value = s.intervalUnit
      }
    })
  }

  startBtn!.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'start' }, refresh)
  })

  pauseBtn!.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'pause' }, refresh)
  })

  setBtn!.addEventListener('click', () => {
    const value = Number(intervalValue.value)
    const unit = intervalUnit.value
    chrome.runtime.sendMessage({ type: 'setInterval', value, unit }, refresh)
  })

  snoozeBtn!.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'snooze' }, refresh)
  })

  logBtn!.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'recordDrink' }, () => {
      alert('Drink logged')
    })
  })

  refresh()
})
