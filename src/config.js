/** Experience flags govern activation; every optional feature degrades safely. */
export const CONFIG = Object.freeze({
  appName: 'Gnew', routeMode: 'hash-anchor',
  features: Object.freeze({
    scrollAnimations: true,
    goldReactor: true, // lazy native WebGL, Canvas2D/gradient fallback
    svgMorphing: true,
    particleCanvas: true,
    noiseCanvas: true,
    fluidCanvas: true,
    webWorkers: true,
    advancedPointer: true,
    audioFeedback: true, // available behind an explicit user opt-in
  }),
  performance: Object.freeze({ maxDpr: 1.7, maxParticles: 110, workerFps: 24 }),
});
