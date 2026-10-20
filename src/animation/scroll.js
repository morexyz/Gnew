/** IO-driven activation + native scroll-timeline enhancement and RAF-batched progress. */
export function mountScrollExperience({ scheduler, bus }) {
  const root = document.documentElement;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  if (!motionQuery.matches && !root.classList.contains('motion-off')) root.classList.add('enhanced-motion');
  if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()')) root.classList.add('native-scroll-motion');
  const reveals = [...document.querySelectorAll('.reveal')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const navlinks = [...document.querySelectorAll('.nav__links a')];
  const progress = document.getElementById('reading-progress');
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
  reveals.forEach(el => io.observe(el));
  let scrollY = window.scrollY;
  let viewport = innerHeight;
  let docHeight = 1;
  let dirty = true, raf = 0;
  const requestUpdate = () => { dirty = true; if (!raf) raf = requestAnimationFrame(tick); };
  const onScroll = requestUpdate;
  const onResize = () => { viewport = innerHeight; requestUpdate(); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize, { passive: true });
  let previous = '';
  const tick = () => {
    raf = 0;
    if (!dirty) return;
    dirty = false;
    scrollY = window.scrollY;
    docHeight = Math.max(1, document.documentElement.scrollHeight - viewport);
    const percentage = Math.min(100, Math.max(0, scrollY / docHeight * 100));
    progress.firstElementChild.style.width = `${percentage}%`;
    progress.setAttribute('aria-valuenow', String(Math.round(percentage)));
    const marker = scrollY + viewport * .45;
    let active = sections[0]?.id;
    for (const section of sections) if (section.offsetTop <= marker) active = section.id;
    if (active !== previous) {
      previous = active;
      navlinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${active}`));
      bus.emit('chapter:enter', active);
    }
  };
  tick();
  return () => { io.disconnect(); cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', onResize); };
}
