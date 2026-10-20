import { createPortfolioModel } from './model.js';
import { createPortfolioView } from './view.js';
export function mountPortfolio(root, bus) {
  const model = createPortfolioModel(), view = createPortfolioView(root);
  const select = tab => { model.setTab(tab); view.render(model); bus.emit('ui:select'); };
  view.buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(button.dataset.tab));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? view.buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : view.buttons.length - 1)) % view.buttons.length;
      view.buttons[next].focus(); select(view.buttons[next].dataset.tab);
    });
  });
  bus.on('locale:change', () => view.render(model));
  view.render(model);
}
