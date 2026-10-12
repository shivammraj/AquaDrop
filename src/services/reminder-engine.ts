import { ReminderState } from '../types/reminder'

type Listener = () => void

export class ReminderEngine {
  private state: ReminderState
  private timer: number | null = null
  private bc: BroadcastChannel | null = null
  private listeners = new Set<Listener>()

  constructor(){
    this.state = loadState()
    try{
      this.bc = new BroadcastChannel('aquadrop')
      this.bc.onmessage = (ev)=>{
        if(ev.data?.type === 'state'){
          this.state = ev.data.state
          this.emitChange()
          this.reschedule()
        }
      }
    } catch(e){
      this.bc = null
    }
    this.reschedule()
  }

  on(event:'change', cb: Listener){ this.listeners.add(cb) }
  off(event:'change', cb: Listener){ this.listeners.delete(cb) }
  private emitChange(){ this.listeners.forEach(l=>l()) }

  loadState(){ return this.state }

  private persist(){
    saveState(this.state)
    if(this.bc) this.bc.postMessage({type:'state', state: this.state})
    this.emitChange()
  }

  start(){
    const now = Date.now()
    const next = now + this.intervalMs()
    this.state.enabled = true
    this.state.nextReminder = next
    this.persist()
    this.reschedule()
  }

  pause(){
    this.state.enabled = false
    this.state.nextReminder = null
    this.persist()
    this.clearTimer()
  }

  setIntervalValue(val:number, unit:'minutes'|'hours'){
    if(!(val>0)) throw new Error('Invalid interval')
    this.state.intervalValue = val
    this.state.intervalUnit = unit
    if(this.state.enabled){
      this.state.nextReminder = Date.now() + this.intervalMs()
    }
    this.persist()
    this.reschedule()
  }

  snooze(){
    const now = Date.now()
    this.state.nextReminder = now + this.state.snoozeMinutes * 60000
    this.persist()
    this.reschedule()
  }

  recordDrink(){
    // For now, just schedule next
    this.state.nextReminder = Date.now() + this.intervalMs()
    this.persist()
    this.reschedule()
  }

  getMsToNext(){
    if(!this.state.nextReminder) return Infinity
    return Math.max(0, this.state.nextReminder - Date.now())
  }

  ensureNotificationPermission(){
    if(!('Notification' in window)) return Promise.resolve(false)
    if(Notification.permission === 'granted') return Promise.resolve(true)
    if(Notification.permission === 'denied') return Promise.resolve(false)
    return Notification.requestPermission().then(p=> p === 'granted')
  }

  private intervalMs(){
    return this.state.intervalUnit === 'hours' ? this.state.intervalValue * 3600000 : this.state.intervalValue * 60000
  }

  private clearTimer(){
    if(this.timer) { clearTimeout(this.timer); this.timer = null }
  }

  private reschedule(){
    this.clearTimer()
    if(!this.state.enabled || !this.state.nextReminder) return
    const ms = this.state.nextReminder - Date.now()
    if(ms <= 0){
      // due now
      this.fireReminder()
      return
    }
    this.timer = window.setTimeout(()=> this.fireReminder(), ms)
  }

  private fireReminder(){
    // show notification if allowed
    if(this.state.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted'){
      try{
        const n = new Notification('AquaDrop', {
          body: 'Drink water, stay hydrated.',
          icon: '/src/assets/water-drop-icon.svg'
        })
        n.onclick = ()=>{
          window.focus()
          n.close()
        }
      } catch(e){
        console.warn('Notification failed', e)
      }
    }
    // schedule next
    this.state.nextReminder = Date.now() + this.intervalMs()
    this.persist()
    this.reschedule()
  }
}

// local helpers
import { saveState, loadState } from './storage'
