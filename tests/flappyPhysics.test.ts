import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { EASY_FLAPPY_SETTINGS, resolvePipeCollision } from '../src/lib/flappyPhysics';

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

test('easy mode keeps pipes slow, spacious, and widely separated', () => {
  assert.ok(EASY_FLAPPY_SETTINGS.pipeSpeed <= 3.2);
  assert.ok(EASY_FLAPPY_SETTINGS.openingSize >= 130);
  assert.ok(EASY_FLAPPY_SETTINGS.spawnIntervalFrames >= 64);

  const horizontalSpacing =
    EASY_FLAPPY_SETTINGS.pipeSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
  assert.ok(horizontalSpacing >= 200);
});
