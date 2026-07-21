import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('meta environment reaches the stage edges without duplicate phone padding', () => {
  const appSource = readFileSync('src/App.tsx', 'utf8');

  assert.match(appSource, /metaSceneActive \? 'bg-slate-950\/40' : 'bg-black'/);
  assert.doesNotMatch(appSource, /metaSceneActive \? 'phone-stage bg-slate-950\/40'/);
  assert.match(
    appSource,
    /data-scene-frame=\{metaSceneActive \? 'edge-to-edge' : 'fullscreen-game'\}/,
  );
});
