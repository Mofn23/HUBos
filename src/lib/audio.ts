/**
 * Web Audio API synthesizer for elegant, minimalist in-app sounds.
 * Generates an Apple-style harmonic chime completely client-side without external audio files.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;

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
}

export const audioEngine = new AudioEngine();
