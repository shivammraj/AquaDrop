import React from 'react'
import { ReminderEngine, ReminderState } from '../../services/reminder-engine'

const engine = new ReminderEngine()

function formatCountdown(ms: number){
  if(ms <= 0) return 'Due'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}m ${s}s`
}

export function useReminder(){
  const [state, setState] = React.useState<ReminderState>(engine.loadState())
  const [nextIn, setNextIn] = React.useState('—')

  React.useEffect(()=>{
    const onChange = ()=> setState(engine.loadState())
    engine.on('change', onChange)
    const tick = setInterval(()=>{
      const ms = engine.getMsToNext()
      setNextIn(formatCountdown(ms))
    }, 1000)
    return ()=>{ engine.off('change', onChange); clearInterval(tick) }
  },[])

  return {
    state,
    start: ()=> engine.start(),
    pause: ()=> engine.pause(),
    toggle: ()=> state.enabled ? engine.pause() : engine.start(),
    ensurePermission: ()=> engine.ensureNotificationPermission()
  }
}
