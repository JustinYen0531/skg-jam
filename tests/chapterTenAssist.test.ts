import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  ASSIST_WORLD,
  CHAPTER_TEN_ASSIST_FAIL_THRESHOLD,
  CHAPTER_TEN_ASSIST_NOTE,
  CHAPTER_TEN_ASSIST_PROMPT,
  CHAPTER_TEN_WELCOME_LABEL,
  CHAPTER_TEN_WELCOME_NOTE,
  computeAssistPlan,
  extractRouteTargets,
  getAssistMarkPositions,
  simulateGuidedRoute,
} from '../src/lib/chapterTenAssist';
import { isGate40Passable, requiredRoutePointCount } from '../src/lib/chapterTenFlight';

// Compute the plan once — it is deterministic and mildly expensive.
const plan = computeAssistPlan();

test('the assist plan collects every one of the 28 light points and clears Gate 40', () => {
  assert.equal(plan.requiredCount, 28);
  assert.equal(plan.requiredCount, requiredRoutePointCount());
  assert.equal(plan.collectedCount, 28);
  assert.equal(plan.success, true);
  assert.notEqual(plan.reachedGate40Frame, null);
});

test('the plan, replayed faithfully, collects all points, never dies, and unlocks Gate 40', () => {
  const run = simulateGuidedRoute(plan.flapFrames);
  assert.equal(run.died, false);
  assert.equal(run.reachedGate40, true);
  assert.equal(run.collectedCount, requiredRoutePointCount());
  // The collected ids are exactly what the real Gate 40 lock checks.
  assert.equal(isGate40Passable(run.collectedIds), true);
});

test('the plan is fully deterministic', () => {
  const again = computeAssistPlan();
  assert.deepEqual(again.flapFrames, plan.flapFrames);
  assert.deepEqual(again.marks, plan.marks);
});

test('the flap schedule is physically pressable by a human (no adjacent-frame presses)', () => {
  assert.ok(plan.flapFrames.length > 0);
  // Frames strictly increasing.
  for (let i = 1; i < plan.flapFrames.length; i += 1) {
    assert.ok(plan.flapFrames[i] > plan.flapFrames[i - 1]);
  }
  // Every gap is at least 10 frames (~167ms at 60fps) so each cross can be hit.
  let minGap = Infinity;
  for (let i = 1; i < plan.flapFrames.length; i += 1) {
    minGap = Math.min(minGap, plan.flapFrames[i] - plan.flapFrames[i - 1]);
  }
  assert.ok(minGap >= 10, `min gap ${minGap} is pressable`);
  // A manageable number of presses, not a frame-by-frame barrage.
  assert.ok(plan.flapFrames.length <= 45, `only ${plan.flapFrames.length} presses`);
});

test('there is one cross per flap and they scroll toward the bird at world speed', () => {
  assert.equal(plan.marks.length, plan.flapFrames.length);

  const firstFlap = plan.flapFrames[0];
  // At the flap frame the cross sits on the bird's column and is imminent.
  const atFlap = getAssistMarkPositions(plan, firstFlap).find((m) => m.frame === firstFlap);
  assert.ok(atFlap);
  assert.ok(Math.abs((atFlap as { x: number }).x - ASSIST_WORLD.birdX) < 0.001);
  assert.equal((atFlap as { imminent: boolean }).imminent, true);

  // Ten frames earlier the same cross is exactly 10 * pipeSpeed to the right.
  const earlier = getAssistMarkPositions(plan, firstFlap - 10).find((m) => m.frame === firstFlap);
  assert.ok(earlier);
  assert.ok(
    Math.abs((earlier as { x: number }).x - (ASSIST_WORLD.birdX + 10 * ASSIST_WORLD.pipeSpeed)) < 0.001,
  );
});

test('route targets are the 28 points, sorted by the frame they reach the bird', () => {
  const targets = extractRouteTargets();
  assert.equal(targets.length, requiredRoutePointCount());
  for (let i = 1; i < targets.length; i += 1) {
    assert.ok(targets[i].frame >= targets[i - 1].frame);
  }
  // Each target id is unique and within range.
  const ids = new Set(targets.map((t) => t.id));
  assert.equal(ids.size, targets.length);
});

test('the offer wording is exactly the reassurance the player is promised', () => {
  assert.equal(CHAPTER_TEN_ASSIST_PROMPT, 'ENABLE ROUTE GUIDE?');
  assert.equal(
    CHAPTER_TEN_ASSIST_NOTE,
    'Shows the old timing marks for this run. Story progress is unchanged.',
  );
  assert.equal(CHAPTER_TEN_ASSIST_FAIL_THRESHOLD, 5);
});

test('Chapter 10 opens with the recovered route guide addressing ARC-184', () => {
  assert.equal(CHAPTER_TEN_WELCOME_LABEL, 'WELCOME, ARC-184.');
  assert.equal(
    CHAPTER_TEN_WELCOME_NOTE,
    'Follow every light point. Complete the trace to open Gate 40.',
  );
  const source = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const start = source.indexOf('id="chapter-ten-route-welcome"');
  const end = source.indexOf('Chapter 10 route-point assist offer', start);
  const welcome = source.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(welcome, /Route Guide \/\/ Legacy Profile/);
  assert.match(welcome, /CHAPTER_TEN_WELCOME_LABEL/);
  assert.match(welcome, /CHAPTER_TEN_WELCOME_NOTE/);
  assert.match(welcome, /id="chapter-ten-begin-trace"/);
  assert.match(welcome, />\s*BEGIN TRACE\s*</);
  assert.doesNotMatch(welcome, /[\u3400-\u9fff]/);
});

test('the live assist prompt belongs to the retro English game surface', () => {
  const source = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const start = source.indexOf('id="chapter-ten-assist-offer"');
  const end = source.indexOf('{showLeaderboard &&', start);
  const prompt = source.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(prompt, /Flight Assist/);
  assert.match(prompt, />\s*ENABLE\s*</);
  assert.match(prompt, />\s*KEEP TRYING\s*</);
  assert.match(prompt, /No score penalty/);
  assert.doesNotMatch(prompt, /[\u3400-\u9fff]/);
  assert.doesNotMatch(prompt, /rounded-2xl|bg-cyan-500|cyan-400/);
});

test('the assist maths uses the live pre-Gate-40 constants and no randomness', () => {
  assert.equal(ASSIST_WORLD.birdX, 80);
  assert.equal(ASSIST_WORLD.birdRadius, 12);
  assert.equal(ASSIST_WORLD.pipeSpeed, 4.8);
  assert.equal(ASSIST_WORLD.paceFrames, 40);
  assert.equal(ASSIST_WORLD.collectionRadius, 25.5);
  const source = readFileSync(new URL('../src/lib/chapterTenAssist.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Math\.random/);
});

test('assist crosses use stable high-contrast color roles in the live renderer', () => {
  const source = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /rgba\(253, 224, 71, 1\)/);
  assert.match(source, /rgba\(248, 64, 64, 1\)/);
  assert.match(source, /rgba\(253, 224, 71, 0\.72\)/);
  assert.match(source, /currentTargetFrame = marks\.find\(\(mark\) => mark\.frame >= state\.frameCount\)/);
  assert.doesNotMatch(source, /mark\.imminent \?/);
});
