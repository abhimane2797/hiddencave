let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

export function unlockAudio() {
  const context = getContext()
  if (context && context.state === 'suspended') {
    void context.resume()
  }
}

interface ToneSpec {
  freq: number
  start: number
  duration: number
  gain: number
}

async function playTones(tones: ToneSpec[]) {
  const context = getContext()
  if (!context) return
  if (context.state === 'suspended') {
    await context.resume()
  }
  const base = context.currentTime
  tones.forEach(({ freq, start, duration, gain }) => {
    const osc = context.createOscillator()
    const amp = context.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    amp.gain.setValueAtTime(0.0001, base + start)
    amp.gain.exponentialRampToValueAtTime(gain, base + start + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, base + start + duration)
    osc.connect(amp)
    amp.connect(context.destination)
    osc.start(base + start)
    osc.stop(base + start + duration + 0.05)
  })
}

export function playWarningChime() {
  void playTones([
    { freq: 660, start: 0, duration: 0.22, gain: 0.08 },
    { freq: 880, start: 0.18, duration: 0.24, gain: 0.08 },
  ])
}

export function playAlarmRing() {
  void playTones([
    { freq: 880, start: 0, duration: 0.18, gain: 0.12 },
    { freq: 1174, start: 0.2, duration: 0.18, gain: 0.12 },
    { freq: 880, start: 0.42, duration: 0.18, gain: 0.12 },
  ])
}

export function playSuccessChime() {
  void playTones([
    { freq: 523, start: 0, duration: 0.16, gain: 0.08 },
    { freq: 659, start: 0.14, duration: 0.16, gain: 0.08 },
    { freq: 784, start: 0.28, duration: 0.24, gain: 0.08 },
  ])
}