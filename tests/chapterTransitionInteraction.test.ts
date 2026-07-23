import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const transitionSource = readFileSync(
  new URL('../src/components/ChapterTransition.tsx', import.meta.url),
  'utf8',
);

test('chapter cards wait for the player after the title has resolved', () => {
  assert.match(transitionSource, /readyAt: RESOLVE_END \+ 0\.05/);
  assert.match(transitionSource, /setReadyForInput\(true\)/);
  assert.match(transitionSource, /if \(phase === 'exit' \|\| !readyForInput\) return/);
  assert.doesNotMatch(transitionSource, /holdEnd/);
  assert.doesNotMatch(transitionSource, /push\(\(\) => setPhase\('exit'\)/);
});

test('every ready chapter card exposes the same explicit continue action', () => {
  assert.match(transitionSource, /data-awaiting-input=\{readyForInput \? 'ready' : 'resolving'\}/);
  assert.match(transitionSource, /id="chapter-transition-continue"/);
  assert.match(transitionSource, />\s*Tap to begin\s*<\/motion\.span>/);
  assert.match(transitionSource, /event\.key !== 'Enter' && event\.key !== ' '/);
});
