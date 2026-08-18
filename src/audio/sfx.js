// Interstellar EVE Tactical Sound Synthesizer (Web Audio API)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.25;
    this.ambientEngineNode = null;
    this.ambientGainNode = null;
    this.laserNode = null;
    this.laserGainNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAmbientEngine();
      this.stopMiningLaser();
    }
    return this.muted;
  }

  setVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
  }

  // Tactical interface click
  playClick(pitch = 1800) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.035);

    gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Tab / HUD switch chirp
  playTabSwitch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(850, now);
    osc.frequency.exponentialRampToValueAtTime(1420, now + 0.07);

    gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  // Trade Execution Chime
  playTradeSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Decryption / Python seed cipher completed
  playDecryptSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.035;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Add simple lowpass
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(this.masterVolume * 0.22, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  // Overheat Alert / Danger Warning
  playAlert() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.08);
    osc.frequency.setValueAtTime(880, now + 0.16);
    osc.frequency.setValueAtTime(440, now + 0.24);

    gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Continuous Mining Laser Sound
  startMiningLaser() {
    if (this.muted || this.laserNode) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.laserNode = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.laserGainNode = this.ctx.createGain();

      this.laserNode.type = 'sawtooth';
      this.laserNode.frequency.setValueAtTime(140, now);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(16, now); // 16Hz vibration
      lfoGain.gain.setValueAtTime(35, now);

      lfo.connect(this.laserNode.frequency);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, now);
      filter.Q.setValueAtTime(3, now);

      this.laserGainNode.gain.setValueAtTime(0.0001, now);
      this.laserGainNode.gain.exponentialRampToValueAtTime(this.masterVolume * 0.28, now + 0.1);

      this.laserNode.connect(filter);
      filter.connect(this.laserGainNode);
      this.laserGainNode.connect(this.ctx.destination);

      lfo.start(now);
      this.laserNode.start(now);
    } catch {
      // Audio node fallback
    }
  }

  stopMiningLaser() {
    if (this.laserNode && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        if (this.laserGainNode) {
          this.laserGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        }
        setTimeout(() => {
          if (this.laserNode) {
            this.laserNode.stop();
            this.laserNode.disconnect();
            this.laserNode = null;
            this.laserGainNode = null;
          }
        }, 100);
      } catch {
        this.laserNode = null;
      }
    }
  }

  // Ambient Warp Engine Background Hum
  toggleAmbientEngine() {
    if (this.ambientEngineNode) {
      this.stopAmbientEngine();
      return false;
    } else {
      this.startAmbientEngine();
      return true;
    }
  }

  startAmbientEngine() {
    if (this.muted || this.ambientEngineNode) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientEngineNode = this.ctx.createOscillator();
      this.ambientGainNode = this.ctx.createGain();

      this.ambientEngineNode.type = 'triangle';
      this.ambientEngineNode.frequency.setValueAtTime(58.27, now); // Low Bb hum

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);

      this.ambientGainNode.gain.setValueAtTime(0.0001, now);
      this.ambientGainNode.gain.exponentialRampToValueAtTime(this.masterVolume * 0.18, now + 0.8);

      this.ambientEngineNode.connect(filter);
      filter.connect(this.ambientGainNode);
      this.ambientGainNode.connect(this.ctx.destination);

      this.ambientEngineNode.start(now);
    } catch {
      // Audio context catch
    }
  }

  stopAmbientEngine() {
    if (this.ambientEngineNode && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        if (this.ambientGainNode) {
          this.ambientGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        }
        setTimeout(() => {
          if (this.ambientEngineNode) {
            this.ambientEngineNode.stop();
            this.ambientEngineNode.disconnect();
            this.ambientEngineNode = null;
            this.ambientGainNode = null;
          }
        }, 350);
      } catch {
        this.ambientEngineNode = null;
      }
    }
  }
}

export const sfx = new SoundFX();
