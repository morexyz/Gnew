import { drawStroke } from '../../animation/svg.js';
/** Visual high-level choreography only; no actual trading or strategy code. */
export function mountAutomation(root, { engine, bus }) {
  const steps = [...root.querySelectorAll('[data-machine-step]')];
  const path = root.querySelector('#machine-path');
  const play = document.getElementById('replay-automation');
  let currentRun = null;
  function run() {
    currentRun?.abort();
    engine.cancelAll();
    const run = new AbortController(); currentRun = run;
    steps.forEach(step => step.classList.remove('is-running'));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-off')) {
      path.style.strokeDasharray = 'none';
      steps.forEach(step => step.classList.add('is-running'));
      return;
    }
    drawStroke(path, { duration: 1850, easing: 'cubic-bezier(.2,.5,.2,1)' });
    // Native WAAPI sequencer: one meaningful cue at a time, cancelable on replay.
    const sequence = steps.map((step, index) => async () => {
      if (run.signal.aborted) return;
      step.classList.add('is-running');
      bus.emit('ui:pulse', index);
      await engine.animate(step, [
        { opacity: .62, transform: 'translateY(13px)' },
        { opacity: 1, transform: 'translateY(-7px)' },
      ], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    engine.sequence(sequence, run.signal).catch(error => console.error('Sequence interrupted', error));
  }
  play.addEventListener('click', () => { run(); bus.emit('ui:select'); });
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { run(); io.disconnect(); }
  }, { threshold: .33 });
  io.observe(root);
  return () => { currentRun?.abort(); engine.cancelAll(); io.disconnect(); };
}
