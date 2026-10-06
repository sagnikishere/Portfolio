/**
 * Cinematic Ambient Soundscape & Generative Synthesizer
 * Inspired by Blade Runner 2049 & Hans Zimmer atmospheric pads.
 * Engineered for immediate audible warmth across all speakers (laptop, headphones, studio).
 */

export class AmbientSynth {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.gains = [];
    this.filters = [];
    this.lfo = null;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      return this.audioCtx.resume();
    }
    return Promise.resolve();
  }

  // Instant tactile feedback chime when toggling audio
  playActivationChime(enable) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    if (enable) {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    } else {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
    }

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Subtle interactive UI blip on click/hover
  playHoverBlip() {
    if (!this.isPlaying || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  async start() {
    await this.ensureContext();
    const t = this.audioCtx.currentTime;

    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.48, t + 1.2);
    this.masterGain.connect(this.audioCtx.destination);

    // Warm Resonant Lowpass Filter (800Hz - 1600Hz: clearly audible on laptops)
    const mainFilter = this.audioCtx.createBiquadFilter();
    mainFilter.type = 'lowpass';
    mainFilter.frequency.setValueAtTime(950, t);
    mainFilter.Q.setValueAtTime(2.2, t);
    mainFilter.connect(this.masterGain);
    this.filters.push(mainFilter);

    // Slow organic LFO modulating filter warmth
    this.lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    this.lfo.frequency.setValueAtTime(0.12, t); // 8-second breathing cycle
    lfoGain.gain.setValueAtTime(320, t);
    this.lfo.connect(lfoGain);
    lfoGain.connect(mainFilter.frequency);
    this.lfo.start(t);

    // Chord Harmonics: Deep Root + Fifth + Octave + Tenth (A-minor cinematic drone)
    // 110Hz (A2), 164.8Hz (E3), 220Hz (A3), 261.6Hz (C4), 329.6Hz (E4)
    const voices = [
      { freq: 110.0, type: 'sawtooth', gain: 0.16, detune: -4 },
      { freq: 110.5, type: 'sawtooth', gain: 0.16, detune: 5 },
      { freq: 164.8, type: 'triangle', gain: 0.22, detune: -2 },
      { freq: 220.0, type: 'sine',     gain: 0.28, detune: 0 },
      { freq: 220.8, type: 'sine',     gain: 0.24, detune: 6 },
      { freq: 261.6, type: 'sine',     gain: 0.20, detune: -3 },
      { freq: 329.6, type: 'triangle', gain: 0.15, detune: 4 }
    ];

    voices.forEach((v) => {
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();

      osc.type = v.type;
      osc.frequency.setValueAtTime(v.freq, t);
      osc.detune.setValueAtTime(v.detune, t);
      g.gain.setValueAtTime(v.gain, t);

      osc.connect(g);
      g.connect(mainFilter);
      osc.start(t);

      this.oscillators.push(osc);
      this.gains.push(g);
    });

    this.isPlaying = true;
    this.playActivationChime(true);
  }

  stop() {
    if (!this.isPlaying || !this.audioCtx) return;
    const t = this.audioCtx.currentTime;

    this.playActivationChime(false);

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    }

    setTimeout(() => {
      this.oscillators.forEach((osc) => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      if (this.lfo) {
        try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) {}
      }
      this.oscillators = [];
      this.gains = [];
      this.filters = [];
      this.isPlaying = false;
    }, 650);
  }

  async toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      await this.start();
      return true;
    }
  }
}
