import { createResonanceModel } from './model.js';
import { createResonanceView } from './view.js';

/** Controller binds semantic tabs, pointer position, progressive WebGL fallback and lifespan. */
export function mountResonance(root, { bus, scheduler, i18n, motionOff, featureEnabled }) {
  if (!root) return () => {};
  const model = createResonanceModel();
  const view = createResonanceView(root);
  let scene = null, loading = null, inView = false;
  const canMove = () => !motionOff() && !model.paused;
  const sync = () => { view.render(model, i18n.t); scene?.setMode(model.mode.tint); scene?.setEnergy(model.energy); };
  const select = key => { model.setMode(key); sync(); bus.emit('ui:select'); };
  view.buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(button.dataset.mode));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const dir = event.key === 'ArrowLeft' ? -1 : 1;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? view.buttons.length - 1 : (index + dir + view.buttons.length) % view.buttons.length;
      view.buttons[next].focus(); select(view.buttons[next].dataset.mode);
    });
  });
  view.energyInput.addEventListener('input', () => { model.setEnergy(view.energyInput.value); scene?.setEnergy(model.energy); });
  view.pauseButton.addEventListener('click', () => { model.setPaused(!model.paused); sync(); update(); bus.emit('ui:select'); });
  const canvas = root.querySelector('#resonance-canvas');
  canvas.addEventListener('pointermove', event => {
    const bounds = canvas.getBoundingClientRect();
    scene?.setPointer((event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height);
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => scene?.setPointer(.5,.5));
  function update() { if (inView && canMove()) scene?.start(); else scene?.stop(); }
  const observer = new IntersectionObserver(async ([entry]) => {
    inView = entry.isIntersecting;
    if (!inView || !featureEnabled) { update(); return; }
    if (!scene && !loading) {
      loading = import('../../visuals/gold-reactor.js').then(module => {
        scene = module.createGoldReactor(canvas, { scheduler });
        scene.setMode(model.mode.tint); scene.setEnergy(model.energy);
        update();
      }).catch(() => { /* Readable HTML and gradient backdrop remain visible. */ });
    } else update();
  }, { rootMargin:'60px 0px 60px 0px', threshold: 0 });
  observer.observe(root);
  const offMotion = bus.on('motion:change', update);
  const offLang = bus.on('locale:change', sync);
  const onHidden = () => update();
  document.addEventListener('visibilitychange', onHidden);
  sync();
  return () => { observer.disconnect(); offMotion(); offLang(); document.removeEventListener('visibilitychange', onHidden); scene?.destroy(); };
}
