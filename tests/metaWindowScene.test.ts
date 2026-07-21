import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getMetaClockHandAngles } from '../src/components/MetaWallClock';
import { META_WINDOW_WEATHER } from '../src/components/MetaWindowScene';

const stages = [1, 2, 3, 4, 5] as const;

test('window weather becomes darker, cloudier, wetter, and windier across five stages', () => {
  const profiles = stages.map((stage) => META_WINDOW_WEATHER[stage]);

  assert.deepEqual(profiles.map((profile) => profile.cloudCount), [1, 2, 3, 3, 4]);
  assert.deepEqual(profiles.map((profile) => profile.rainCount), [0, 0, 6, 24, 36]);
  assert.deepEqual(profiles.map((profile) => profile.rainAngle), [0, 0, 3, 11, 18]);
  assert.deepEqual(profiles.map((profile) => profile.darkness), [0.28, 0.42, 0.58, 0.76, 0.9]);

  for (let index = 1; index < profiles.length; index += 1) {
    assert.ok(profiles[index].darkness > profiles[index - 1].darkness);
    assert.ok(profiles[index].cloudOpacity > profiles[index - 1].cloudOpacity);
    assert.ok(profiles[index].cloudDuration < profiles[index - 1].cloudDuration);
  }
});

test('window scene is authored entirely from SVG and CSS with restrained blur', () => {
  const source = readFileSync('src/components/MetaWindowScene.tsx', 'utf8');

  assert.match(source, /id="meta-window-scene"/);
  assert.match(source, /id="meta-window-rain"/);
  assert.match(source, /id="meta-window-branch"/);
  assert.match(source, /filter: 'blur\(1\.5px\)'/);
  assert.match(source, /shadow-\[inset_0_0_9px_rgba\(0,0,0,0\.45\)\]/);
  assert.match(source, /const animate = !reducedMotion/);
  assert.doesNotMatch(source, /<img|url\(/);
  assert.doesNotMatch(source, /blur\(6px\)|inset 0 0 22px/);
});

test('the runtime stage-one wall uses the corrected transparent-pane source', () => {
  const correctedWall = readFileSync('wall_1-removebg-preview.png');
  const runtimeWall = readFileSync('public/assets/meta-wall-stage-1.png');
  assert.deepEqual(runtimeWall, correctedWall);
});

test('analog clock angles follow the exact shared phone time', () => {
  assert.deepEqual(getMetaClockHandAngles('19:48'), { hour: 234, minute: 288 });
  assert.deepEqual(getMetaClockHandAngles('00:07'), { hour: 3.5, minute: 42 });
  assert.deepEqual(getMetaClockHandAngles('03:40'), { hour: 110, minute: 240 });
});

test('meta room wires the window and wall clock to chapter-owned state', () => {
  const source = readFileSync('src/components/MetaInteractionScene.tsx', 'utf8');
  const clockSource = readFileSync('src/components/MetaWallClock.tsx', 'utf8');

  assert.match(source, /<MetaWindowScene stage=\{wallStage\} reducedMotion=\{reducedMotion\} \/>/);
  assert.match(source, /getChapterPhoneWidgetState\(chapter\)\.clock/);
  assert.match(source, /<MetaWallClock time=\{chapterClock\} \/>/);
  assert.match(clockSource, /data-meta-clock-source="chapter-phone-widget"/);
  assert.match(clockSource, /left-\[30\.8%\] top-\[20\.5%\]/);
});
