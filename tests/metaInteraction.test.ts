import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  applyVirtualKey,
  canStartMetaInteraction,
  META_TAP_TIMING,
  normalizeVirtualKey,
  shouldRevealMetaView,
  shouldShowMetaScene,
} from '../src/lib/metaInteraction';

test('meta camera reveal requires both a second Gate 37 death and an opened leaderboard', () => {
  assert.equal(shouldRevealMetaView(1, true), false);
  assert.equal(shouldRevealMetaView(2, false), false);
  assert.equal(shouldRevealMetaView(2, true), true);
  assert.equal(shouldRevealMetaView(3, true), true);
});

test('developer chapter tools preview the meta scene without changing the story unlock rule', () => {
  assert.equal(shouldShowMetaScene(false, false), false);
  assert.equal(shouldShowMetaScene(false, true), true);
  assert.equal(shouldShowMetaScene(true, false), true);
  assert.equal(shouldShowMetaScene(true, true), true);
  assert.equal(shouldShowMetaScene(false, false, true), true);
});

test('only one animated meta interaction can run at a time', () => {
  assert.equal(canStartMetaInteraction(true, false, false), true);
  assert.equal(canStartMetaInteraction(true, true, false), false);
  assert.equal(canStartMetaInteraction(false, false, false), false);
});

test('right hand has time to unfold before travel and regrip after returning', () => {
  assert.ok(META_TAP_TIMING.unfoldMs >= 150);
  assert.ok(META_TAP_TIMING.travelMs >= 300);
  assert.ok(META_TAP_TIMING.settleMs >= 200);
});

test('reduced motion keeps interaction immediate instead of queueing hand movement', () => {
  assert.equal(canStartMetaInteraction(true, false, true), false);
});

test('virtual keys append, erase, and submit deterministically', () => {
  assert.deepEqual(applyVirtualKey('ARC', '_'), { value: 'ARC_', submit: false });
  assert.deepEqual(applyVirtualKey('ARC_', '1'), { value: 'ARC_1', submit: false });
  assert.deepEqual(applyVirtualKey('ARC_1', 'Backspace'), { value: 'ARC_', submit: false });
  assert.deepEqual(applyVirtualKey('ARC_184', 'Enter'), { value: 'ARC_184', submit: true });
});

test('unsupported keys are ignored and max length is respected', () => {
  assert.equal(normalizeVirtualKey('ArrowLeft'), null);
  assert.equal(normalizeVirtualKey('a'), 'a');
  assert.deepEqual(applyVirtualKey('ABCD', 'E', 4), { value: 'ABCD', submit: false });
});

test('meta camera uses layered anatomical hands instead of rounded placeholder blobs', () => {
  const sceneSource = readFileSync(
    new URL('../src/components/MetaInteractionScene.tsx', import.meta.url),
    'utf8',
  );
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.match(sceneSource, /id="meta-left-grip-back"/);
  assert.match(sceneSource, /id="meta-left-thumb"/);
  assert.match(sceneSource, /id="meta-right-hold-back"/);
  assert.match(sceneSource, /id="meta-right-hold-front"/);
  assert.match(sceneSource, /id="meta-tapping-hand-back"/);
  assert.match(sceneSource, /data-fingertip="right-index"/);
  assert.match(sceneSource, /data-continuous-grip="palm-thumb"/);
  assert.doesNotMatch(sceneSource, /VisibleRearFingers/);
  assert.doesNotMatch(sceneSource, /data-visible-grip-finger/);
  assert.doesNotMatch(sceneSource, /meta-(?:left|right)-visible-rear-fingers/);
  assert.match(sceneSource, /bottom-\[30%\] left-\[-7%\]/);
  assert.match(sceneSource, /left-\[-10%\] top-\[20%\]/);
  assert.match(sceneSource, /id="meta-desk-surface"/);
  assert.match(sceneSource, /id="meta-phone-depth"/);
  assert.match(sceneSource, /id="meta-glass-reflection"/);
  assert.match(sceneSource, /rotateX: 5\.5/);
  assert.match(sceneSource, /data-hand-pose=\{interactionPending \? 'reaching' : 'holding'\}/);
  assert.match(sceneSource, /opacity: interactionPending && pointer\.x > 0 \? 1 : 0/);
  assert.match(sceneSource, /className="[^"]*z-\[8\][^"]*"[\s\S]{0,180}id="meta-tapping-hand-back"/);
  assert.match(sceneSource, /className="[^"]*z-\[60\][^"]*"[\s\S]{0,180}id="meta-pointer-hand"/);
  assert.match(appSource, /progress\.currentChapter <= 9/);
  assert.match(appSource, /const metaSceneActive = shouldShowMetaScene\(metaViewActive, debugMode, investigationMetaPersistent\)/);
  assert.match(appSource, /<MetaInteractionScene active=\{metaSceneActive\}>/);
  assert.match(sceneSource, /scale: 0\.92/);
  assert.match(sceneSource, /id="meta-protagonist-name"/);
  assert.doesNotMatch(sceneSource, /stroke="#8a543e"/);
  assert.doesNotMatch(sceneSource, /stroke="#89513b"/);
  assert.doesNotMatch(sceneSource, /rounded-\[52%_44%_48%_40%\]/);
});
