import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  ARC_RUN_GATE_40_BARRAGE_MS,
  ARC_RUN_REPLAY_DURATION_MS,
  getArcRunReplayFrame,
} from '../src/lib/arcRunReplay';

test('the archived run reaches Gate 40 quickly but contains the full score 184 run', () => {
  assert.equal(ARC_RUN_REPLAY_DURATION_MS, 24_000);
  assert.equal(getArcRunReplayFrame(0).score, 0);
  assert.ok(getArcRunReplayFrame(7_400).score >= 36);
  assert.equal(getArcRunReplayFrame(9_000).score, 40);
  assert.equal(getArcRunReplayFrame(9_300).score, 41);
  assert.equal(getArcRunReplayFrame(10_100).score, 42);
  assert.equal(getArcRunReplayFrame(23_000).score, 184);
});

test('the comment barrage waits until the Gate 40 crossing', () => {
  assert.equal(getArcRunReplayFrame(ARC_RUN_GATE_40_BARRAGE_MS - 1).barrageActive, false);
  const crossing = getArcRunReplayFrame(ARC_RUN_GATE_40_BARRAGE_MS);
  assert.equal(crossing.score, 41);
  assert.equal(crossing.barrageActive, true);
  assert.equal(getArcRunReplayFrame(10_100).barrageActive, true);
  assert.equal(getArcRunReplayFrame(11_500).barrageActive, false);
});

test('the replay visibly dives from Gate 39 into the impossible Gate 40 route', () => {
  const highRoute = getArcRunReplayFrame(8_800);
  const pipeContact = getArcRunReplayFrame(9_200);
  const escaped = getArcRunReplayFrame(9_500);

  assert.ok(highRoute.birdY < 90);
  assert.ok(pipeContact.birdY > 190 && pipeContact.birdY < 240);
  assert.ok(escaped.birdY > 275);
  assert.ok(pipeContact.pipes.some((pipe) => pipe.index === 40));
});

test('pipes keep the same position and height while crossing the bird', () => {
  const crossingMs = (8 / 39) * 7_800;
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
  assert.doesNotMatch(viewTube, /COLLISION_BYPASS_DETECTION/);
  assert.doesNotMatch(viewTube, /Math\.random/);
  assert.doesNotMatch(barrageMarkup, /bg-/);
  assert.match(replay, /const CAPTURE_FPS = 15/);
  assert.match(replay, /id="arc-run-replay-canvas"/);
});
