import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  applyVirtualKey,
  canStartMetaInteraction,
  getMetaDevicePostureAction,
  getMetaCameraPitch,
  getScrollFingerTravel,
  META_CAMERA_PITCH,
  META_TAP_TIMING,
  normalizeVirtualKey,
  shouldRevealMetaView,
  shouldShowMetaScene,
} from '../src/lib/metaInteraction';

test('meta camera reveal requires both a second Gate 40 death and an opened leaderboard', () => {
  assert.equal(shouldRevealMetaView(1, true), false);
  assert.equal(shouldRevealMetaView(2, false), false);
  assert.equal(shouldRevealMetaView(2, true), true);
  assert.equal(shouldRevealMetaView(3, true), true);
});

test('developer chapter tools preview the meta scene without changing the story unlock rule', () => {
  assert.equal(shouldShowMetaScene(false, false, 'intro_game'), false);
  assert.equal(shouldShowMetaScene(false, true, 'intro_game'), true);
  assert.equal(shouldShowMetaScene(true, false, 'intro_game'), true);
  assert.equal(shouldShowMetaScene(true, true, 'intro_game'), true);
});

test('Chapter 1 and every later restored-phone phase keep the Meta scene active', () => {
  assert.equal(shouldShowMetaScene(false, false, 'os_unlocked'), true);
  assert.equal(shouldShowMetaScene(false, false, 'passed_40'), true);
  assert.equal(shouldShowMetaScene(false, false, 'credits'), true);
  assert.equal(shouldShowMetaScene(false, false, 'ending_choice'), true);
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

test('mouse wheel direction maps to the opposite touchscreen finger swipe', () => {
  assert.equal(getScrollFingerTravel(120), -58);
  assert.equal(getScrollFingerTravel(-120), 58);
  assert.equal(getScrollFingerTravel(0), 0);
});

test('mouse height maps to a clamped camera pitch from desk-flat to upright', () => {
  assert.equal(getMetaCameraPitch(0, 1000), META_CAMERA_PITCH.topDeg);
  assert.equal(getMetaCameraPitch(500, 1000), 8);
  assert.equal(getMetaCameraPitch(1000, 1000), META_CAMERA_PITCH.bottomDeg);
  assert.equal(getMetaCameraPitch(-200, 1000), META_CAMERA_PITCH.topDeg);
  assert.equal(getMetaCameraPitch(1200, 1000), META_CAMERA_PITCH.bottomDeg);
  assert.equal(getMetaCameraPitch(20, 0), META_CAMERA_PITCH.restDeg);
});

test('an idle desk click rests the phone and the next click anywhere wakes it', () => {
  assert.equal(META_CAMERA_PITCH.tableDeg >= 40, true);
  assert.equal(getMetaDevicePostureAction(true, false, false, false), 'rest');
  assert.equal(getMetaDevicePostureAction(true, false, true, false), null);
  assert.equal(getMetaDevicePostureAction(true, false, false, true), 'wake');
  assert.equal(getMetaDevicePostureAction(true, false, true, true), 'wake');
  assert.equal(getMetaDevicePostureAction(true, true, true, true), null);
  assert.equal(getMetaDevicePostureAction(false, false, false, true), null);
});

test('rest posture lays down the phone and swaps the grip for desk-plane hands', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.match(scene, /getMetaDevicePostureAction\([\s\S]{0,180}deviceResting/);
  assert.match(scene, /if \(!targetInsidePhone\) \{[\s\S]{0,120}event\.preventDefault\(\)/);
  assert.match(scene, /data-device-posture=\{deviceResting \? 'table-rest' : 'upright'\}/);
  assert.match(scene, /deviceResting \? 'locked-table' : 'mouse-y'/);
  assert.match(scene, /cameraPitchTarget\.set\(nextResting \? META_CAMERA_PITCH\.tableDeg : META_CAMERA_PITCH\.restDeg\)/);
  assert.match(scene, /deviceResting \? \{ scale: 0\.8, y: '4%' \} : \{ scale: 0\.92, y: '-13%' \}/);
  assert.match(scene, /deviceResting \? \{ rotateY: 0, rotateZ: 0 \} : \{ rotateY: -1\.4, rotateZ: -0\.35 \}/);
  assert.match(scene, /opacity: deviceResting \? 0 : 1,[\s\S]{0,100}x: deviceResting \? '-3%' : 0/);
  assert.match(scene, /opacity: deviceResting \|\| interactionPending \|\| scrollGesture \? 0 : 1/);
  assert.match(scene, /opacity: deviceResting \? 1 : 0,[\s\S]{0,240}x: deviceResting \? '-8%' : 0,[\s\S]{0,100}y: deviceResting \? '10%' : '12%'/);
  assert.match(scene, /opacity: deviceResting && !interactionPending && !scrollGesture \? 1 : 0/);
  assert.equal((scene.match(/scale: deviceResting \? 0\.46 : 0\.46/g) ?? []).length, 2);
  assert.match(scene, /rotateZ: deviceResting \? -8 : 0/);
  assert.match(scene, /rotateZ: deviceResting \? 8 : 0/);
  assert.match(scene, /transformOrigin: '25% 100%'/);
  assert.match(scene, /transformOrigin: '75% 100%'/);
  assert.match(scene, /scaleX: 0\.36, scaleY: 0\.72, y: '-1%'/);
  assert.match(scene, /data-desk-perspective=\{deviceResting \? 'flattened-trapezoid' : 'raised-front-edge'\}/);
  assert.equal((scene.match(/data-resting-hand-perspective="desk-plane"/g) ?? []).length, 2);
  assert.equal((scene.match(/data-wrist-crop="below-scene-edge"/g) ?? []).length, 2);
  assert.match(scene, /id="meta-device-contact-shadow"/);
});

test('virtual keyboard is embedded in the phone surface at sixty percent opacity', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const deviceTilt = scene.indexOf('id="meta-device-tilt"');
  const keyboardSurface = scene.indexOf('data-meta-keyboard-surface="phone-screen"');
  const glassReflection = scene.indexOf('id="meta-glass-reflection"');

  assert.ok(deviceTilt >= 0 && keyboardSurface > deviceTilt);
  assert.ok(glassReflection > keyboardSurface);
  assert.match(scene, /animate=\{\{ opacity: 0\.6, y: 0 \}\}/);
  assert.match(scene, /bottom-\[7%\]/);
});

test('meta camera uses layered anatomical hands instead of rounded placeholder blobs', () => {
  const sceneSource = readFileSync(
    new URL('../src/components/MetaInteractionScene.tsx', import.meta.url),
    'utf8',
  );
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const gripAsset = new URL('../public/assets/meta-hand-grip.png', import.meta.url);
  const restingHandsAsset = new URL('../public/assets/meta-resting-hands.png', import.meta.url);
  const tappingFingerAsset = new URL('../public/assets/meta-tapping-finger.png', import.meta.url);
  const restingHandsBytes = readFileSync(restingHandsAsset);
  const tappingFingerBytes = readFileSync(tappingFingerAsset);

  assert.equal(existsSync(gripAsset), true);
  assert.equal(existsSync(restingHandsAsset), true);
  assert.equal(existsSync(tappingFingerAsset), true);
  assert.equal(
    createHash('sha256').update(restingHandsBytes).digest('hex'),
    '140c856eb270ebc250b2a049666f5b66dea1767c562ea5b8c60e3c7464bfe3cf',
  );
  assert.equal(
    createHash('sha256').update(tappingFingerBytes).digest('hex'),
    '24c713bfd019da0cb679072a70179397923868d2a2ff67f048424dd6383edc7c',
  );
  assert.equal((sceneSource.match(/src="\/assets\/meta-hand-grip\.png"/g) ?? []).length, 2);
  assert.match(sceneSource, /id="meta-left-hand-asset"/);
  assert.match(sceneSource, /id="meta-right-hand-asset"/);
  assert.equal((sceneSource.match(/src="\/assets\/meta-resting-hands\.png"/g) ?? []).length, 2);
  assert.match(sceneSource, /id="meta-left-resting-hand"/);
  assert.match(sceneSource, /id="meta-right-resting-hand"/);
  assert.equal((sceneSource.match(/data-resting-hand-perspective="desk-plane"/g) ?? []).length, 2);
  assert.equal((sceneSource.match(/data-wrist-crop="below-scene-edge"/g) ?? []).length, 2);
  assert.match(sceneSource, /left-\[-3%\][\s\S]{0,700}data-hand-edge-offset="-3%"/);
  assert.match(sceneSource, /right-\[-3%\][\s\S]{0,700}data-hand-edge-offset="3%"/);
  assert.match(sceneSource, /clipPath: 'inset\(0 50% 0 0\)'/);
  assert.match(sceneSource, /clipPath: 'inset\(0 0 0 50%\)'/);
  assert.match(sceneSource, /opacity: deviceResting \? 0 : 1[\s\S]{0,900}id="meta-left-hand-asset"/);
  assert.match(sceneSource, /opacity: deviceResting \|\| interactionPending \|\| scrollGesture \? 0 : 1[\s\S]{0,900}id="meta-right-hand-asset"/);
  assert.match(sceneSource, /opacity: deviceResting \? 1 : 0[\s\S]{0,1000}id="meta-left-resting-hand"/);
  assert.match(sceneSource, /opacity: deviceResting && !interactionPending && !scrollGesture \? 1 : 0[\s\S]{0,1000}id="meta-right-resting-hand"/);
  assert.equal((sceneSource.match(/rotateX: deviceResting \? 4 : 18/g) ?? []).length, 2);
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
  assert.doesNotMatch(sceneSource, /id="meta-desk-surface"/);
  assert.doesNotMatch(sceneSource, /bg-\[#292119\]/);
  assert.match(sceneSource, /id="meta-phone-depth"/);
  assert.match(sceneSource, /id="meta-glass-reflection"/);
  assert.match(sceneSource, /data-camera-pitch-control=\{active \? \(deviceResting \? 'locked-table' : 'mouse-y'\) : 'inactive'\}/);
  assert.match(sceneSource, /rotateX: cameraPitchStyle/);
  assert.equal((sceneSource.match(/rotateX: cameraPitchStyle/g) ?? []).length, 5);
  assert.match(sceneSource, /onPointerMove=\{handlePointerMove\}/);
  assert.match(sceneSource, /onPointerLeave=\{handlePointerLeave\}/);
  assert.match(sceneSource, /data-hand-pose=\{interactionPending \? 'reaching' : 'holding'\}/);
  assert.match(sceneSource, /opacity: interactionPending && pointer\.x > 0 \? 1 : 0/);
  assert.match(sceneSource, /className="[^"]*z-\[8\][^"]*"[\s\S]{0,180}id="meta-tapping-hand-back"/);
  assert.match(sceneSource, /className="[^"]*z-\[60\][^"]*"[\s\S]{0,500}id="meta-pointer-hand"/);
  assert.equal((sceneSource.match(/src="\/assets\/meta-tapping-finger\.png"/g) ?? []).length, 2);
  assert.equal((sceneSource.match(/data-finger-orientation="upper-left"/g) ?? []).length, 2);
  assert.equal((sceneSource.match(/rotate: '-90deg'/g) ?? []).length, 2);
  assert.equal((sceneSource.match(/h-\[clamp\(441px,64\.5vh,630px\)\]/g) ?? []).length, 2);
  assert.doesNotMatch(sceneSource, /h-\[clamp\(294px,43vh,420px\)\]/);
  assert.match(sceneSource, /transformOrigin: '83% 13%'[\s\S]{0,600}id="meta-tapping-finger-asset"/);
  assert.match(sceneSource, /animate=\{\{ y: pressed \? 5 : 0, scale: pressed \? 0\.98 : 1 \}\}/);
  assert.match(sceneSource, /onWheelCapture=\{handleWheelCapture\}/);
  assert.match(sceneSource, /id="meta-scroll-finger"/);
  assert.match(sceneSource, /data-scroll-direction=\{scrollGesture\.travelY < 0 \? 'finger-up' : 'finger-down'\}/);
  assert.match(appSource, /setMetaViewActive\(true\);[\s\S]{0,180}setDebugTargetApp/);
  assert.match(appSource, /const metaSceneActive = shouldShowMetaScene\(metaViewActive, debugMode, progress\.phase\)/);
  assert.match(appSource, /immersiveIntro=\{!metaSceneActive\}/);
  assert.match(appSource, /metaSceneActive \? 'phone-stage bg-slate-950\/40' : 'bg-black'/);
  assert.match(appSource, /<MetaInteractionScene active=\{metaSceneActive\} chapter=\{metaSceneActive \? progress\.currentChapter : 0\}>/);
  assert.match(sceneSource, /<ChapterEnvironment chapter=\{chapter\} reducedMotion=\{reducedMotion\} layer="lighting" \/>/);
  assert.match(sceneSource, /<ChapterEnvironment chapter=\{chapter\} reducedMotion=\{reducedMotion\} layer="underlay" deviceResting=\{deviceResting\} \/>/);
  assert.match(sceneSource, /<ChapterEnvironment chapter=\{chapter\} reducedMotion=\{reducedMotion\} layer="objects" deviceResting=\{deviceResting\} \/>/);
  assert.match(sceneSource, /#meta-terminal-dialogue \{ background-color: rgb\(13 19 27 \/ 0\.52\)/);
  assert.match(sceneSource, /data-environment-chapter=\{chapter\}/);
  assert.match(sceneSource, /scale: 0\.92/);
  assert.match(sceneSource, /className=\{`\$\{active \? 'phone-stage' : ''\} absolute inset-0/);
  assert.match(sceneSource, /id="meta-protagonist-name"/);
  assert.doesNotMatch(sceneSource, /stroke="#8a543e"/);
  assert.doesNotMatch(sceneSource, /stroke="#89513b"/);
  assert.doesNotMatch(sceneSource, /rounded-\[52%_44%_48%_40%\]/);
});

test('chapter 0 is a bare fullscreen game while the unlocked view restores physical phone chrome', () => {
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.match(phoneSource, /data-presentation=\{immersiveIntro \? 'chapter-0-fullscreen' : 'physical-phone'\}/);
  assert.match(phoneSource, /!immersiveIntro && <div[^>]+id="phone-status-bar"/);
  assert.match(phoneSource, /!immersiveIntro && <div[^>]+id="phone-footer"/);
  assert.match(appSource, /const restartLoop = \(\) => \{[\s\S]{0,180}setProgress\(INITIAL_PROGRESS\);[\s\S]{0,100}setMetaViewActive\(false\);/);
});
