import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  ARC_RUN_EXIT_UNLOCK_MS,
  ARC_RUN_GATE_40_BARRAGE_MS,
  ARC_RUN_REPLAY_DURATION_MS,
  canExitArcRunFullscreen,
  getArcRunTimelineProgress,
  getArcRunReplayFrame,
} from '../src/lib/arcRunReplay';

test('the archived excerpt runs at half speed and ends at the score 42 evidence beat', () => {
  assert.equal(ARC_RUN_REPLAY_DURATION_MS, 21_500);
  assert.equal(getArcRunReplayFrame(0).score, 0);
  assert.ok(getArcRunReplayFrame(15_000).score >= 36);
  assert.equal(getArcRunReplayFrame(17_850).score, 38);
  assert.equal(getArcRunReplayFrame(18_500).score, 40);
  assert.equal(getArcRunReplayFrame(20_050).score, 42);
  assert.equal(getArcRunReplayFrame(21_000).score, 42);
});

test('the comment barrage waits until the Gate 40 crossing', () => {
  assert.equal(getArcRunReplayFrame(ARC_RUN_GATE_40_BARRAGE_MS - 1).barrageActive, false);
  const crossing = getArcRunReplayFrame(ARC_RUN_GATE_40_BARRAGE_MS);
  assert.equal(crossing.score, 40);
  assert.equal(crossing.barrageActive, true);
  assert.equal(getArcRunReplayFrame(20_200).barrageActive, true);
});

test('fullscreen exit unlocks at the Gate 40 to Gate 41 transition near one third of the timeline', () => {
  assert.equal(getArcRunReplayFrame(ARC_RUN_EXIT_UNLOCK_MS - 1).score, 40);
  assert.equal(getArcRunReplayFrame(ARC_RUN_EXIT_UNLOCK_MS).score, 42);
  assert.equal(canExitArcRunFullscreen(ARC_RUN_EXIT_UNLOCK_MS - 1), false);
  assert.equal(canExitArcRunFullscreen(ARC_RUN_EXIT_UNLOCK_MS), true);
  assert.equal(getArcRunTimelineProgress(ARC_RUN_EXIT_UNLOCK_MS), 1 / 3.2);
});

test('the replay visibly dives from Gate 39 into the impossible Gate 40 route', () => {
  const highRoute = getArcRunReplayFrame(17_400);
  const pipeContact = getArcRunReplayFrame(18_300);
  const escaped = getArcRunReplayFrame(19_000);

  assert.ok(highRoute.birdY < 90);
  assert.ok(pipeContact.birdY > 190 && pipeContact.birdY < 240);
  assert.ok(escaped.birdY > 275);
  assert.ok(pipeContact.pipes.some((pipe) => pipe.index === 20));
});

test('pipes keep the same position and height while crossing the bird', () => {
  const crossingMs = (8 / 39) * 15_600;
  const before = getArcRunReplayFrame(crossingMs - 1).pipes.find((pipe) => pipe.index === 7);
  const after = getArcRunReplayFrame(crossingMs + 1).pipes.find((pipe) => pipe.index === 7);

  assert.ok(before && after);
  assert.ok(Math.abs(before.x - after.x) < 3);
  assert.equal(before.topHeight, after.topHeight);
  assert.equal(before.bottomHeight, after.bottomHeight);
});

test('the replay loops deterministically', () => {
  assert.deepEqual(
    getArcRunReplayFrame(2_750),
    getArcRunReplayFrame(ARC_RUN_REPLAY_DURATION_MS + 2_750),
  );
});

test('ViewTube plays the replay inline with an optional fullscreen expand', () => {
  const viewTube = readFileSync(new URL('../src/components/ViewTube.tsx', import.meta.url), 'utf8');
  const replay = readFileSync(new URL('../src/components/ArcRunReplay.tsx', import.meta.url), 'utf8');
  const startVideoStart = viewTube.indexOf('const startVideo = () =>');
  const startVideoEnd = viewTube.indexOf('const revealReplayControls', startVideoStart);
  const startVideoSource = viewTube.slice(startVideoStart, startVideoEnd);
  const barrageStart = viewTube.indexOf('id="vt-gate40-danmaku-barrage"');
  const barrageEnd = viewTube.indexOf('{replayPaused && (', barrageStart);
  const barrageMarkup = viewTube.slice(barrageStart, barrageEnd);
  const closeStart = viewTube.indexOf('const closeReplayFullscreen');
  const closeEnd = viewTube.indexOf('useEffect(() => {', closeStart);
  const closeSource = viewTube.slice(closeStart, closeEnd);

  assert.match(viewTube, /<ArcRunReplay/);
  assert.match(viewTube, /id="vt-gate40-danmaku-barrage"/);
  assert.match(viewTube, /id="vt-ambient-danmaku"/);
  assert.match(viewTube, /getElementById\('phone-bezel'\)/);
  assert.match(viewTube, /createPortal\(renderReplayPlayer\(true\), phoneSurface\)/);
  assert.doesNotMatch(viewTube, /createPortal\(renderReplayPlayer\(true\), document\.body\)/);
  assert.doesNotMatch(viewTube, /fixed inset-0|h-screen w-screen|document\.body\.style\.overflow/);
  assert.match(viewTube, /absolute inset-0 z-\[80\] h-full w-full/);
  assert.match(viewTube, /data-fullscreen-lock=/);
  assert.match(viewTube, /id="vt-fullscreen-exit"/);
  // The replay plays inline by default; fullscreen is an optional expand reached
  // from the inline controls, and its exit is always available (no lock).
  assert.match(viewTube, /id="vt-fullscreen-enter"/);
  assert.doesNotMatch(startVideoSource, /setReplayFullscreenOpen\(true\)/);
  assert.doesNotMatch(viewTube, /disabled=\{!replayExitUnlocked\}/);
  assert.doesNotMatch(closeSource, /replayExitUnlockedRef/);
  assert.doesNotMatch(closeSource, /scrollIntoView/);
  assert.match(closeSource, /setReplayFullscreenOpen\(false\)/);
  assert.match(viewTube, /onMouseMove=\{revealReplayControls\}/);
  assert.match(viewTube, /id="vt-replay-timeline-progress"/);
  assert.match(viewTube, /bg-\[#ff1f1f\]/);
  assert.match(viewTube, /onPausePoint=\{unlockReplayExit\}/);
  assert.match(viewTube, /key=\{replayCycle\}/);
  assert.match(viewTube, /if \(replayPaused && replayExitUnlocked\)[\s\S]{0,100}replayFromStart\(\)/);
  assert.match(viewTube, /setReplayElapsedMs\(0\)[\s\S]{0,160}setReplayCycle\(\(cycle\) => cycle \+ 1\)/);
  assert.match(viewTube, /kind === 'legacy-passage'[\s\S]{0,120}!progress\.watchedVideo && !replayExitUnlocked/);
  assert.doesNotMatch(startVideoSource, /watchedVideo/);
  assert.doesNotMatch(viewTube, /COLLISION_BYPASS_DETECTION/);
  assert.doesNotMatch(viewTube, /Math\.random/);
  assert.doesNotMatch(barrageMarkup, /bg-/);
  assert.match(replay, /const CAPTURE_FPS = 15/);
  assert.match(replay, /id="arc-run-replay-canvas"/);
  assert.match(replay, /onProgress: \(elapsedMs: number\) => void/);
});
