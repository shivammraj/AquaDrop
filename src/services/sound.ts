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

/**
 * Speaks a hydration reminder using the browser's Web Speech API.
 * Supports 'female' (girl) and 'male' (boy) voice personas.
 */
export function speakReminder(
  voiceType: 'female' | 'male' = 'female',
  customPhrase?: string
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  try {
    window.speechSynthesis.cancel()

    const phrase = customPhrase || 'Drink water, stay hydrated, and continue your work!'
    const utterance = new SpeechSynthesisUtterance(phrase)
    utterance.rate = 0.95 // Clear, natural pace

    const voices = window.speechSynthesis.getVoices()
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'))

    if (voiceType === 'female') {
      const femaleVoice =
        englishVoices.find((v) =>
          /zira|jenny|samantha|victoria|karen|susan|female|fiona|moira|tessa/i.test(v.name)
        ) ||
        englishVoices[0] ||
        voices[0]

      if (femaleVoice) utterance.voice = femaleVoice
      utterance.pitch = 1.15 // Friendly, warm female tone
    } else {
      const maleVoice =
        englishVoices.find((v) =>
          /david|guy|mark|alex|daniel|george|male|oliver|arthur|rishi/i.test(v.name)
        ) ||
        englishVoices.find(
          (v) =>
            !/zira|jenny|samantha|victoria|karen|susan|female|fiona|moira|tessa/i.test(v.name)
        ) ||
        voices[0]

      if (maleVoice) utterance.voice = maleVoice
      utterance.pitch = 0.85 // Encouraging, confident male tone
    }

    window.speechSynthesis.speak(utterance)
  } catch {
    // Ignore speech errors or restrictions
  }
}

/**
 * Plays the pleasant water chime, followed by the spoken voice reminder.
 */
export function playReminderSound(voiceType: 'female' | 'male' | 'chime-only' = 'female'): void {
  playWaterChime()
  if (voiceType !== 'chime-only') {
    setTimeout(() => {
      speakReminder(voiceType)
    }, 280)
  }
}
