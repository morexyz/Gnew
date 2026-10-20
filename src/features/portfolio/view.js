import { PANELS } from './model.js';
/** View: presentation only. All panel content is trusted, local constant data. */
export function createPortfolioView(root) {
  const buttons = [...root.querySelectorAll('[data-tab]')];
  const panel = root.querySelector('#dashboard-panel');
  const original = panel.innerHTML;
  return { buttons, render(model) {
    buttons.forEach(btn => {
      const selected = btn.dataset.tab === model.tab;
      btn.setAttribute('aria-selected', String(selected)); btn.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `tab-${model.tab}`);
    if (model.tab === 'overview') { panel.innerHTML = original; return; }
    const item = PANELS[model.tab];
    panel.innerHTML = `<div class="dashboard-detail"><div class="dashboard-detail-icon" aria-hidden="true">${item.icon}</div><span class="dashboard-detail-label">${item.label}</span><h3 class="dashboard-detail-title">${item.title}</h3><p class="dashboard-detail-description">${item.description}</p><div class="dashboard-pills">${item.tags.map(tag => `<span>${tag}</span>`).join('')}</div></div>`;
  }};
}
