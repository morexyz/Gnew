import { fitCanvas } from '../animation/canvas.js';
import { CONFIG } from '../config.js';

const GOLD = [232, 184, 109];
const opacity = (alpha, rgb = GOLD) => `rgba(${rgb.join(',')},${Math.min(1,Math.max(0,alpha))})`;
const TAU = Math.PI * 2;

/** Visuals are mounted lazily by IntersectionObserver and operate only while in view. */
export function mountVisual(canvas, type, { scheduler, bus, capabilities }) {
  const surface = fitCanvas(canvas, { maxDpr: CONFIG.performance.maxDpr });
  if (!surface) return { start() {}, stop() {}, destroy() {} };
  const { ctx } = surface;
  let unloop = null, frame = 0, last = 0, worker = null, workerPoints = null, clarity = 30;
  let workerFailed = false;
  const stars = Array.from({ length: CONFIG.performance.maxParticles }, (_, i) => ({
    a: i * 2.39996, r: Math.sqrt((i + .5) / CONFIG.performance.maxParticles),
    speed: .08 + (i % 9) * .008, size: .6 + (i % 7) * .22,
  }));
  const fluidParticles = Array.from({ length: 75 }, (_, i) => ({
    x: ((i * .618033) % 1), y: ((i * .754877) % 1), life: .4 + (i % 6) / 10,
  }));
  const offClarity = type === 'noise' ? bus.on('visual:clarity', value => {
    clarity = Number(value); worker?.postMessage({ type: 'clarity', value: clarity });
  }) : null;
  function hero(time) {
    const w = surface.width, h = surface.height;
    const centerX = w * .52, centerY = h * .5, radius = Math.min(w,h) * .38;
    ctx.save();
    ctx.translate(centerX, centerY); ctx.rotate(-.27);
    for (let band = 0; band < 3; band++) {
      ctx.beginPath(); ctx.ellipse(0, 0, radius * (1 + band * .14), radius * (.54 + band * .05), time * .03 * (band % 2 ? -1 : 1), 0, TAU);
      ctx.strokeStyle = opacity(.07 + band * .03); ctx.lineWidth = 1; ctx.stroke();
    }
    for (const s of stars) {
      const angle = s.a + time * s.speed;
      const x = Math.cos(angle) * radius * (1.1 + s.r * .45);
      const y = Math.sin(angle) * radius * (.67 + s.r * .38);
      ctx.fillStyle = opacity(.19 + .5 * Math.abs(Math.sin(s.a * 2 + time)));
      ctx.beginPath(); ctx.arc(x,y,s.size,0,TAU); ctx.fill();
    }
    ctx.restore();
  }
  function noise(time) {
    const w = surface.width, h = surface.height;
    const intensity = 1 - clarity / 100;
    const count = 105;
    for (let i = 0; i < count; i++) {
      let x, y;
      if (workerPoints?.length >= count * 2) {
        x = workerPoints[2*i] * w; y = workerPoints[2*i + 1] * h;
      } else {
        const r = Math.sqrt((i + .5) / count), a = i*2.4 + time*(.015 + intensity * .03);
        x = w * (.5 + Math.cos(a) * r * .47);
        y = h * (.5 + Math.sin(a) * r * .48);
      }
      const size = .8 + intensity * (i%5);
      ctx.fillStyle = opacity(.13 + intensity * .42);
      ctx.beginPath(); ctx.arc(x,y,size,0,TAU); ctx.fill();
      if (intensity > .22 && i%4 === 0) {
        const endX = x + Math.cos(i * 1.31 + time) * 40 * intensity;
        const endY = y + Math.sin(i * 1.21 - time) * 70 * intensity;
        ctx.strokeStyle = opacity(intensity * .12); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(endX,endY); ctx.stroke();
      }
    }
  }
  // Divergence-free stream-function field: fluid-inspired particle advection, not a CFD market model.
  function fluid(time, delta) {
    const w = surface.width, h = surface.height;
    const dt = Math.min(delta,42) / 1000;
    const stream = (x,y) => {
      const a = x * TAU * 1.3 + time * .21, b = y * TAU * .9 - time * .16;
      return [Math.sin(a) * Math.cos(b) * 0.20, -Math.cos(a) * Math.sin(b) * .21];
    };
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const p of fluidParticles) {
      const oldX = p.x, oldY = p.y;
      const [vx,vy] = stream(p.x,p.y);
      p.x += vx * dt * 2.4; p.y += vy * dt * 2.4;
      if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) { p.x = ((p.x % 1) + 1) % 1; p.y = ((p.y % 1) + 1) % 1; }
      ctx.beginPath(); ctx.moveTo(oldX*w,oldY*h); ctx.lineTo(p.x*w,p.y*h);
      ctx.strokeStyle = opacity(.04 + p.life*.12); ctx.lineWidth = 1.4; ctx.stroke();
    }
    ctx.restore();
  }
  function trace(time) {
    const w = surface.width, h = surface.height;
    const centers = [[.13,.46],[.5,.35],[.87,.46]];
    centers.forEach(([a,b],index) => {
      const r = (time * 17 + index * 41) % 165;
      ctx.strokeStyle = opacity(.13 * (1-r/165)); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(w*a,h*b,r,0,TAU); ctx.stroke();
      for (let i=0;i<12;i++) {
        const angle = TAU*i/12 + time*.1;
        const x = w*a + Math.cos(angle)*(42+index*9), y = h*b + Math.sin(angle)*(42+index*9);
        ctx.fillStyle=opacity(.08+Math.abs(Math.sin(time+i))*.25);
        ctx.fillRect(x,y,2,2);
      }
    });
  }
  function draw(now, delta) {
    if (now - last < 32) return;
    last = now;
    const t = now / 1000;
    if (type === 'fluid') ctx.fillStyle = 'rgba(0,0,0,.045)';
    else ctx.clearRect(0,0,surface.width,surface.height);
    if (type === 'fluid') ctx.fillRect(0,0,surface.width,surface.height);
    if (type === 'hero') hero(t);
    if (type === 'noise') noise(t);
    if (type === 'fluid') fluid(t, delta);
    if (type === 'trace') trace(t);
  }
  function start() {
    if (unloop) return;
    if (type === 'noise' && capabilities.webWorkers && CONFIG.features.webWorkers && !workerFailed && !worker) {
      try {
        worker = new Worker(new URL('../workers/field-worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = event => { if (event.data.type === 'frame') workerPoints = event.data.points; };
        worker.onerror = () => { workerFailed = true; worker?.terminate(); worker = null; workerPoints = null; };
        worker.postMessage({ type:'clarity', value:clarity });
      } catch { workerFailed = true; }
    }
    worker?.postMessage({ type:'start', fps:CONFIG.performance.workerFps });
    unloop = scheduler.add(draw);
  }
  function stop() {
    unloop?.(); unloop = null;
    worker?.postMessage({ type:'stop' });
    ctx.clearRect(0,0,surface.width,surface.height);
  }
  return { start, stop, destroy() { stop(); worker?.terminate(); offClarity?.(); surface.destroy(); } };
}
