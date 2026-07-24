import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canConsumeVerticalWheel } from '../src/lib/wheelContainment';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

test('vertical wheel consumption respects scroll boundaries', () => {
  assert.equal(canConsumeVerticalWheel(50, 500, 200, 40), true);
  assert.equal(canConsumeVerticalWheel(50, 500, 200, -40), true);
  assert.equal(canConsumeVerticalWheel(0, 500, 200, -40), false);
  assert.equal(canConsumeVerticalWheel(300, 500, 200, 40), false);
  assert.equal(canConsumeVerticalWheel(0, 200, 200, 40), false);
});

test('the game frame owns wheel input with a native non-passive capture listener', () => {
  assert.match(appSource, /ref=\{workspaceRef\}/);
  assert.match(appSource, /event\.preventDefault\(\)/);
  assert.match(
    appSource,
    /window\.addEventListener\('wheel', containGameWheel, \{ capture: true, passive: false \}\)/,
  );
  assert.match(appSource, /scrollable\.scrollBy\(\{ top: event\.deltaY \* deltaScale, behavior: 'auto' \}\)/);
  assert.match(appSource, /overscroll-none/);
  assert.match(metaSource, /const wheelAlreadyRelayed = event\.defaultPrevented/);
  assert.match(metaSource, /if \(!wheelAlreadyRelayed\)/);
});
