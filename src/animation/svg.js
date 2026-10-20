/** Native SVG effects. Path morphing requires identical SVG command sequences. */
export function drawStroke(path, { duration = 900, easing = 'ease-in-out' } = {}) {
  if (!path || typeof path.getTotalLength !== 'function') return null;
  const length = path.getTotalLength();
  path.style.strokeDasharray = String(length);
  return path.animate?.([
    { strokeDashoffset: length }, { strokeDashoffset: 0 },
  ], { duration, easing, fill: 'forwards' }) ?? null;
}

export function createSvgMask(svg, id, markup) {
  if (!(svg instanceof SVGElement)) throw new TypeError('SVG root required');
  const ns = 'http://www.w3.org/2000/svg';
  let defs = svg.querySelector('defs');
  if (!defs) { defs = document.createElementNS(ns, 'defs'); svg.prepend(defs); }
  const mask = document.createElementNS(ns, 'mask');
  mask.setAttribute('id', id);
  mask.innerHTML = markup; // Use only trusted, developer-authored SVG markup.
  defs.append(mask);
  return mask;
}

/** Morph compatible paths without a dependency; incompatible paths must be normalized first. */
export function morphPath(path, from, to, { duration = 750, easing = t => t } = {}) {
  const tokenize = d => d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) || [];
  const a = tokenize(from), b = tokenize(to);
  const same = a.length === b.length && a.every((token, i) => /[a-z]/i.test(token) === /[a-z]/i.test(b[i]) && (!/[a-z]/i.test(token) || token === b[i]));
  if (!same) throw new Error('SVG morph requires compatible path commands; normalize paths before morphing.');
  const numeric = a.map((token, i) => /[a-z]/i.test(token) ? null : [Number(token), Number(b[i])]);
  let raf = 0;
  let cancelled = false;
  let done = false;
  const started = performance.now();
  const tick = now => {
    if (cancelled) return;
    const t = Math.min((now - started) / Math.max(1, duration), 1), mix = easing(t);
    path.setAttribute('d', a.map((token, i) => numeric[i] ? String(numeric[i][0] + (numeric[i][1] - numeric[i][0]) * mix) : token).join(' '));
    if (t < 1) raf = requestAnimationFrame(tick); else done = true;
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { path.setAttribute('d', to); done = true; }
  else raf = requestAnimationFrame(tick);
  return { cancel() { if (!done) { cancelled = true; cancelAnimationFrame(raf); } } };
}
