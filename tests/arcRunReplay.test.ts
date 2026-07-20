import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  ARC_RUN_GATE_40_BARRAGE_MS,
  ARC_RUN_REPLAY_DURATION_MS,
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

test('ViewTube uses the real replay canvas and unmasked Gate 40 text', () => {
  const viewTube = readFileSync(new URL('../src/components/ViewTube.tsx', import.meta.url), 'utf8');
  const replay = readFileSync(new URL('../src/components/ArcRunReplay.tsx', import.meta.url), 'utf8');
  const barrageStart = viewTube.indexOf('id="vt-gate40-danmaku-barrage"');
  const barrageEnd = viewTube.indexOf('{/* Controls Overlay */}', barrageStart);
  const barrageMarkup = viewTube.slice(barrageStart, barrageEnd);

  assert.match(viewTube, /<ArcRunReplay/);
  assert.match(viewTube, /id="vt-gate40-danmaku-barrage"/);
  assert.match(viewTube, /id="vt-ambient-danmaku"/);
  assert.match(viewTube, /metaInteraction\.tapElement\('arc-run-replay-canvas'/);
  assert.doesNotMatch(viewTube, /if \(replayPaused\) setReplayPaused\(false\)/);
  assert.match(viewTube, /END OF EXAMINED CLIP/);
  assert.doesNotMatch(viewTube, /COLLISION_BYPASS_DETECTION/);
  assert.doesNotMatch(viewTube, /Math\.random/);
  assert.doesNotMatch(barrageMarkup, /bg-/);
  assert.match(replay, /const CAPTURE_FPS = 15/);
  assert.match(replay, /id="arc-run-replay-canvas"/);
});
