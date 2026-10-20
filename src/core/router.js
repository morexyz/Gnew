/** Hash-anchor navigation preserves shareable chapter links on every static host. */
export function createChapterRouter({ chapters, bus }) {
  const valid = new Set(chapters);
  const navigate = hash => {
    const name = String(hash || '').replace(/^#/, '');
    if (!valid.has(name)) return;
    document.getElementById(name)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-off') ? 'instant' : 'smooth' });
    bus.emit('chapter:route', name);
  };
  const onHash = () => navigate(location.hash);
  addEventListener('hashchange', onHash);
  if (location.hash && valid.has(location.hash.slice(1))) requestAnimationFrame(onHash);
  return { go(name) { if (valid.has(name)) location.hash = name; }, destroy() { removeEventListener('hashchange', onHash); } };
}
