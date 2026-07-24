import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const transitionSource = readFileSync(
  new URL('../src/components/ChapterTransition.tsx', import.meta.url),
  'utf8',
);
const phoneSource = readFileSync(
  new URL('../src/components/PhoneSimulator.tsx', import.meta.url),
  'utf8',
);
const metaSource = readFileSync(
  new URL('../src/components/MetaInteractionScene.tsx', import.meta.url),
  'utf8',
);

test('chapter cards accept the first player tap and keep shielding Home while leaving', () => {
  assert.match(transitionSource, /readyAt: RESOLVE_END \+ 0\.05/);
  assert.match(transitionSource, /setReadyForInput\(true\)/);
  assert.match(transitionSource, /event\?\.preventDefault\(\)/);
  assert.match(transitionSource, /event\?\.stopPropagation\(\)/);
  assert.match(transitionSource, /if \(phase === 'exit'\) return/);
  assert.doesNotMatch(transitionSource, /!readyForInput\) return/);
  assert.match(transitionSource, /pointerEvents: 'auto'/);
  assert.doesNotMatch(transitionSource, /holdEnd/);
  assert.doesNotMatch(transitionSource, /push\(\(\) => setPhase\('exit'\)/);
});

test('every ready chapter card exposes the same explicit continue action', () => {
  assert.match(transitionSource, /data-awaiting-input=\{readyForInput \? 'ready' : 'resolving'\}/);
  assert.match(transitionSource, /id="chapter-transition-continue"/);
  assert.match(transitionSource, />\s*Tap to begin\s*<\/motion\.span>/);
  assert.match(transitionSource, /event\.key !== 'Enter' && event\.key !== ' '/);
});

test('chapter transitions quietly point players to the persistent manual save slot', () => {
  assert.match(transitionSource, /id="chapter-transition-save-reminder"/);
  assert.match(transitionSource, /Auto checkpoint saved · FileBox can keep a manual save too/);
});

test('dismissing a chapter card always resolves onto the first Home page', () => {
  assert.match(
    phoneSource,
    /<ChapterTransition[\s\S]{0,240}onDone=\{\(\) => \{[\s\S]{0,120}setActiveApp\('home'\);[\s\S]{0,80}setHomePage\(0\);[\s\S]{0,80}setActiveTransition\(null\);/,
  );
});

test('Meta pointer recovery never retargets a chapter transition to an app underneath', () => {
  const pointerStart = metaSource.indexOf('const handlePointerDownCapture');
  const clickStart = metaSource.indexOf('const handleClickCapture', pointerStart);
  const pointerCapture = metaSource.slice(pointerStart, clickStart);
  const clickCapture = metaSource.slice(clickStart, metaSource.indexOf('const handlePointerMove', clickStart));

  assert.ok(pointerStart >= 0 && clickStart > pointerStart);
  assert.match(pointerCapture, /if \(source\.closest\('#chapter-transition'\)\) return/);
  assert.ok(
    pointerCapture.indexOf("source.closest('#chapter-transition')") <
      pointerCapture.indexOf('const selector ='),
  );
  assert.match(clickCapture, /if \(source\.closest\('#chapter-transition'\)\) return/);
});
