import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createResonanceModel, RESONANCE_MODES } from '../src/features/resonance/model.js';
import { FA } from '../src/i18n/fa.js';
import { CONFIG } from '../src/config.js';
import { JOURNEY_STEPS } from '../src/features/journey/model.js';
import { PANELS } from '../src/features/portfolio/model.js';

const html = readFileSync(new URL('../index.html', import.meta.url),'utf8');

test('the experience is a continuous bilingual HTML website', () => {
  assert.match(html, /id="gold-lab"/);
  assert.match(html, /data-language="fa"/);
  assert.match(html, /data-language="en"/);
  assert.match(html, /id="risks"/);
  assert.doesNotMatch(html, /data-slide=/);
});
test('resonance model rejects unexpected modes and bounds visual energy', () => {
  const model=createResonanceModel();
  assert.equal(model.mode.title,RESONANCE_MODES.heritage.title);
  model.setMode('intelligence');
  assert.equal(model.mode.tint,1);
  model.setMode('not-real');
  assert.equal(model.mode.tint,1);
  model.setEnergy(300);assert.equal(model.energy,100);
  model.setEnergy(-3);assert.equal(model.energy,20);
  model.setPaused(true);assert.equal(model.paused,true);
});
test('Persian dictionary covers all interactive model descriptions', () => {
  const dynamic=[...JOURNEY_STEPS.flatMap(x=>[x.title,x.description]),
    ...Object.values(PANELS).flatMap(x=>[x.label,x.title,x.description,...x.tags]),
    ...Object.values(RESONANCE_MODES).flatMap(x=>[x.title,x.description])];
  for (const phrase of dynamic) assert.ok(FA[phrase],`missing Persian translation: ${phrase}`);
  assert.match(FA['No guaranteed profits.'],/تضمینی/);
  assert.match(FA['Gnew is under development. Nothing on this website is a promise of financial performance.'],/در دست توسعه/);
});
test('GPU artwork remains optional and safe on unsupported hardware', () => {
  assert.equal(typeof CONFIG.features.goldReactor,'boolean');
  const reactor=readFileSync(new URL('../src/visuals/gold-reactor.js',import.meta.url),'utf8');
  assert.match(reactor,/getContext\('webgl'/);
  assert.match(reactor,/canvasFallback/);
  assert.match(reactor,/unsubscribe\?\.\(\)/);
});
