import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createEventBus } from '../src/core/event-bus.js';
import { JOURNEY_STEPS, createJourneyModel } from '../src/features/journey/model.js';
import { PANELS, createPortfolioModel } from '../src/features/portfolio/model.js';

test('is a section-based website, not a slide router', () => {
  assert.equal(CONFIG.routeMode, 'hash-anchor');
  assert.equal(CONFIG.features.scrollAnimations, true);
  assert.equal(CONFIG.features.svgMorphing, true);
});
test('the available experiences are actually enabled', () => {
  for (const key of ['particleCanvas','noiseCanvas','fluidCanvas','webWorkers','advancedPointer','audioFeedback']) assert.equal(CONFIG.features[key], true);
});
test('journey model covers five bounded steps', () => {
  const model = createJourneyModel();
  assert.equal(JOURNEY_STEPS.length,5); model.select(100); assert.equal(model.index,4);
  model.next(); assert.equal(model.index,0);
});
test('portfolio tabs reject unsupported panels', () => {
  const m = createPortfolioModel(); m.setTab('activity'); assert.equal(m.tab,'activity');
  m.setTab('invalid'); assert.equal(m.tab,'activity'); assert.ok(PANELS.permissions);
});
test('event bus can unsubscribe without affecting sibling listeners', () => {
  const bus = createEventBus(); let a=0,b=0;
  const off = bus.on('pulse', () => a++); bus.on('pulse', () => b++);
  bus.emit('pulse'); off(); bus.emit('pulse');
  assert.deepEqual([a,b],[1,2]);
});
