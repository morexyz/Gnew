import { morphPath } from '../../animation/svg.js';
const INGOT = 'M 132 170 L 430 170 L 475 333 L 88 333 L 132 170 L 430 170 L 475 333 L 88 333 Z';
const TOKEN = 'M 280 65 L 402 116 L 455 240 L 402 364 L 280 415 L 158 364 L 105 240 L 158 116 Z';
export function mountGoldMorph(root, bus) {
  const path = root.querySelector('#gold-shape'), highlight = root.querySelector('#gold-highlight');
  const button = root.querySelector('#morph-toggle');
  const label = root.querySelector('#gold-mode-label');
  let digital = false, animation = null, accent = null;
  path.setAttribute('d', INGOT); highlight.setAttribute('d', INGOT);
  button.addEventListener('click', () => {
    const start = path.getAttribute('d');
    const accentStart = highlight.getAttribute('d');
    const end = digital ? INGOT : TOKEN;
    digital = !digital;
    animation?.cancel(); accent?.cancel();
    animation = morphPath(path, start, end, { duration: 1000, easing: t => 1 - (1 - t) ** 3 });
    accent = morphPath(highlight, accentStart, end, { duration: 1000, easing: t => 1 - (1 - t) ** 3 });
    label.textContent = digital ? 'TOKENIZED POSSIBILITY' : 'PHYSICAL HERITAGE';
    button.setAttribute('aria-label', digital ? 'Transform illustration to gold bar' : 'Transform illustration to digital token');
    button.setAttribute('aria-pressed', String(digital));
    bus.emit('ui:pulse', 1);
  });
}
