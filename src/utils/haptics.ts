/**
 * Haptic & Tactile Feedback Engine
 * Handles physical device vibration via navigator.vibrate()
 * and pairs it with subtle auditory clicks via Web Audio API
 * to ensure realistic tactile feel across all devices (mobile & desktop).
 */

class HapticManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch {
        this.audioCtx = null;
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Tactile click for number pad keys (1-9, 0, Backspace)
   * Physical vibration: 12ms short burst
   * Acoustic tactile: ultra-fast 8ms tick impulse
   */
  public triggerKeypadClick(): void {
    // 1. Device vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }

    // 2. Tactile audio tick (desktop & mobile)
    if (this.soundEnabled) {
      try {
        const ctx = this.getAudioContext();
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.015);

          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.015);
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Haptic vibration for successful payment confirmations
   * Physical vibration: Distinct banking success rhythm [40ms, 60ms gap, 60ms, 80ms gap, 100ms]
   * Acoustic tactile: Harmonious ascending payment confirmation chime (C5 -> E5 -> G5)
   */
  public triggerPaymentSuccess(): void {
    // 1. Multi-pulse celebration vibration pattern
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 60, 80, 120]);
      } catch {
        // ignore
      }
    }

    // 2. Elegant payment success chime
    if (this.soundEnabled) {
      try {
        const ctx = this.getAudioContext();
        if (ctx) {
          const now = ctx.currentTime;
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (major chord chime)

          notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.08);

            const startTime = now + index * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.35);
          });
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Haptic vibration for generic success (e.g., PIN verified, biometric verified)
   */
  public triggerSuccess(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 40, 35]);
      } catch {
        // ignore
      }
    }

    if (this.soundEnabled) {
      try {
        const ctx = this.getAudioContext();
        if (ctx) {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Haptic vibration for incorrect PIN or failed operation
   */
  public triggerError(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 50, 60, 50, 90]);
      } catch {
        // ignore
      }
    }

    if (this.soundEnabled) {
      try {
        const ctx = this.getAudioContext();
        if (ctx) {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(140, now + 0.18);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.18);
        }
      } catch {
        // ignore
      }
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

export const haptics = new HapticManager();
export const triggerKeypadHaptic = () => haptics.triggerKeypadClick();
export const triggerPaymentSuccessHaptic = () => haptics.triggerPaymentSuccess();
export const triggerHapticSuccess = () => haptics.triggerSuccess();
export const triggerHapticError = () => haptics.triggerError();
