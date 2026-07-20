import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  ARC_RUN_GATE_40_BARRAGE_MS,
  ARC_RUN_REPLAY_DURATION_MS,
  getArcRunReplayFrame,
} from '../src/lib/arcRunReplay';

test('the archived run compresses the journey to Gate 40 into under fifteen seconds', () => {
  assert.ok(ARC_RUN_REPLAY_DURATION_MS >= 12_000);
  assert.ok(ARC_RUN_REPLAY_DURATION_MS <= 15_000);
  assert.equal(getArcRunReplayFrame(0).score, 0);
  assert.ok(getArcRunReplayFrame(7_400).score >= 36);
  assert.equal(getArcRunReplayFrame(10_500).score, 40);
  assert.equal(getArcRunReplayFrame(11_100).score, 41);
  assert.equal(getArcRunReplayFrame(13_000).score, 42);
});

test('the comment barrage waits until the Gate 40 crossing', () => {
  assert.equal(getArcRunReplayFrame(ARC_RUN_GATE_40_BARRAGE_MS - 1).barrageActive, false);
  const crossing = getArcRunReplayFrame(ARC_RUN_GATE_40_BARRAGE_MS);
  assert.equal(crossing.score, 40);
  assert.equal(crossing.barrageActive, true);
  assert.equal(getArcRunReplayFrame(11_100).barrageActive, true);
});

test('the replay visibly dives from Gate 39 into the impossible Gate 40 route', () => {
  const highRoute = getArcRunReplayFrame(10_200);
  const pipeContact = getArcRunReplayFrame(10_900);
  const escaped = getArcRunReplayFrame(11_300);

  assert.ok(highRoute.birdY < 90);
  assert.ok(pipeContact.birdY > 190 && pipeContact.birdY < 240);
  assert.ok(escaped.birdY > 275);
  assert.ok(pipeContact.pipes.some((pipe) => pipe.index === 40));
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
  assert.doesNotMatch(viewTube, /COLLISION_BYPASS_DETECTION/);
  assert.doesNotMatch(viewTube, /Math\.random/);
  assert.doesNotMatch(barrageMarkup, /bg-/);
  assert.match(replay, /const CAPTURE_FPS = 15/);
  assert.match(replay, /id="arc-run-replay-canvas"/);
});
