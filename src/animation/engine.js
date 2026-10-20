/** Shared, cancelable RAF scheduler. Do not create a loop until a feature asks for one. */
export function createScheduler() {
  const callbacks = new Set();
  let raf = 0;
  let last = 0;
  function frame(now) {
    raf = 0;
    if (document.hidden) return;
    const delta = last ? Math.min(now - last, 48) : 16;
    last = now;
    for (const callback of callbacks) callback(now, delta);
    if (callbacks.size) raf = requestAnimationFrame(frame);
  }
  const onVisibility = () => {
    last = 0;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (callbacks.size && !raf) raf = requestAnimationFrame(frame);
  };
  document.addEventListener('visibilitychange', onVisibility);
  return Object.freeze({
    add(callback) {
      callbacks.add(callback);
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
      return () => { callbacks.delete(callback); if (!callbacks.size) { cancelAnimationFrame(raf); raf = 0; last = 0; } };
    },
    destroy() { callbacks.clear(); cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVisibility); },
  });
}

export function createAnimationEngine({ capabilities, scheduler }) {
  const active = new Set();
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(node, frames, options = {}) {
    if (!node || !capabilities.webAnimations || reduced()) return Promise.resolve();
    const animation = node.animate(frames, { duration: 350, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both', ...options });
    active.add(animation);
    return animation.finished.catch(() => {}).finally(() => {
      active.delete(animation);
      animation.cancel();
    });
  }
  function cancelAll() { for (const animation of active) animation.cancel(); active.clear(); }
  /** Declarative sequence with optional waits; resolves early if aborted. */
  async function sequence(steps, signal) {
    for (const step of steps) {
      if (signal?.aborted) return;
      if (typeof step === 'function') await step();
      else if (step?.node) await animate(step.node, step.frames, step.options);
      else if (typeof step?.wait === 'number') await new Promise(resolve => setTimeout(resolve, step.wait));
    }
  }
  async function stagger(nodes, frames, options = {}, gapMs = 65) {
    if (reduced()) return;
    return Promise.all(Array.from(nodes, (node, index) => animate(node, frames, { ...options, delay: index * gapMs })));
  }
  async function pageTransition(previous, next, swap, { duration = 265 } = {}) {
    cancelAll();
    if (previous === next || reduced()) { swap(); return; }
    if (previous) await animate(previous.querySelector('.slide__inner'), [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-14px)' },
    ], { duration: duration * .68 });
    swap();
    await animate(next.querySelector('.slide__inner'), [
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration });
  }
  return Object.freeze({ animate, sequence, stagger, pageTransition, cancelAll, scheduler });
}
