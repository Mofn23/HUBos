/**
 * Web Audio API synthesizer for elegant, minimalist in-app sounds.
 * Generates an Apple-style harmonic chime completely client-side without external audio files.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;

  /** Call directly from a user gesture so later async actions can still play audio on iOS. */
  public unlock(): void {
    this.getContext();
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Plays a subtle, velvet, harmonic celebration chime (C5 -> E5 -> G5 -> C6).
   */
  public playAchievementChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Harmonic major chord frequencies
      const notes = [
        { freq: 523.25, time: 0 },       // C5
        { freq: 659.25, time: 0.09 },    // E5
        { freq: 783.99, time: 0.18 },    // G5
        { freq: 1046.50, time: 0.28 },   // C6
      ];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, now); // Gentle, subtle volume

      // Soft lowpass filter to remove any harsh high frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Attack & exponential release
        noteGain.gain.setValueAtTime(0.0001, now + time);
        noteGain.gain.exponentialRampToValueAtTime(0.8, now + time + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.85);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + time);
        osc.stop(now + time + 0.9);
      });
    } catch (e) {
      console.warn('[AudioEngine] Could not play chime:', e);
    }
  }

  private playNotes(notes: Array<{ freq: number; delay?: number; duration?: number; volume?: number; type?: OscillatorType }>): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const start = ctx.currentTime;
      notes.forEach(({ freq, delay = 0, duration = 0.18, volume = 0.07, type = 'sine' }) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = start + delay;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + duration + 0.01);
      });
    } catch (error) {
      console.warn('[AudioEngine] Could not play UI sound:', error);
    }
  }

  /** A light two-note confirmation when a meal is saved. */
  public playMealLogged(): void {
    this.playNotes([
      { freq: 659.25, duration: 0.2, volume: 0.065 },
      { freq: 880, delay: 0.075, duration: 0.26, volume: 0.075 },
    ]);
  }

  /** Soft ascending droplet feedback for hydration. */
  public playWaterAdded(): void {
    this.playNotes([
      { freq: 587.33, duration: 0.13, volume: 0.045 },
      { freq: 783.99, delay: 0.055, duration: 0.2, volume: 0.055 },
    ]);
  }

  /** Distinct short confirmation for supplement state changes. */
  public playSupplementToggle(enabled: boolean): void {
    this.playNotes(enabled
      ? [{ freq: 1046.5, duration: 0.11, volume: 0.05 }, { freq: 1318.51, delay: 0.045, duration: 0.14, volume: 0.055 }]
      : [{ freq: 880, duration: 0.12, volume: 0.045 }, { freq: 659.25, delay: 0.04, duration: 0.16, volume: 0.04 }]);
  }

  /** Quiet descending tick for removing an item. */
  public playRemove(): void {
    this.playNotes([
      { freq: 740, type: 'triangle', duration: 0.075, volume: 0.035 },
      { freq: 520, type: 'triangle', delay: 0.045, duration: 0.11, volume: 0.03 },
    ]);
  }

  /** Gentle confirmation when saving a body measurement. */
  public playMeasurementSaved(): void {
    this.playNotes([
      { freq: 523.25, duration: 0.15, volume: 0.05 },
      { freq: 783.99, delay: 0.065, duration: 0.21, volume: 0.06 },
    ]);
  }
}

export const audioEngine = new AudioEngine();
