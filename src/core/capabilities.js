export function detectCapabilities() {
  return Object.freeze({
    webAnimations: typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function',
    svg: typeof SVGElement !== 'undefined',
    canvas: !!document.createElement('canvas').getContext,
    webWorkers: typeof Worker !== 'undefined',
    scrollTimeline: typeof ScrollTimeline !== 'undefined',
    pointerEvents: typeof PointerEvent !== 'undefined',
    audio: typeof AudioContext !== 'undefined',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
}
