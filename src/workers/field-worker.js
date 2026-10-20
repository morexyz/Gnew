/** Dedicated worker: dynamic visual field; no financial data or external APIs. */
let timer = null, tick = 0, clarity = 30;
const N = 105;
function field() {
  const points = new Float32Array(N * 2);
  const intensity = 1 - clarity / 100;
  for (let i = 0; i < N; i++) {
    const a = (i * 2.39996) + tick * (.018 + intensity * .011);
    const r = Math.sqrt((i + .5) / N);
    const whirl = (1.2 - r) * intensity * .36;
    const n = Math.sin(i * 12.989 + tick * .07) * .1 * intensity;
    points[i * 2] = .5 + Math.cos(a + whirl) * r * (.48 + n);
    points[i * 2 + 1] = .5 + Math.sin(a + whirl) * r * (.46 - n);
  }
  self.postMessage({ type: 'frame', points }, [points.buffer]);
  tick++;
}
self.onmessage = event => {
  const { type, value, fps = 24 } = event.data;
  if (type === 'clarity') { clarity = Math.max(0, Math.min(100, Number(value) || 0)); return; }
  if (type === 'start') { clearInterval(timer); timer = setInterval(field, Math.round(1000 / Math.max(1, Math.min(fps, 30)))); field(); }
  if (type === 'stop') { clearInterval(timer); timer = null; }
};
