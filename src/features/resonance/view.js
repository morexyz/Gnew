/** View writes only the small changing copy/selection; never re-renders the Canvas. */
export function createResonanceView(root) {
  const buttons = [...root.querySelectorAll('[data-mode]')];
  const title = root.querySelector('#resonance-mode-title');
  const description = root.querySelector('#resonance-mode-description');
  const panel = root.querySelector('#resonance-copy');
  const pauseButton = root.querySelector('#resonance-play');
  return { buttons, pauseButton, energyInput: root.querySelector('#resonance-energy'),
    render(model, t = v => v) {
      const item = model.mode;
      buttons.forEach(button => {
        const chosen = button.dataset.mode === item.key;
        button.setAttribute('aria-selected', String(chosen)); button.tabIndex = chosen ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', `mode-${item.key}`);
      root.dataset.scene = item.key;
      title.textContent = t(item.title); description.textContent = t(item.description);
      pauseButton.setAttribute('aria-pressed', String(model.paused));
      pauseButton.firstChild.textContent = t(model.paused ? 'Play visual' : 'Pause visual') + ' ';
    },
  };
}
