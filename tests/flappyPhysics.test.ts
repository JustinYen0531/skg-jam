import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  EASY_FLAPPY_SETTINGS,
  getGateHeights,
  getGateOpeningBounds,
  getGateSpawnX,
  getGateVisualStyle,
  getFlappyNightMix,
  isGate37PhysicalBarrierSealed,
  isGate37NormalRouteImpossible,
  nextGate37DeathCount,
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

test('Gate 36 is at the ceiling and Gate 37 is at the floor in the real canvas', () => {
  const gate36 = getGateOpeningBounds(getGateHeights(36, 320), 320, 12);
  const gate37 = getGateOpeningBounds(getGateHeights(37, 320), 320, 12);

  assert.ok(gate36.bottom < gate37.top);
  assert.ok(gate36.top < 30);
  assert.ok(gate37.bottom > 290);
});

test('Gate 36 and Gate 37 form a visible physical seal with no bird-sized seam', () => {
  const canvasWidth = 640;
  const pipeWidth = 50;
  const birdDiameter = 24;
  const ordinarySpacing =
    EASY_FLAPPY_SETTINGS.pipeSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
  const gate36XWhenGate37Spawns = canvasWidth - ordinarySpacing;
  const gate37X = getGateSpawnX(37, canvasWidth);
  const clearHorizontalSeam = gate37X - (gate36XWhenGate37Spawns + pipeWidth);

  assert.ok(clearHorizontalSeam >= 0, 'the visible pipes should not overlap each other');
  assert.ok(clearHorizontalSeam < birdDiameter, 'the seam must be too narrow for the bird');
  assert.equal(isGate37PhysicalBarrierSealed(320, 12), true);
});

test('every ordinary gate follows a varied but fully deterministic layout', () => {
  const firstRun = Array.from({ length: 36 }, (_, index) => getGateHeights(index, 400));
  const secondRun = Array.from({ length: 36 }, (_, index) => getGateHeights(index, 400));

  assert.deepEqual(firstRun, secondRun);
  assert.ok(new Set(firstRun.map((gate) => gate.topHeight)).size >= 6);
});

test('the world stays in daylight through 35 and turns fully dark at 37', () => {
  assert.equal(getFlappyNightMix(0), 0);
  assert.equal(getFlappyNightMix(35), 0);
  assert.equal(getFlappyNightMix(36), 0.5);
  assert.equal(getFlappyNightMix(37), 1);
  assert.equal(getFlappyNightMix(80), 1);
});

test('Gate 37 and every visible gate behind it share the green Level 2 material', () => {
  const gate37 = getGateVisualStyle(37);
  const gate38 = getGateVisualStyle(38);
  const laterGate = getGateVisualStyle(52);

  assert.equal(gate37.variant, 'level2-preview');
  assert.equal(gate38.variant, 'level2-preview');
  assert.equal(laterGate.variant, 'level2-preview');
  assert.ok(gate37.spikeCount > 0);
  assert.equal(gate38.spikeCount, 0);
  assert.equal(gate37.showRedWarning, false);
});

test('the Flappy game renders its sky from the day-to-night transition', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.match(source, /getFlappyNightMix\(state\.score\)/);
});

test('the Flappy game uses the physical Gate 37 spawn position', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.match(source, /x: getGateSpawnX\(gateIndex, width\)/);
});

test('the Flappy game source contains no runtime randomness or old full-height warning wall', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.doesNotMatch(source, /Math\.random/);
  assert.doesNotMatch(source, /fillRect\(pipe\.x - 10, 0, 70, height\)/);
});

test('Gate 37 only reacts to visible pipe impact and has no ghost barrier death', () => {
  const source = readFileSync('src/components/FlappyGame.tsx', 'utf8');

  assert.match(source, /pipe\.index === 37 && !state\.bypassActive && collision\.fatal/);
  assert.doesNotMatch(source, /INVISIBLE WALL|Ghost Barrier/);
});

test('the Gate 36 to Gate 37 normal route is impossible in the real canvas', () => {
  assert.equal(isGate37NormalRouteImpossible(320, 12), true);
});

test('only a Gate 37 collision increments the story death counter', () => {
  assert.equal(nextGate37DeathCount(1, 'gate37'), 2);
  assert.equal(nextGate37DeathCount(1, 'collision'), 1);
  assert.equal(nextGate37DeathCount(1, 'boundary'), 1);
  assert.equal(nextGate37DeathCount(1, 'sequence'), 1);
});
