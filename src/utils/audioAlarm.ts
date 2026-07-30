// Web Audio API Synthesizer for Persistent Medication Alarm

class AlarmSynthesizer {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  private isRinging: boolean = false;
  private escalationLevel: 1 | 2 | 3 = 1;

  public start(escalationLevel: 1 | 2 | 3 = 1) {
    if (this.isRinging) return;
    this.isRinging = true;
    this.escalationLevel = escalationLevel;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser');
    }

    this.scheduleBeeps();
  }

  public setEscalation(level: 1 | 2 | 3) {
    this.escalationLevel = level;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (err) {
      console.error('Audio tone error', err);
    }
  }

  private scheduleBeeps() {
    if (this.intervalId) clearInterval(this.intervalId);

    const runBeepCycle = () => {
      if (!this.isRinging) return;

      if (this.escalationLevel === 1) {
        // Level 1: Gentle dual tone
        this.playTone(523.25, 0.2, 'sine', 0.15); // C5
        setTimeout(() => this.playTone(659.25, 0.3, 'sine', 0.15), 250); // E5
      } else if (this.escalationLevel === 2) {
        // Level 2: Urgent pulse
        this.playTone(783.99, 0.15, 'triangle', 0.25); // G5
        setTimeout(() => this.playTone(783.99, 0.15, 'triangle', 0.25), 180);
        setTimeout(() => this.playTone(1046.50, 0.25, 'triangle', 0.3), 360); // C6
      } else {
        // Level 3: Critical alarm siren
        this.playTone(880, 0.12, 'sawtooth', 0.35); // A5
        setTimeout(() => this.playTone(1174.66, 0.12, 'sawtooth', 0.4), 140); // D6
        setTimeout(() => this.playTone(1318.51, 0.12, 'sawtooth', 0.45), 280); // E6
        setTimeout(() => this.playTone(1760, 0.2, 'sawtooth', 0.5), 420); // A6
      }
    };

    runBeepCycle();
    // Repeat intervals based on escalation level
    const delay = this.escalationLevel === 1 ? 2500 : this.escalationLevel === 2 ? 1400 : 800;
    this.intervalId = setInterval(runBeepCycle, delay);
  }

  public stop() {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}

export const alarmAudio = new AlarmSynthesizer();
