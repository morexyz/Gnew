/** Pointer-responsive, multi-touch capable *illustration*, not a transaction widget. */
export function mountCustody(root, { engine, bus, capabilities, featureEnabled }) {
  const bridge = root.querySelector('#custody-bridge'), token = root.querySelector('#custody-token');
  const slider = document.getElementById('depth-slider'), trigger = document.getElementById('custody-demo');
  const pointers = new Map();
  let x = 0, y = 0, scale = 1, pinchStart = null, frame = 0, demoAbort = 0;
  const draw = () => {
    const depth = Number(slider.value) / 100;
    token.style.transform = `translate3d(${x}px,${y}px,0) scale(${Math.min(1.7, scale * depth)})`;
  };
  const update = () => {
    if (!pointers.size) return;
    if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart !== null) slider.value = String(Math.max(75, Math.min(135, Math.round(distance / pinchStart * 100))));
      else pinchStart = distance;
      scale = 1; x = 0; y = 0;
    } else {
      pinchStart = null;
      const point = [...pointers.values()][0];
      const rect = bridge.getBoundingClientRect();
      x = Math.max(-rect.width * .42, Math.min(rect.width * .42, point.x - rect.left - rect.width / 2));
      y = Math.max(-55, Math.min(55, point.y - rect.top - rect.height / 2));
      scale = 1 + Math.min(.28, point.pressure * .2 + Math.abs(point.tiltX) / 180 + Math.abs(point.tiltY) / 180);
    }
    draw();
  };
  if (featureEnabled && capabilities.pointerEvents) {
    bridge.style.touchAction = 'none';
    const onPointer = event => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, pressure: event.pressure || 0, tiltX: event.tiltX || 0, tiltY: event.tiltY || 0 });
      if (event.type === 'pointerdown') { bridge.setPointerCapture?.(event.pointerId); bus.emit('ui:select'); }
      update();
    };
    bridge.addEventListener('pointerdown', onPointer);
    bridge.addEventListener('pointermove', event => { if (pointers.has(event.pointerId) || event.pointerType === 'mouse') onPointer(event); });
    for (const endType of ['pointerup', 'pointercancel', 'pointerleave']) bridge.addEventListener(endType, event => { pointers.delete(event.pointerId); pinchStart = null; });
  }
  slider.addEventListener('input', draw);
  trigger.addEventListener('click', () => {
    const run = ++demoAbort;
    const began = performance.now();
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-off') ? 0 : 1800;
    cancelAnimationFrame(frame);
    const animate = now => {
      if (run !== demoAbort) return;
      const t = duration ? Math.min(1, (now - began) / duration) : 1;
      const rect = bridge.getBoundingClientRect();
      x = (-.40 + .8 * t) * rect.width;
      y = Math.sin(t * Math.PI * 2) * -35;
      scale = 1 + Math.sin(t * Math.PI) * .18;
      draw();
      if (t < 1) frame = requestAnimationFrame(animate);
      else { x = 0; y = 0; scale = 1; draw(); }
    };
    bus.emit('ui:pulse', 2);
    frame = requestAnimationFrame(animate);
  });
  draw();
}
