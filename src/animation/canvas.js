/** Reusable, lazily activated drawing surface fitted to its host. */
export function fitCanvas(canvas, { maxDpr = 1.7 } = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;
  let width = 0, height = 0;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  if (observer) observer.observe(canvas); else window.addEventListener('resize', resize, { passive: true });
  return { ctx, get width() { return width; }, get height() { return height; }, destroy() { observer?.disconnect(); if (!observer) window.removeEventListener('resize', resize); ctx.clearRect(0, 0, width, height); } };
}
