// src/utils/audioAlarm.ts
// Web Audio API Synthesizer for Persistent Medication Alarm

type EscalationLevel = 1 | 2 | 3;

interface AudioContextState {
  ctx: AudioContext | null;
  isInitialized: boolean;
  error: string | null;
}

class AlarmSynthesizer {
  private audioCtxState: AudioContextState = {
    ctx: null,
    isInitialized: false,
    error: null,
  };
  private intervalId: NodeJS.Timeout | null = null;
  private isRinging: boolean = false;
  private escalationLevel: EscalationLevel = 1;
  private readonly maxRetries = 3;
  private retryCount = 0;

  private async initializeAudioContext(): Promise<boolean> {
    try {
      if (!this.audioCtxState.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          this.audioCtxState.error = 'Web Audio API not supported in this browser';
          return false;
        }
        this.audioCtxState.ctx = new AudioCtx();
      }

      if (this.audioCtxState.ctx.state === 'suspended') {
        await this.audioCtxState.ctx.resume();
      }

      this.audioCtxState.isInitialized = true;
      this.audioCtxState.error = null;
      this.retryCount = 0;
      return true;
    } catch (error) {
      this.audioCtxState.error = error instanceof Error ? error.message : 'Failed to initialize audio';
      this.audioCtxState.isInitialized = false;
      
      // Retry with exponential backoff
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000;
        console.warn(`Audio initialization failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.initializeAudioContext();
      }
      
      return false;
    }
  }

  public async start(escalationLevel: EscalationLevel = 1): Promise<void> {
    if (this.isRinging) return;
    
    this.escalationLevel = escalationLevel;
    const initialized = await this.initializeAudioContext();
    
    if (!initialized) {
      console.error('Cannot start alarm:', this.audioCtxState.error);
      // Fallback: Use browser notification
      this.fallbackNotification();
      return;
    }

    this.isRinging = true;
    this.scheduleBeeps();
  }

  private fallbackNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: 'Time to take your medication!',
        icon: '/favicon.ico',
      });
    }
    // Also try to use vibrate API
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }

  public setEscalation(level: EscalationLevel): void {
    if (level !== this.escalationLevel) {
      this.escalationLevel = level;
      // Reschedule with new level
      if (this.isRinging) {
        this.stop();
        this.start(level);
      }
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2): void {
    if (!this.audioCtxState.isInitialized || !this.audioCtxState.ctx) return;

    try {
      const ctx = this.audioCtxState.ctx;
      if (ctx.state === 'closed') {
        this.audioCtxState.isInitialized = false;
        this.initializeAudioContext();
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Smooth volume envelope
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.linearRampToValueAtTime(volume * 0.8, now + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }

  private scheduleBeeps(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const runBeepCycle = () => {
      if (!this.isRinging) return;

      try {
        switch (this.escalationLevel) {
          case 1:
            // Gentle: C5 - E5
            this.playTone(523.25, 0.2, 'sine', 0.15);
            setTimeout(() => this.playTone(659.25, 0.3, 'sine', 0.15), 250);
            break;
          case 2:
            // Urgent: G5 - G5 - C6
            this.playTone(783.99, 0.15, 'triangle', 0.25);
            setTimeout(() => this.playTone(783.99, 0.15, 'triangle', 0.25), 180);
            setTimeout(() => this.playTone(1046.50, 0.25, 'triangle', 0.3), 360);
            break;
          case 3:
            // Critical: A5 - D6 - E6 - A6
            this.playTone(880, 0.12, 'sawtooth', 0.35);
            setTimeout(() => this.playTone(1174.66, 0.12, 'sawtooth', 0.4), 140);
            setTimeout(() => this.playTone(1318.51, 0.12, 'sawtooth', 0.45), 280);
            setTimeout(() => this.playTone(1760, 0.2, 'sawtooth', 0.5), 420);
            break;
        }
      } catch (error) {
        console.error('Error in beep cycle:', error);
        // If audio fails, try to reinitialize
        if (this.audioCtxState.ctx?.state === 'closed') {
          this.audioCtxState.isInitialized = false;
          this.initializeAudioContext();
        }
      }
    };

    // Run first cycle immediately
    runBeepCycle();

    // Schedule subsequent cycles
    const delayMap: Record<EscalationLevel, number> = {
      1: 2500,
      2: 1400,
      3: 800,
    };
    const delay = delayMap[this.escalationLevel] || 2500;
    this.intervalId = setInterval(runBeepCycle, delay);
  }

  public stop(): void {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clean up audio context
    if (this.audioCtxState.ctx) {
      try {
        // Don't close immediately, wait for any pending sounds
        setTimeout(() => {
          if (this.audioCtxState.ctx && this.audioCtxState.ctx.state !== 'closed') {
            this.audioCtxState.ctx.close();
            this.audioCtxState.ctx = null;
            this.audioCtxState.isInitialized = false;
          }
        }, 500);
      } catch (error) {
        console.error('Error closing audio context:', error);
        this.audioCtxState.ctx = null;
        this.audioCtxState.isInitialized = false;
      }
    }
  }

  public isPlaying(): boolean {
    return this.isRinging;
  }

  public getCurrentLevel(): EscalationLevel {
    return this.escalationLevel;
  }

  // Add method to request notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

export const alarmAudio = new AlarmSynthesizer();