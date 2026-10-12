// Audio synthesizer for pleasant water drop & celebration chimes without external assets
export function playWaterChime() {
  if (typeof window === 'undefined') return

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Oscillator 1: High bubble pop
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(600, now)
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.08)
    osc1.frequency.exponentialRampToValueAtTime(950, now + 0.18)

    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.32)

    // Oscillator 2: Gentle resonance ripple
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1100, now + 0.05)
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.12)
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.28)

    gain2.gain.setValueAtTime(0, now + 0.05)
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)

    osc2.start(now + 0.05)
    osc2.stop(now + 0.4)
  } catch {
    // Audio playback error or blocked by browser policy
  }
}

export function playCelebrationChime() {
  if (typeof window === 'undefined') return

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.07

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + 0.36)
    })
  } catch {
    // Ignore audio playback error
  }
}
