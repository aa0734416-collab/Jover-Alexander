// Web Audio API beep & synthesis + Browser Push Notifications

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const NotificationService = {
  // Request notification permissions
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  },

  isPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    return Notification.permission === 'granted';
  },

  // Play audible alert using Web Audio API
  playAlarmTone(severity: 'warning' | 'critical' = 'warning'): void {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = severity === 'critical' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(severity === 'critical' ? 880 : 660, ctx.currentTime);

      if (severity === 'critical') {
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      } else {
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      }

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio alarm playback failed:', e);
    }
  },

  // Send real-time browser push notification
  sendPush(title: string, body: string, severity: 'warning' | 'critical' | 'info' = 'warning'): void {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const icon = severity === 'critical' ? '🚨' : '⚠️';
        new Notification(`${icon} ${title} - HydroSense`, {
          body,
          badge: '/favicon.ico',
          icon: '/favicon.ico',
          tag: 'hydrosense_alert',
        });
      } catch (e) {
        console.warn('Browser push notification could not be created:', e);
      }
    }
  },
};
