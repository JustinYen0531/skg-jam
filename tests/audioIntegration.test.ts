import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const audioSource = readFileSync(new URL('../src/lib/audio.ts', import.meta.url), 'utf8');
const flappySource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

test('P0 sound buses keep interaction details above ambience', () => {
  assert.match(audioSource, /gameplay: 0\.85/);
  assert.match(audioSource, /ui: 0\.6/);
  assert.match(audioSource, /narrative: 0\.5/);
  assert.match(audioSource, /metaFoley: 0\.65/);
  assert.match(audioSource, /ambience: 0\.12/);
});

test('core P0 sound events remain connected to gameplay and the Meta interface', () => {
  assert.match(flappySource, /audio\.play\('flight\.flap'\)/);
  assert.match(flappySource, /audio\.play\('flight\.score'/);
  assert.match(flappySource, /audio\.play\('flight\.pipeHit'/);
  assert.match(flappySource, /audio\.play\('flight\.deathResult'/);
  assert.match(phoneSource, /audio\.play\('phone\.appOpen'\)/);
  assert.match(phoneSource, /audio\.play\('phone\.home'\)/);
  assert.match(metaSource, /audio\.play\('key\.character'\)/);
  assert.match(metaSource, /audio\.play\('meta\.fingerContact'\)/);
  assert.match(metaSource, /audio\.play\('meta\.cameraPullback'\)/);
  assert.match(audioSource, /case 'narrative\.glyph'/);
});
