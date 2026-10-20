const CHAPTERS = Object.freeze([
  ['home','A new perspective'],['shift','The shift'],['intelligence','Intelligence'],
  ['digital-gold','Digital gold'],['custody','Your control'],['journey','Getting started'],
  ['portfolio','Portfolio'],['transparency','Transparency'],['technology','Our approach'],
  ['benefits','Better management'],['vision','Vision'],['gold-lab','A world of possibility'],
  ['risks','The risks'],['close','The future'],
]);
/** A small optional story compass for a long, connected scrollytelling page. */
export function mountCompass(root, { bus, i18n }) {
  if (!root) return () => {};
  const detail = root.querySelector('details');
  const current = root.querySelector('#compass-current');
  const nav = root.querySelector('nav');
  let chapter = 'home';
  function render() {
    const index = Math.max(0, CHAPTERS.findIndex(([id]) => id === chapter));
    current.textContent = `${String(index+1).padStart(2,'0')} / ${CHAPTERS.length}`;
    nav.replaceChildren();
    CHAPTERS.forEach(([id,title],i) => {
      const a=document.createElement('a');
      a.href=`#${id}`; a.className=id===chapter?'is-active':'';
      if (id===chapter) a.setAttribute('aria-current','location');
      const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');
      const label=document.createElement('span');label.textContent=i18n.t(title);
      a.append(n,label);nav.appendChild(a);
    });
  }
  root.hidden = false;
  nav.addEventListener('click', event => { if (event.target.closest('a')) detail.open = false; });
  const offRoute = bus.on('chapter:enter', id => { chapter=id; render(); });
  const offLang = bus.on('locale:change', render);
  render();
  return () => { offRoute();offLang();root.hidden=true; };
}
