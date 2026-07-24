import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  EASY_FLAPPY_SETTINGS,
  GATE_40_INDEX,
  GATE_40_CLEAR_GAP,
  getCheapTelemetry,
  getGateHeights,
  getGateOpeningBounds,
  getGateSpawnX,
  getGateVisualStyle,
  getFlappyNightMix,
  getScoreAfterPassingGate,
  isGate40NormalRouteImpossible,
  nextGate40DeathCount,
  resolvePipeCollision,
} from '../src/lib/flappyPhysics';

const pipe = {
  pipeX: 70,
  pipeWidth: 50,
  topHeight: 100,
  bottomHeight: 80,
  canvasHeight: 400,
};

const bird = {
  x: 80,
  radius: 12,
};

test('a descending bird lands on the lower pipe and survives', () => {
  const result = resolvePipeCollision({
    ...pipe,
    ...bird,
    previousY: 306,
    currentY: 312,
    velocityY: 6,
  });

  assert.equal(result.kind, 'land');
  assert.equal(result.fatal, false);
  assert.equal(result.y, 308);
  assert.equal(result.velocityY, 0);
});

test('a bird remains safely supported on the lower pipe', () => {
  const result = resolvePipeCollision({
    ...pipe,
    ...bird,
    previousY: 308,
    currentY: 309,
    velocityY: 1,
  });

  assert.equal(result.kind, 'land');
  assert.equal(result.fatal, false);
  assert.equal(result.y, 308);
  assert.equal(result.velocityY, 0);
});

test('an ascending bird bumps the upper pipe ceiling and survives', () => {
  const result = resolvePipeCollision({
    ...pipe,
    ...bird,
    previousY: 114,
    currentY: 108,
    velocityY: -6,
  });

  assert.equal(result.kind, 'ceiling');
  assert.equal(result.fatal, false);
  assert.equal(result.y, 112);
  assert.ok(result.velocityY > 0);
});

test('a bird hitting the vertical face still dies', () => {
  const result = resolvePipeCollision({
    ...pipe,
    x: 60,
    radius: 12,
    previousY: 60,
    currentY: 62,
    velocityY: 2,
  });

  assert.equal(result.kind, 'side');
  assert.equal(result.fatal, true);
});

test('a bird flying through the open gap is untouched', () => {
  const result = resolvePipeCollision({
    ...pipe,
    ...bird,
    previousY: 190,
    currentY: 192,
    velocityY: 2,
  });

  assert.equal(result.kind, 'none');
  assert.equal(result.fatal, false);
  assert.equal(result.y, 192);
  assert.equal(result.velocityY, 2);
});

test('horizontal movement is twenty-five percent slower without crowding gates together', () => {
  assert.equal(EASY_FLAPPY_SETTINGS.pipeSpeed, 4.8);
  assert.ok(EASY_FLAPPY_SETTINGS.openingSize >= 130);
  assert.equal(EASY_FLAPPY_SETTINGS.spawnIntervalFrames, 40);

  const horizontalSpacing =
    EASY_FLAPPY_SETTINGS.pipeSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
  assert.ok(horizontalSpacing >= 190);
});

test('the final score-40 gate pair is at the ceiling and floor in the real canvas', () => {
  const gate39 = getGateOpeningBounds(getGateHeights(GATE_40_INDEX - 1, 320), 320, 12);
  const gate40 = getGateOpeningBounds(getGateHeights(GATE_40_INDEX, 320), 320, 12);

  assert.ok(gate39.bottom < gate40.top);
  assert.ok(gate39.top < 30);
  assert.ok(gate40.bottom > 290);
});

test('the final score-40 gate pair remains visibly separate while closer than ordinary gates', () => {
  const canvasWidth = 640;
  const pipeWidth = 50;
  const birdDiameter = 24;
  const ordinarySpacing =
    EASY_FLAPPY_SETTINGS.pipeSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
  const gate39XWhenGate40Spawns = canvasWidth - ordinarySpacing;
  const gate40X = getGateSpawnX(GATE_40_INDEX, canvasWidth);
  const clearHorizontalGap = gate40X - (gate39XWhenGate40Spawns + pipeWidth);

  assert.equal(clearHorizontalGap, GATE_40_CLEAR_GAP);
  assert.ok(clearHorizontalGap > birdDiameter, 'the pipes need a clearly visible gap');
  assert.ok(clearHorizontalGap < ordinarySpacing - pipeWidth, 'the lock pair should remain closer than normal');
});

test('every ordinary gate follows a varied but fully deterministic layout', () => {
  const firstRun = Array.from({ length: 36 }, (_, index) => getGateHeights(index, 400));
  const secondRun = Array.from({ length: 36 }, (_, index) => getGateHeights(index, 400));

  assert.deepEqual(firstRun, secondRun);
  assert.ok(new Set(firstRun.map((gate) => gate.topHeight)).size >= 6);
});

test('the world begins turning at 38 and becomes fully dark at 40', () => {
  assert.equal(getFlappyNightMix(0), 0);
  assert.equal(getFlappyNightMix(37), 0);
  assert.equal(getFlappyNightMix(38), 1 / 3);
  assert.equal(getFlappyNightMix(39), 2 / 3);
  assert.equal(getFlappyNightMix(40), 1);
  assert.equal(getFlappyNightMix(80), 1);
});

test('the score-40 gate and every visible gate behind it share the green Level 2 material', () => {
  const gate39 = getGateVisualStyle(GATE_40_INDEX - 1);
  const gate40 = getGateVisualStyle(GATE_40_INDEX);
  const gate41 = getGateVisualStyle(GATE_40_INDEX + 1);
  const laterGate = getGateVisualStyle(GATE_40_INDEX + 12);

  assert.equal(gate39.variant, 'level1');
  assert.equal(gate40.variant, 'level2-preview');
  assert.equal(gate41.variant, 'level2-preview');
  assert.equal(laterGate.variant, 'level2-preview');
  assert.ok(gate40.spikeCount > 0);
  assert.equal(gate41.spikeCount, 0);
  assert.equal(gate40.showRedWarning, false);
});

test('score 40 means Gate 39 was passed and Gate 40 is the blocker', () => {
  assert.equal(GATE_40_INDEX, 20);
  assert.equal(getScoreAfterPassingGate(GATE_40_INDEX - 1), 40);
  assert.equal(getScoreAfterPassingGate(GATE_40_INDEX), 42);
});

test('cheap telemetry drifts without affecting gameplay or using randomness', () => {
  const first = getCheapTelemetry(0);
  const later = getCheapTelemetry(240);

  assert.notDeepEqual(first, later);
  assert.match(first.neuralSync, /^\d{2}\.\d%$/);
  assert.match(first.flapAccuracy, /^\+?\d+%$/);
  assert.match(first.birdConfidence, /^\d+%$/);
});

test('the Flappy game renders its sky from the day-to-night transition', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.match(source, /getFlappyNightMix\(state\.score\)/);
});

test('each two-point pipe pass renders one matching +2 popup', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.match(source, /ctx\.fillText\('\+2', p\.x, p\.y - rise\)/);
  assert.doesNotMatch(source, /ctx\.fillText\('\+1', p\.x, p\.y - rise\)/);
});

test('the Flappy game uses the special Gate 40 spawn position', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.match(source, /x: getGateSpawnX\(gateIndex, width\)/);
});

test('the Flappy game source contains no runtime randomness or old full-height warning wall', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.doesNotMatch(source, /Math\.random/);
  assert.doesNotMatch(source, /fillRect\(pipe\.x - 10, 0, 70, height\)/);
});

test('Gate 40 only reacts to visible pipe impact and has no ghost barrier death', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.match(source, /pipe\.index === GATE_40_INDEX && !state\.bypassActive && collision\.fatal/);
  assert.doesNotMatch(source, /INVISIBLE WALL|Ghost Barrier/);
});

test('the Gate 39 to Gate 40 normal route remains impossible despite the visible gap', () => {
  assert.equal(isGate40NormalRouteImpossible(320, 12), true);
});

test('only a Gate 40 collision increments the story death counter', () => {
  assert.equal(nextGate40DeathCount(1, 'gate40'), 2);
  assert.equal(nextGate40DeathCount(1, 'collision'), 1);
  assert.equal(nextGate40DeathCount(1, 'boundary'), 1);
  assert.equal(nextGate40DeathCount(1, 'sequence'), 1);
});

test('death results appear immediately without exposing the home screen', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');
  const deathHandler = source.slice(source.indexOf('const handleDeath'), source.indexOf('const triggerCompletion'));

  assert.match(deathHandler, /setShowResults\(true\)/);
  assert.doesNotMatch(deathHandler, /setTimeout/);
});
