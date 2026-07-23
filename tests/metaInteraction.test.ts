import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  applyVirtualKey,
  canStartMetaInteraction,
  getMetaDevicePostureAction,
  getMetaCameraPitch,
  getMetaIdleDeskView,
  getProjectiveTransformMatrix,
  getScrollFingerTravel,
  isPointInsideProjectiveQuad,
  META_CAMERA_PITCH,
  META_IDLE_DESK_VIEW,
  META_TAP_TIMING,
  normalizeVirtualKey,
  scaleProjectiveQuad,
  shouldPersistDeveloperMetaView,
  shouldRevealMetaView,
  shouldShowMetaScene,
} from '../src/lib/metaInteraction';

test('meta camera reveal requires the first Gate 40 death and a selected suspicious run', () => {
  assert.equal(shouldRevealMetaView(0, true), false);
  assert.equal(shouldRevealMetaView(1, false), false);
  assert.equal(shouldRevealMetaView(1, true), true);
  assert.equal(shouldRevealMetaView(2, true), true);

  const flappySource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const leaderboardSource = readFileSync(new URL('../src/components/LeaderboardPanel.tsx', import.meta.url), 'utf8');
  const openLeaderboardBody = flappySource.match(/const openLeaderboard = \(\) => \{([\s\S]*?)\n  \};/)?.[1] ?? '';

  assert.doesNotMatch(openLeaderboardBody, /onSuspiciousRunSelected/);
  assert.match(flappySource, /suspiciousRunsEnabled=\{progress\.deathsAt40 >= 1\}/);
  // The title intro is the animated logo; it hands off to Chapter 1 when its
  // sequence completes, rather than on a fixed timer.
  assert.match(leaderboardSource, /<GameLogoIntro[\s\S]{0,60}onComplete=\{onSuspiciousRunSelected\}/);
});

test('developer chapter tools preview the meta scene without changing the story unlock rule', () => {
  assert.equal(shouldShowMetaScene(false, false, 'intro_game'), false);
  assert.equal(shouldShowMetaScene(false, true, 'intro_game'), true);
  assert.equal(shouldShowMetaScene(true, false, 'intro_game'), true);
  assert.equal(shouldShowMetaScene(true, true, 'intro_game'), true);
});

test('an open Chapter 1+ developer view persists Meta after the panel closes', () => {
  assert.equal(shouldPersistDeveloperMetaView(true, 1), true);
  assert.equal(shouldPersistDeveloperMetaView(true, 10), true);
  assert.equal(shouldPersistDeveloperMetaView(false, 1), false);
  assert.equal(shouldPersistDeveloperMetaView(true, 0), false);

  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(
    appSource,
    /shouldPersistDeveloperMetaView\(debugMode, progress\.currentChapter\)[\s\S]{0,100}setMetaViewActive\(true\)/,
  );
});

test('Chapter 1 and every later restored-phone phase keep the Meta scene active', () => {
  assert.equal(shouldShowMetaScene(false, false, 'os_unlocked'), true);
  assert.equal(shouldShowMetaScene(false, false, 'passed_40'), true);
  assert.equal(shouldShowMetaScene(false, false, 'credits'), true);
  assert.equal(shouldShowMetaScene(false, false, 'ending_choice'), true);
});

test('Chapter 10 hides Meta only for the player flight and restores it at Gate 40 takeover', () => {
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const flappySource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');

  assert.match(appSource, /const \[chapterTenPlayerFullscreen, setChapterTenPlayerFullscreen\] = useState\(false\)/);
  assert.match(appSource, /const metaSceneActive = !chapterTenPlayerFullscreen[\s\S]*?shouldShowMetaScene/);
  assert.match(phoneSource, /progress\.currentChapter === 10 && app === 'flappy'[\s\S]*?onChapterTenPlayerFlightStart\(\)/);
  assert.match(flappySource, /state\.chapterTenTakeoverPaused = true;[\s\S]*?onChapterTenTakeover\(\);[\s\S]*?speak\(\['My turn\.'\], resumeChapterTenTakeover\)/);
  assert.match(flappySource, /const resumeChapterTenTakeover[\s\S]*?beginAutonomousControlRef\.current\('flappy-canvas'\)/);
});

test('the Chapter 10 fullscreen player flight keeps only a translucent bottom thought', () => {
  const source = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /id="chapter-ten-fullscreen-dialogue"/);
  assert.match(source, /data-dialogue-mode="silent-pre-takeover"/);
  assert.match(source, /absolute inset-x-0 bottom-0/);
  assert.match(source, /bg-\[#080b10\]\/55/);
  assert.match(source, />ARCANE</);
  assert.match(source, />\.\.\.</);
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

test('the visible phone trapezoid is the only upright no-rest collision area', () => {
  const phoneQuad = [
    { x: 120, y: 75 },
    { x: 1080, y: 75 },
    { x: 1140, y: 625 },
    { x: 85, y: 625 },
  ] as const;

  assert.equal(isPointInsideProjectiveQuad({ x: 600, y: 350 }, phoneQuad), true);
  assert.equal(isPointInsideProjectiveQuad({ x: 120, y: 75 }, phoneQuad), true);
  assert.equal(isPointInsideProjectiveQuad({ x: 95, y: 100 }, phoneQuad), false);
  assert.equal(isPointInsideProjectiveQuad({ x: 1160, y: 500 }, phoneQuad), false);
  assert.equal(isPointInsideProjectiveQuad({ x: 600, y: 650 }, phoneQuad), false);

  assert.equal(getMetaDevicePostureAction(true, false, true, false), null);
  assert.equal(getMetaDevicePostureAction(true, false, false, false), 'rest');
  assert.equal(getMetaDevicePostureAction(true, false, false, true), null);
  assert.equal(getMetaDevicePostureAction(true, false, true, true), 'wake');
  assert.equal(getMetaDevicePostureAction(true, true, false, false), null);
  assert.equal(getMetaDevicePostureAction(false, false, false, false), null);
});

test('mouse height maps the resting desk from fireplace reveal to raised foreground', () => {
  assert.equal(META_IDLE_DESK_VIEW.bottom, 2 / 3);
  assert.equal(getMetaIdleDeskView(0, 1000), META_IDLE_DESK_VIEW.top);
  assert.equal(getMetaIdleDeskView(500, 1000), META_IDLE_DESK_VIEW.rest);
  assert.equal(getMetaIdleDeskView(1000, 1000), META_IDLE_DESK_VIEW.bottom);
  assert.equal(getMetaIdleDeskView(-200, 1000), META_IDLE_DESK_VIEW.top);
  assert.equal(getMetaIdleDeskView(1200, 1000), META_IDLE_DESK_VIEW.bottom);
  assert.equal(getMetaIdleDeskView(20, 0), META_IDLE_DESK_VIEW.rest);
});

test('rest posture lays down the phone and swaps the grip for desk-plane hands', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.match(scene, /getBoxQuads\?\./);
  assert.match(scene, /const topInset = rect\.width \* 0\.035/);
  assert.match(scene, /isPointInsideProjectiveQuad\([\s\S]{0,120}event\.clientX[\s\S]{0,80}getPhoneCollisionQuad\(phone\)/);
  assert.match(scene, /getMetaDevicePostureAction\([\s\S]{0,180}targetInsidePhone[\s\S]{0,80}deviceResting/);
  assert.doesNotMatch(scene, /data-meta-rest-surface|targetOnRestSurface/);
  assert.match(scene, /if \(!targetInsidePhone\) \{[\s\S]{0,120}event\.preventDefault\(\)/);
  assert.match(scene, /data-device-posture=\{deviceResting \? 'table-rest' : 'upright'\}/);
  assert.match(scene, /!cameraPitchEnabled \? 'disabled' : deviceResting \? 'idle-mouse-y' : 'mouse-y'/);
  assert.match(scene, /data-posture-control=\{postureControlEnabled \? 'enabled' : 'disabled'\}/);
  assert.match(scene, /cameraPitchTarget\.set\(META_CAMERA_PITCH\.restDeg\)/);
  assert.match(scene, /deviceResting \? \{ scale: 1, y: '0%' \} : \{ scale: 0\.92, y: '-13%' \}/);
  assert.match(scene, /const DESK_PHONE_SCALE = 0\.4/);
  assert.match(scene, /const DESK_PHONE_VERTICAL_OFFSET = -0\.1/);
  assert.match(scene, /scaleProjectiveQuad\(tableQuad, DESK_PHONE_SCALE\)/);
  assert.match(scene, /formatProjectiveMatrix3d\(getProjectiveTransformMatrix\(source, target\)\)/);
  assert.match(scene, /id="meta-device-projective-plane"/);
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
  assert.match(scene, /data-desk-perspective=\{deviceResting \? 'mouse-depth-trapezoid' : 'raised-front-edge'\}/);
  assert.match(scene, /idleDeskTableScaleY = useTransform\(idleDeskView, \[0, 0\.5, 1\], \[0\.68, 1, 1\.35\]\)/);
  assert.match(scene, /idleDeskTableY = useTransform\(idleDeskView, \[0, 0\.5, 1\], \['10%', '0%', '-9%'\]\)/);
  assert.equal((scene.match(/restingView=\{idleDeskView\}/g) ?? []).length, 2);
  assert.match(scene, /id="meta-resting-hands-perspective"/);
  assert.match(scene, /data-resting-hand-camera=\{deviceResting \? 'shared-mouse-depth' : 'inactive'\}/);
  assert.equal((scene.match(/data-resting-hand-perspective="desk-plane"/g) ?? []).length, 2);
  assert.equal((scene.match(/data-wrist-crop="below-scene-edge"/g) ?? []).length, 2);
  assert.match(scene, /id="meta-device-contact-shadow"/);
});

test('desk projection maps the phone to a homothetic quad with parallel corresponding edges', () => {
  const desk = [
    { x: 115, y: 136 },
    { x: 592, y: 136 },
    { x: 678, y: 229 },
    { x: 28, y: 229 },
  ] as const;
  const phone = scaleProjectiveQuad(desk, 0.4).map((point) => ({
    x: point.x,
    y: point.y - 50,
  })) as unknown as typeof desk;
  const source = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 50 },
    { x: 0, y: 50 },
  ] as const;
  const matrix = getProjectiveTransformMatrix(source, phone);
  const project = ({ x, y }: { x: number; y: number }) => {
    const w = matrix[3] * x + matrix[7] * y + matrix[15];
    return {
      x: (matrix[0] * x + matrix[4] * y + matrix[12]) / w,
      y: (matrix[1] * x + matrix[5] * y + matrix[13]) / w,
    };
  };

  source.forEach((point, index) => {
    const mapped = project(point);
    assert.ok(Math.abs(mapped.x - phone[index].x) < 1e-6);
    assert.ok(Math.abs(mapped.y - phone[index].y) < 1e-6);
  });
  for (let index = 0; index < 4; index += 1) {
    const next = (index + 1) % 4;
    const deskEdge = { x: desk[next].x - desk[index].x, y: desk[next].y - desk[index].y };
    const phoneEdge = { x: phone[next].x - phone[index].x, y: phone[next].y - phone[index].y };
    assert.ok(Math.abs(deskEdge.x * phoneEdge.y - deskEdge.y * phoneEdge.x) < 1e-6);
  }
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

test('home-screen launchers open on pointer release without waiting for the hand click relay', () => {
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  assert.match(
    phoneSource,
    /id="home-apps-grid"\s+data-meta-immediate="true"/,
  );
  assert.match(phoneSource, /id="launcher-viewtube"/);
  assert.match(phoneSource, /onPointerUp=\{\(event\) => handleLauncherPointerUp\(event, 'viewtube'\)\}/);
  assert.match(phoneSource, /if \(event\.detail !== 0\) return;/);
  assert.equal((phoneSource.match(/onPointerUp=\{\(event\) => handleLauncherPointerUp/g) ?? []).length, 8);
});

test('home navigation completes before the Chapter 1 entry transition starts', () => {
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  assert.match(
    phoneSource,
    /onClick=\{handleHomeButton\}\s+data-meta-immediate="true"[\s\S]{0,180}id="home-swipe-indicator"/,
  );
});

test('Chapter 1 commits app navigation before updating Meta dialogue', () => {
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const launchStart = phoneSource.indexOf('const handleLaunchApp =');
  const navigation = phoneSource.indexOf('setActiveApp(app)', launchStart);
  const deferredDialogue = phoneSource.indexOf('chapterOneDialogueTimer.current = setTimeout', launchStart);

  assert.ok(launchStart >= 0 && navigation > launchStart && deferredDialogue > navigation);
  assert.match(styles, /#meta-terminal-dialogue\s*\{\s*pointer-events: none;/);
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
  assert.match(sceneSource, /data-camera-pitch-control=\{active \? \(!cameraPitchEnabled \? 'disabled' : deviceResting \? 'idle-mouse-y' : 'mouse-y'\) : 'inactive'\}/);
  assert.match(sceneSource, /rotateX: cameraPitchStyle/);
  assert.equal((sceneSource.match(/rotateX: cameraPitchStyle/g) ?? []).length, 5);
  assert.match(sceneSource, /onPointerMove=\{handlePointerMove\}/);
  assert.match(sceneSource, /onPointerLeave=\{handlePointerLeave\}/);
  assert.match(sceneSource, /data-autonomous-hand=\{autonomousTapping \? 'locked' : 'player-led'\}/);
  assert.match(sceneSource, /data-hand-pose=\{autonomousTapping \? 'agitated-tapping' : interactionPending \? 'reaching' : 'holding'\}/);
  assert.match(sceneSource, /const tapSequence = useCallback/);
  assert.match(sceneSource, /const beatMs = 230/);
  assert.match(sceneSource, /autonomousTappingRef\.current = true/);
  assert.match(sceneSource, /setPressed\(true\)[\s\S]{0,120}meta\.fingerContact/);
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
  assert.match(
    appSource,
    /const metaSceneActive = !chapterTenPlayerFullscreen[\s\S]*?&& !fullscreenOnly[\s\S]*?&& shouldShowMetaScene\(metaViewActive, debugMode, progress\.phase\)/,
  );
  assert.match(appSource, /immersiveIntro=\{!metaSceneActive\}/);
  assert.match(appSource, /metaSceneActive \? 'bg-slate-950\/40' : 'bg-black'/);
  assert.match(appSource, /<MetaInteractionScene[\s\S]{0,220}active=\{metaSceneActive\}[\s\S]{0,220}chapter=\{metaSceneActive \? progress\.currentChapter : 0\}/);
  assert.match(sceneSource, /<ChapterEnvironment chapter=\{chapter\} reducedMotion=\{reducedMotion\} layer="lighting" \/>/);
  assert.match(sceneSource, /<ChapterEnvironment chapter=\{chapter\} reducedMotion=\{reducedMotion\} layer="underlay" deviceResting=\{deviceResting\} restingView=\{idleDeskView\} \/>/);
  assert.match(sceneSource, /<ChapterEnvironment chapter=\{chapter\} reducedMotion=\{reducedMotion\} layer="objects" deviceResting=\{deviceResting\} restingView=\{idleDeskView\} \/>/);
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
