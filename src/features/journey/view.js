import { JOURNEY_STEPS } from './model.js';
/** View: maps journey state to semantic DOM and pressed button states. */
export function createJourneyView(root) {
  const buttons = [...root.querySelectorAll('[data-step]')];
  const label = root.querySelector('#step-label'), glyph = root.querySelector('#step-glyph');
  const title = root.querySelector('#step-title'), description = root.querySelector('#step-description');
  return { buttons, nextButton: root.querySelector('#step-next'), render(model) {
    buttons.forEach((button, index) => {
      const selected = model.index === index;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    label.textContent = `STEP ${String(model.index + 1).padStart(2, '0')} / ${String(JOURNEY_STEPS.length).padStart(2, '0')}`;
    glyph.textContent = model.step.glyph; title.textContent = model.step.title;
    description.textContent = model.step.description;
  } };
}
