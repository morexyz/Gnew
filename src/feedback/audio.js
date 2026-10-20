/** Explicit user-opt-in audio. Never autoplays or plays persistent background audio. */
export function createAudioFeedback() {
  let context = null, enabled = false;
  const supported = !!(window.AudioContext || window.webkitAudioContext);
  return {
    get enabled() { return enabled; },
    async setEnabled(value) {
      if (!supported) return false;
      enabled = !!value;
      if (enabled && !context) context = new (window.AudioContext || window.webkitAudioContext)();
      if (enabled && context?.state === 'suspended') await context.resume();
      if (!enabled) await context?.suspend();
      return enabled;
    },
    play(kind = 0) {
      if (!enabled || !context || context.state !== 'running') return;
      const now = context.currentTime;
      const osc = context.createOscillator(); const gain = context.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(370 + (Number(kind) % 3) * 85, now);
      osc.frequency.exponentialRampToValueAtTime(480 + (Number(kind) % 3) * 110, now + .15);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.025, now + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .19);
      osc.connect(gain).connect(context.destination); osc.start(now); osc.stop(now + .2);
    },
    close() { context?.close(); context = null; enabled = false; },
  };
}
