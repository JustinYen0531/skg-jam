import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  PERFORMANCE_CONFIG,
  PERFORMANCE_PIPE_SPACING_FRAMES,
  PERFORMANCE_SPEED_MULTIPLIER,
  buildPerformanceRoute,
  computePerformance,
  computePerformancePlan,
  performanceFlipFrames,
  performanceScoreAtFrame,
  phaseAtFrame,
  verifyPerformance,
  type PerformanceObstacle,
} from '../src/lib/chapterTenPerformance';
import { CHAPTER_TEN_NODES } from '../src/lib/chapterTenFlight';
import { EASY_FLAPPY_SETTINGS } from '../src/lib/flappyPhysics';

const plan = computePerformancePlan();

test('the authored click pattern clears the whole hard route without ever being hit', () => {
  assert.equal(plan.verification.clears, true);
  assert.equal(plan.verification.reachedEnd, true);
  assert.equal(plan.verification.firstHitFrame, null);
  // A genuine but always-cleared margin: hard-looking, never a stuck run.
  assert.ok(plan.verification.minClearance > 4, `min clearance ${plan.verification.minClearance}`);
  assert.ok(plan.verification.minClearance < 40, 'still tight enough to be a real gauntlet');
});

test('the performance is fully deterministic (pattern and route)', () => {
  const again = computePerformancePlan();
  assert.deepEqual(again.inputs, plan.inputs);
  assert.deepEqual(again.obstacles, plan.obstacles);
  assert.deepEqual(again.verification, plan.verification);
});

test('the route contains every Geometry-Dash-flavoured hazard the design calls for', () => {
  const kinds = new Set(plan.obstacles.map((o) => o.kind));
  assert.ok(kinds.has('pipe'), 'moving/spiked pipes');
  assert.ok(kinds.has('floating-spike'), 'floating spikes between pipes');
  assert.ok(kinds.has('ambush'), 'lunging ambushes');
  assert.ok(kinds.has('portal'), 'gravity portals');
  assert.ok(plan.inputs.taps.length > 20, 'a real tap rhythm');
  assert.ok(plan.inputs.flips.length >= 4, 'multiple gravity flips');
  // Some pipes move and some are spiked.
  const pipes = plan.obstacles.filter((o): o is Extract<PerformanceObstacle, { kind: 'pipe' }> => o.kind === 'pipe');
  assert.ok(pipes.some((p) => p.moveAmplitude > 0), 'moving pipes exist');
  assert.ok(pipes.some((p) => p.spiked), 'spiked pipes exist');
});

test('gravity portals sit exactly on the gravity-flip frames', () => {
  const flips = performanceFlipFrames(PERFORMANCE_CONFIG);
  const portalFrames = plan.obstacles.filter((o) => o.kind === 'portal').map((o) => o.atFrame).sort((a, b) => a - b);
  assert.deepEqual(portalFrames, [...flips].sort((a, b) => a - b));
  assert.deepEqual(plan.inputs.flips, [...flips].sort((a, b) => a - b));
});

test('while inverted, the choreography actually flies Arcane against normal gravity', () => {
  // After the first flip there is a stretch where his gravity sign is -1.
  const invertedSamples = plan.samples.filter((s) => s.gravitySign === -1);
  assert.ok(invertedSamples.length > 40, 'a real inverted section exists');
  // He both taps and moves within bounds while inverted (a spin section).
  assert.ok(invertedSamples.some((s) => s.tapped));
});

test('Arcane never leaves the playfield; edges are ridden, not fatal', () => {
  const r = PERFORMANCE_CONFIG.birdRadius;
  const H = PERFORMANCE_CONFIG.canvasHeight;
  for (const s of plan.samples) {
    assert.ok(s.y >= r - 1e-6 && s.y <= H - r + 1e-6, `y ${s.y} in bounds`);
  }
  // He does ride an edge at least once (a spin/extreme beat).
  assert.ok(plan.samples.some((s) => s.y <= r + 0.5 || s.y >= H - r - 0.5));
});

test('the run threads all seven phases and maps its beats onto the score nodes', () => {
  const phases = new Set(plan.samples.filter((_, i) => i % 20 === 0).map((s) => phaseAtFrame(s.frame, PERFORMANCE_CONFIG)));
  assert.equal(phases.size, 7);

  assert.equal(performanceScoreAtFrame(0, PERFORMANCE_CONFIG), CHAPTER_TEN_NODES.takeover);
  assert.equal(performanceScoreAtFrame(PERFORMANCE_CONFIG.frames, PERFORMANCE_CONFIG), CHAPTER_TEN_NODES.terminal);
  // Monotonic non-decreasing score.
  let prev = -1;
  for (let f = 0; f <= PERFORMANCE_CONFIG.frames; f += 30) {
    const s = performanceScoreAtFrame(f, PERFORMANCE_CONFIG);
    assert.ok(s >= prev);
    prev = s;
  }
  // The "record-climb" memory beat lands around the 184 record.
  const climbFrames = plan.samples.filter((s) => phaseAtFrame(s.frame, PERFORMANCE_CONFIG) === 'record-climb');
  const scores = climbFrames.map((s) => performanceScoreAtFrame(s.frame, PERFORMANCE_CONFIG));
  assert.ok(Math.min(...scores) <= 184 && Math.max(...scores) >= 184, 'record-climb spans score 184');
});

test('the performance pipe cadence stays at or below 1.2x the player flight', () => {
  const normalPipeDistance =
    EASY_FLAPPY_SETTINGS.pipeSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
  const performedPipeDistance =
    PERFORMANCE_CONFIG.worldSpeed * PERFORMANCE_PIPE_SPACING_FRAMES;
  const passageRate =
    EASY_FLAPPY_SETTINGS.spawnIntervalFrames / PERFORMANCE_PIPE_SPACING_FRAMES;
  const frameAt184 = Array.from(
    { length: PERFORMANCE_CONFIG.frames + 1 },
    (_, frame) => frame,
  ).find((frame) => performanceScoreAtFrame(frame, PERFORMANCE_CONFIG) >= 184);
  const normalFramesTo184 =
    ((184 - CHAPTER_TEN_NODES.takeover) / 2) * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;

  assert.equal(PERFORMANCE_SPEED_MULTIPLIER, 1.2);
  assert.equal(PERFORMANCE_CONFIG.worldSpeed, EASY_FLAPPY_SETTINGS.pipeSpeed * 1.2);
  assert.ok(performedPipeDistance >= normalPipeDistance);
  assert.ok(passageRate <= 1.2);
  assert.ok(passageRate >= 1.15);
  assert.ok(frameAt184 !== undefined);
  assert.ok(normalFramesTo184 / (frameAt184 as number) <= 1.2);
});

test('rebuilding the route around the trajectory is what guarantees a clear run', () => {
  const { inputs, samples } = computePerformance();
  const obstacles = buildPerformanceRoute(samples);
  const verification = verifyPerformance(samples, obstacles, inputs);
  assert.equal(verification.clears, true);
  // If the route were built around a *different* trajectory, the real pattern
  // would generally be hit — proving the clear run depends on the paired design.
  const shifted = samples.map((s) => ({ ...s, y: Math.min(PERFORMANCE_CONFIG.canvasHeight - 12, s.y + 60) }));
  const mismatched = buildPerformanceRoute(shifted);
  const badVerification = verifyPerformance(samples, mismatched, inputs);
  assert.equal(badVerification.clears, false);
});

test('the performance choreography uses no nondeterministic randomness', () => {
  const source = readFileSync(new URL('../src/lib/chapterTenPerformance.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Math\.random/);
});

test('the score-42 performance layer keeps the restored arcade palette', () => {
  const source = readFileSync(new URL('../src/components/chapterTenPerformanceCanvas.ts', import.meta.url), 'utf8');
  assert.match(source, /PIPE_BODY = '#58b947'/);
  assert.match(source, /PIPE_EDGE = '#2d6f32'/);
  assert.match(source, /2013 mobile game/);
  assert.doesNotMatch(source, /#3f6d63|#8fd0bf|CRT|terminal HUD|JetBrains Mono/);
});

test('pipe lip spikes point out of the pipe bodies and into the flight gap', () => {
  const source = readFileSync(new URL('../src/components/chapterTenPerformanceCanvas.ts', import.meta.url), 'utf8');
  assert.match(source, /PIPE_TOP_GAP_SPIKE_HEIGHT = -8/);
  assert.match(source, /PIPE_BOTTOM_GAP_SPIKE_HEIGHT = 8/);
  assert.match(source, /top, 5, PIPE_TOP_GAP_SPIKE_HEIGHT/);
  assert.match(source, /bottom, 5, PIPE_BOTTOM_GAP_SPIKE_HEIGHT/);
});
