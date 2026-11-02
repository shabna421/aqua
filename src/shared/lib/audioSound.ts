// High quality synthesized audio using Web Audio API (Zero external assets needed)

let audioCtx: AudioContext | null = null;
let pendingChimeRequested = false;
let unlockListenersAttached = false;

function setupAudioUnlock(): void {
  if (typeof window === 'undefined' || unlockListenersAttached) return;
  unlockListenersAttached = true;

  const unlock = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        if (pendingChimeRequested) {
          pendingChimeRequested = false;
          playWaterChime();
        }
      }).catch(() => {});
    } else if (pendingChimeRequested) {
      pendingChimeRequested = false;
      playWaterChime();
    }
  };

  ['click', 'touchstart', 'keydown', 'focus', 'visibilitychange'].forEach((evt) => {
    window.addEventListener(evt, unlock, { passive: true });
  });
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  setupAudioUnlock();

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a gentle, crisp water drop reminder chime
 */
export function playWaterChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      pendingChimeRequested = true;
      ctx.resume().then(() => {
        if (pendingChimeRequested) {
          pendingChimeRequested = false;
          playWaterChime();
        }
      }).catch(() => {});
      return;
    }

    pendingChimeRequested = false;

    const now = ctx.currentTime;

    // First droplet
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second harmonic droplet
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1100, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.22);

    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch (error) {
    console.warn('Audio playback not supported or blocked:', error);
  }
}

/**
 * Play a refreshing water drink / gulp sound
 */
export function playDrinkSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Gulp / bubble effect
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.28);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);

    // Refreshing sparkle
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = 'triangle';
    sparkle.frequency.setValueAtTime(987.77, now + 0.15); // B5
    sparkle.frequency.exponentialRampToValueAtTime(1318.51, now + 0.35); // E6

    sparkleGain.gain.setValueAtTime(0.15, now + 0.15);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    sparkle.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    sparkle.start(now + 0.15);
    sparkle.stop(now + 0.45);
  } catch (error) {
    console.warn('Audio playback not supported or blocked:', error);
  }
}

/**
 * Play celebratory chime when user reaches their water goal
 */
export function playGoalCelebration(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  } catch (error) {
    console.warn('Audio celebration error:', error);
  }
}
