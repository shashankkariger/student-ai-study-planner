// Web Audio API generator for ambient study soundscapes and notification chimes
let audioCtx: AudioContext | null = null;
let activeNoiseNode: AudioNode | null = null;
let isPlayingAmbient = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playChime(type: 'success' | 'complete' | 'start' = 'complete') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'complete' || type === 'success') {
      // Pleasant harmonic double chime (e.g. C5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
    } else {
      // Start chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}

export function startAmbientSound(type: 'rain' | 'whitenoise' | 'binaural' | 'waves'): () => void {
  try {
    stopAmbientSound();
    const ctx = getAudioContext();

    if (type === 'binaural') {
      // Binaural 40Hz Gamma Focus Frequency (Left 200Hz, Right 240Hz)
      const merger = ctx.createChannelMerger(2);
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const gain = ctx.createGain();

      oscLeft.type = 'sine';
      oscLeft.frequency.value = 200;

      oscRight.type = 'sine';
      oscRight.frequency.value = 240;

      gain.gain.value = 0.08;

      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(gain);
      gain.connect(ctx.destination);

      oscLeft.start();
      oscRight.start();

      activeNoiseNode = gain;
      isPlayingAmbient = true;

      return () => {
        oscLeft.stop();
        oscRight.stop();
        gain.disconnect();
      };
    } else {
      // Pink / Brown Noise generator for Rain or White noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 1200;

      const gain = ctx.createGain();
      gain.gain.value = 0.09;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      activeNoiseNode = gain;
      isPlayingAmbient = true;

      return () => {
        whiteNoise.stop();
        gain.disconnect();
      };
    }
  } catch (err) {
    console.warn('Ambient sound failed:', err);
    return () => {};
  }
}

export function stopAmbientSound() {
  if (activeNoiseNode) {
    try {
      activeNoiseNode.disconnect();
    } catch {
      // ignore
    }
    activeNoiseNode = null;
  }
  isPlayingAmbient = false;
}

export function isAmbientPlaying(): boolean {
  return isPlayingAmbient;
}
