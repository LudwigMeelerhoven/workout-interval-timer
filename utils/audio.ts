// Singleton AudioContext
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const initAudio = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

export const playBeep = (type: 'standard' | 'high') => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'standard') {
      // 3 beeps: Low pitch (e.g., 600Hz)
      // We schedule 3 short pulses
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      
      // Beep 1
      gainNode.gain.setValueAtTime(1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      // Beep 2
      gainNode.gain.setValueAtTime(1, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      // Beep 3
      gainNode.gain.setValueAtTime(1, now + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.6);

    } else {
      // 5 beeps: High pitch (e.g., 1200Hz)
      const now = ctx.currentTime;
      osc.type = 'square'; // More aggressive sound for finish
      osc.frequency.setValueAtTime(1000, now);

      // Schedule 5 beeps faster
      for (let i = 0; i < 5; i++) {
        const start = now + (i * 0.15);
        gainNode.gain.setValueAtTime(0.5, start);
        gainNode.gain.linearRampToValueAtTime(0.001, start + 0.1);
      }

      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};