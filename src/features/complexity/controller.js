export function mountComplexity(root, bus) {
  const slider = root.querySelector('#clarity-slider');
  const text = root.querySelector('#clarity-visual-label');
  const update = () => {
    const value = Number(slider.value);
    text.textContent = value > 65 ? 'MORE CLARITY' : value > 35 ? 'FINDING BALANCE' : 'LESS NOISE';
    bus.emit('visual:clarity', value);
    bus.emit('copy:refresh', text);
  };
  slider.addEventListener('input', update);
  update();
}
