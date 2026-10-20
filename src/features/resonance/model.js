/** Conceptual brand motifs only, not prices, portfolio signals, or trading states. */
export const RESONANCE_MODES = Object.freeze({
  heritage: Object.freeze({ key: 'heritage', title: 'A legacy transformed.', description: 'Gold has represented value across generations. The form may evolve; understanding still matters.', tint: 0 }),
  intelligence: Object.freeze({ key: 'intelligence', title: 'Technology with intention.', description: 'Designed to simplify complexity, not to hide risk or promise outcomes.', tint: 1 }),
  freedom: Object.freeze({ key: 'freedom', title: 'Control stays personal.', description: 'Your choices, your permissions, and visibility into relevant blockchain activity.', tint: 2 }),
});
export function createResonanceModel() {
  let current = 'heritage', energy = 68, paused = false;
  return {
    get mode() { return RESONANCE_MODES[current]; },
    get energy() { return energy; },
    get paused() { return paused; },
    setMode(key) { if (Object.hasOwn(RESONANCE_MODES, key)) current = key; },
    setEnergy(n) { energy = Math.max(20, Math.min(100, Number(n) || 20)); },
    setPaused(value) { paused = Boolean(value); },
  };
}
