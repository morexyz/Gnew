/** Subtle, input-driven optical parallax (not a perpetual RAF loop). */
export function mountHeroParallax(root, { bus, motionOff }) {
  if (!root || !matchMedia('(pointer: fine)').matches) return () => {};
  let frame = 0, targetX = 0, targetY = 0;
  const onMove = event => {
    if (motionOff()) return;
    const rect = root.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width - .5;
    targetY = (event.clientY - rect.top) / rect.height - .5;
    if (!frame) frame = requestAnimationFrame(() => {
      root.style.setProperty('--pointer-x', `${(targetX*16).toFixed(2)}px`);
      root.style.setProperty('--pointer-y', `${(targetY*16).toFixed(2)}px`);
      frame = 0;
    });
  };
  const onLeave = () => { root.style.setProperty('--pointer-x', '0px'); root.style.setProperty('--pointer-y', '0px'); };
  const offMotion = bus.on('motion:change', enabled => { if (!enabled) onLeave(); });
  root.addEventListener('pointermove', onMove, { passive: true });
  root.addEventListener('pointerleave', onLeave);
  return () => { offMotion(); cancelAnimationFrame(frame); root.removeEventListener('pointermove', onMove); root.removeEventListener('pointerleave', onLeave); };
}
