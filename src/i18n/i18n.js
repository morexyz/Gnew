import { FA } from './fa.js';

const translatableAttributes = ['aria-label', 'title', 'placeholder'];
const textOriginal = new WeakMap();
const attributeOriginal = new WeakMap();

/** Native, dependency-free copy localization: leaves the authored English HTML readable without JS. */
export function createI18n(bus) {
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  const stored = (() => { try { return localStorage.getItem('gnew-lang'); } catch { return null; } })();
  let lang = requested === 'fa' || requested === 'en' ? requested : stored === 'fa' ? 'fa' : 'en';
  const t = english => lang === 'fa' ? (FA[String(english)] ?? english) : english;
  function localize(root = document.body) {
    if (!root) return;
    const nodes = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = nodes.nextNode())) {
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement?.tagName)) continue;
      if (!textOriginal.has(node)) textOriginal.set(node, node.nodeValue);
      const saved = textOriginal.get(node);
      // Controllers may update an existing text node with new English data.
      if (node.nodeValue !== saved && node.nodeValue !== saved.replace(saved.trim(), FA[saved.trim()] ?? saved.trim())) {
        textOriginal.set(node, node.nodeValue);
      }
      const original = textOriginal.get(node);
      const trimmed = original.trim();
      if (!trimmed || !Object.hasOwn(FA, trimmed)) continue;
      node.nodeValue = lang === 'fa' ? original.replace(trimmed, FA[trimmed]) : original;
    }
    for (const element of [root, ...root.querySelectorAll('*')]) {
      if (!(element instanceof Element)) continue;
      let saved = attributeOriginal.get(element);
      if (!saved) { saved = {}; attributeOriginal.set(element, saved); }
      for (const attribute of translatableAttributes) {
        if (!element.hasAttribute(attribute)) continue;
        if (!(attribute in saved)) saved[attribute] = element.getAttribute(attribute);
        else if (element.getAttribute(attribute) !== saved[attribute] && element.getAttribute(attribute) !== FA[saved[attribute]]) saved[attribute] = element.getAttribute(attribute);
        const original = saved[attribute];
        if (Object.hasOwn(FA, original)) element.setAttribute(attribute, t(original));
      }
    }
  }
  function setLang(next) {
    if (next !== 'en' && next !== 'fa') return;
    lang = next;
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-language]').forEach(button => {
      const selected = button.dataset.language === next;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-active', selected);
    });
    // Rebuild dynamic MVC views before translating their newly generated English text.
    bus.emit('locale:change', next);
    localize();
    document.title = next === 'fa' ? 'جینو — طلا. هوشمندی. آزادی.' : 'Gnew — Gold. Intelligence. Freedom.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', next === 'fa'
      ? 'جینو؛ تجربه‌ای هوشمند، شفاف و مبتنی بر کیف پول شخصی برای مدیریت طلای دیجیتال. محصول در دست توسعه است.'
      : 'Experience Gnew: an intelligent, wallet-centered approach to digital gold management. Explore automation, transparency, and self-custody in an interactive journey.');
    try { localStorage.setItem('gnew-lang', next); } catch { /* storage may be unavailable */ }
    const current = new URL(location.href);
    current.searchParams.set('lang', next);
    try { history.replaceState(history.state, '', current.pathname + current.search + current.hash); } catch { /* file/about: URLs disallow history mutation */ }
  }
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.language)));
  bus.on('ui:select', () => queueMicrotask(() => localize()));
  bus.on('copy:refresh', root => queueMicrotask(() => localize(root || document.body))); 
  bus.on('ui:pulse', () => queueMicrotask(() => localize()));
  setLang(lang);
  return { get lang() { return lang; }, t, setLang, localize };
}
