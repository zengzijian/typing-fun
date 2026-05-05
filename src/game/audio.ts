export type SoundEvent =
  | 'keystroke'
  | 'error'
  | 'kill'
  | 'kill_boss'
  | 'combo5'
  | 'combo10'
  | 'combo20'
  | 'center_hit'
  | 'game_over'
  | 'victory'
  | 'upgrade'
  | 'area_bomb'
  | 'freeze'

let _ctx: AudioContext | null = null
let _muted = localStorage.getItem('typing-fun-muted') === 'true'

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function osc(
  ac: AudioContext,
  type: OscillatorType,
  freq: number,
  gainPeak: number,
  attackMs: number,
  releaseMs: number,
  startOffset = 0,
): void {
  const g = ac.createGain()
  const o = ac.createOscillator()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, ac.currentTime + startOffset / 1000)
  g.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + startOffset / 1000 + attackMs / 1000)
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + startOffset / 1000 + (attackMs + releaseMs) / 1000,
  )
  o.connect(g)
  g.connect(ac.destination)
  o.start(ac.currentTime + startOffset / 1000)
  o.stop(ac.currentTime + startOffset / 1000 + (attackMs + releaseMs) / 1000)
}

function sweep(
  ac: AudioContext,
  type: OscillatorType,
  freqStart: number,
  freqEnd: number,
  gainPeak: number,
  durationMs: number,
  startOffset = 0,
): void {
  const g = ac.createGain()
  const o = ac.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freqStart, ac.currentTime + startOffset / 1000)
  o.frequency.linearRampToValueAtTime(freqEnd, ac.currentTime + startOffset / 1000 + durationMs / 1000)
  g.gain.setValueAtTime(gainPeak, ac.currentTime + startOffset / 1000)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startOffset / 1000 + durationMs / 1000)
  o.connect(g)
  g.connect(ac.destination)
  o.start(ac.currentTime + startOffset / 1000)
  o.stop(ac.currentTime + startOffset / 1000 + durationMs / 1000)
}

function noise(ac: AudioContext, gainPeak: number, cutoff: number, durationMs: number): void {
  const buf = ac.createBuffer(1, ac.sampleRate * (durationMs / 1000), ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf
  const filt = ac.createBiquadFilter()
  filt.type = 'lowpass'
  filt.frequency.value = cutoff
  const g = ac.createGain()
  g.gain.setValueAtTime(gainPeak, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durationMs / 1000)
  src.connect(filt)
  filt.connect(g)
  g.connect(ac.destination)
  src.start()
  src.stop(ac.currentTime + durationMs / 1000)
}

function arpeggio(ac: AudioContext, freqs: number[], stepMs: number, gainPeak: number): void {
  freqs.forEach((freq, i) => osc(ac, 'triangle', freq, gainPeak, 10, stepMs - 10, i * stepMs))
}

const SYNTHS: Record<SoundEvent, (ac: AudioContext) => void> = {
  keystroke: (ac) => osc(ac, 'square', 900, 0.06, 5, 35),
  error: (ac) => osc(ac, 'sawtooth', 140, 0.12, 10, 80),
  kill: (ac) => {
    noise(ac, 0.18, 600, 80)
    osc(ac, 'sine', 180, 0.15, 5, 100)
  },
  kill_boss: (ac) => {
    noise(ac, 0.35, 800, 200)
    osc(ac, 'sine', 80, 0.25, 10, 300)
    osc(ac, 'sine', 160, 0.15, 5, 200)
  },
  combo5: (ac) => arpeggio(ac, [523, 659, 784], 70, 0.12),
  combo10: (ac) => arpeggio(ac, [659, 784, 988], 65, 0.15),
  combo20: (ac) => arpeggio(ac, [784, 988, 1175, 1568], 60, 0.18),
  center_hit: (ac) => {
    sweep(ac, 'sine', 90, 45, 0.3, 300)
    osc(ac, 'sine', 60, 0.2, 20, 250)
  },
  game_over: (ac) => arpeggio(ac, [440, 370, 330, 220], 150, 0.15),
  victory: (ac) => arpeggio(ac, [523, 659, 784, 1047, 1319], 120, 0.16),
  upgrade: (ac) => {
    sweep(ac, 'triangle', 400, 1200, 0.12, 150)
    osc(ac, 'triangle', 1200, 0.1, 10, 120, 160)
  },
  area_bomb: (ac) => {
    noise(ac, 0.4, 1200, 300)
    osc(ac, 'sine', 60, 0.3, 20, 400)
    osc(ac, 'sine', 120, 0.2, 10, 300)
  },
  freeze: (ac) => {
    sweep(ac, 'triangle', 1400, 600, 0.1, 200)
    osc(ac, 'triangle', 800, 0.08, 5, 150, 100)
  },
}

export function playSound(event: SoundEvent): void {
  if (_muted) return
  try {
    SYNTHS[event]?.(ctx())
  } catch {
    // AudioContext may be unavailable in some environments
  }
}

export function setMuted(v: boolean): void {
  _muted = v
  localStorage.setItem('typing-fun-muted', String(v))
}

export function isMuted(): boolean {
  return _muted
}
