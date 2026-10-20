import { createJourneyModel } from './model.js';
import { createJourneyView } from './view.js';
/** Controller: sole owner of journey user events. */
export function mountJourney(root, bus) {
  const model = createJourneyModel(), view = createJourneyView(root);
  view.buttons.forEach(btn => btn.addEventListener('click', () => {
    model.select(Number(btn.dataset.step)); view.render(model); bus.emit('ui:select');
  }));
  view.nextButton.addEventListener('click', () => { model.next(); view.render(model); bus.emit('ui:select'); });
  bus.on('locale:change', () => view.render(model));
  view.render(model);
}
