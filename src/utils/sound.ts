// Synthesized gentle UI sounds using Web Audio API (no external audio assets needed)

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.08,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playSound(
  effect: 'tap' | 'correct' | 'incorrect' | 'victory' | 'coin',
  enabled = true
) {
  if (!enabled) return;
  try {
    switch (effect) {
      case 'tap':
        playTone(520, 0.06, 'sine', 0.05);
        break;
      case 'correct':
        playTone(523.25, 0.12, 'triangle', 0.09, 0);
        playTone(659.25, 0.14, 'triangle', 0.09, 0.08);
        playTone(783.99, 0.22, 'triangle', 0.1, 0.16);
        break;
      case 'incorrect':
        playTone(280, 0.14, 'sine', 0.07, 0);
        playTone(220, 0.18, 'sine', 0.07, 0.1);
        break;
      case 'coin':
        playTone(987.77, 0.08, 'sine', 0.07, 0);
        playTone(1318.51, 0.18, 'sine', 0.08, 0.07);
        break;
      case 'victory':
        playTone(523.25, 0.12, 'triangle', 0.09, 0);
        playTone(659.25, 0.12, 'triangle', 0.09, 0.1);
        playTone(783.99, 0.14, 'triangle', 0.09, 0.2);
        playTone(1046.5, 0.35, 'triangle', 0.11, 0.32);
        break;
    }
  } catch {
    // Ignore audio context restrictions
  }
}
