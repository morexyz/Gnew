import { CONFIG } from './config.js';
import { createEventBus } from './core/event-bus.js';
import { detectCapabilities } from './core/capabilities.js';
import { createScheduler, createAnimationEngine } from './animation/engine.js';
import { createChapterRouter } from './core/router.js';
import { mountScrollExperience } from './animation/scroll.js';
import { mountJourney } from './features/journey/controller.js';
import { mountPortfolio } from './features/portfolio/controller.js';
import { mountComplexity } from './features/complexity/controller.js';
import { mountAutomation } from './features/automation/controller.js';
import { mountGoldMorph } from './features/gold/controller.js';
import { mountCustody } from './features/custody/controller.js';
import { mountTransparency } from './features/transparency/controller.js';
import { mountRisks } from './features/risks/controller.js';
import { createI18n } from './i18n/i18n.js';
import { mountResonance } from './features/resonance/controller.js';
import { mountHeroParallax } from './features/hero/controller.js';
import { mountCompass } from './features/compass/controller.js';

const bus = createEventBus();
const capabilities = detectCapabilities();
const scheduler = createScheduler();
const engine = createAnimationEngine({ capabilities, scheduler });

const sections = [...document.querySelectorAll('main > section[id]')];
createChapterRouter({ chapters: sections.map(s => s.id), bus });
mountScrollExperience({ scheduler, bus });
mountJourney(document.getElementById('journey-app'), bus);
mountPortfolio(document.getElementById('portfolio-app'), bus);
mountComplexity(document.getElementById('complexity-experience'), bus);
mountTransparency(document.getElementById('trace-app'), bus);
mountAutomation(document.getElementById('automation-machine'), { engine, bus });
if (CONFIG.features.svgMorphing && capabilities.svg) mountGoldMorph(document.getElementById('gold-transform'), bus);
mountCustody(document.getElementById('custody-interaction'), { engine, bus, capabilities, featureEnabled:CONFIG.features.advancedPointer });
mountRisks(document.getElementById('risks-app'));
const i18n = createI18n(bus);
mountCompass(document.getElementById('story-compass'), { bus, i18n });

const menuButton = document.getElementById('menu-toggle');
const menu = document.getElementById('mobile-menu');
const setMenu = open => {
  menu.hidden = !open; document.body.classList.toggle('menu-open',open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', i18n.t(open ? 'Close navigation' : 'Open navigation'));
};
menuButton.addEventListener('click', () => setMenu(menu.hidden));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

let forcedMotionOff = false;
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.getElementById('motion-toggle');
const setMotionLabel = () => {
  const off = forcedMotionOff || motionQuery.matches;
  document.documentElement.classList.toggle('motion-off',off);
  document.documentElement.classList.toggle('enhanced-motion',!off);
  motionButton.textContent = i18n.t(`Motion: ${off ? 'Off' : 'On'}`);
  motionButton.setAttribute('aria-pressed', String(!off));
  bus.emit('motion:change', !off);
};
motionButton.addEventListener('click', () => { forcedMotionOff = !forcedMotionOff; setMotionLabel(); });
motionQuery.addEventListener('change', setMotionLabel);
setMotionLabel();
mountHeroParallax(document.getElementById('hero-art'), { bus, motionOff: () => forcedMotionOff || motionQuery.matches });
mountResonance(document.getElementById('resonance-lab'), { bus, scheduler, i18n, motionOff: () => forcedMotionOff || motionQuery.matches || document.hidden, featureEnabled: CONFIG.features.goldReactor });
bus.on('locale:change', () => { setMenu(!menu.hidden); setMotionLabel(); });

// Audio is constructed only after an explicit toggle click. No autoplay, never a wallet connection.
const audioButton = document.getElementById('sound-toggle');
let audio = null;
const ensureAudio = async () => {
  if (!audio) { const module = await import('./feedback/audio.js'); audio = module.createAudioFeedback(); }
  const enabled = await audio.setEnabled(!audio.enabled);
  audioButton.textContent = i18n.t(`Sound: ${enabled ? 'On' : 'Off'}`);
  audioButton.setAttribute('aria-pressed', String(enabled));
};
audioButton.addEventListener('click', () => {
  if (!CONFIG.features.audioFeedback || !capabilities.audio) { audioButton.textContent = i18n.t('Sound unavailable'); audioButton.disabled = true; return; }
  ensureAudio().catch(() => { audioButton.textContent = i18n.t('Sound unavailable'); audioButton.disabled = true; });
});
bus.on('ui:select', () => audio?.play(0));
bus.on('ui:pulse', kind => audio?.play(kind));
bus.on('locale:change', () => { audioButton.textContent = i18n.t(audio?.enabled ? 'Sound: On' : 'Sound: Off'); });

// Opt-in at the feature level; activation is deferred until the corresponding canvas becomes visible.
const visuals = [
  { id:'hero-canvas', type:'hero', flag:'particleCanvas' },
  { id:'noise-canvas', type:'noise', flag:'noiseCanvas' },
  { id:'flow-canvas', type:'fluid', flag:'fluidCanvas' },
  { id:'trace-canvas', type:'trace', flag:'particleCanvas' },
].filter(item => CONFIG.features[item.flag] && capabilities.canvas);
const active = new Map();
const canvasObserver = new IntersectionObserver(async entries => {
  for (const entry of entries) {
    const node = entry.target;
    const item = visuals.find(v => v.id === node.id);
    if (!item) continue;
    if (!entry.isIntersecting || motionQuery.matches || forcedMotionOff) {
      active.get(node.id)?.stop();
      continue;
    }
    let visual = active.get(node.id);
    if (!visual) {
      // Avoid activating a late dynamic import after the section has left view.
      const module = await import('./visuals/experience-canvas.js');
      if (active.has(node.id)) { active.get(node.id).start(); continue; }
      visual = module.mountVisual(node, item.type, { scheduler, bus, capabilities });
      active.set(node.id,visual);
    }
    if (node.getBoundingClientRect().bottom >= 0 && node.getBoundingClientRect().top <= innerHeight) visual.start();
  }
}, { rootMargin:'100px 0px 100px 0px', threshold:0 });
visuals.forEach(item => canvasObserver.observe(document.getElementById(item.id)));
bus.on('motion:change', enabled => {
  if (!enabled) active.forEach(visual => visual.stop());
  else visuals.forEach(item => {
    const node = document.getElementById(item.id), rect = node.getBoundingClientRect();
    if (rect.bottom >= 0 && rect.top <= innerHeight) active.get(item.id)?.start();
  });
});
