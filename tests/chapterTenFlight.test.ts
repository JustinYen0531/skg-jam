import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  CHAPTER_TEN_NODES,
  CHAPTER_TEN_ROUTE_COLLECTION_RADIUS,
  CHAPTER_TEN_ROUTE_POINT_SCALE,
  CHAPTER_TEN_SCORE_OVERFLOW,
  CHAPTER_TEN_BETWEEN_POINT_GATES,
  DEFAULT_FLIGHT_CONFIG,
  createFlightState,
  createRunRouteState,
  deriveAutonomousPhase,
  deriveRoutePoints,
  distanceToEnd,
  isGate40Passable,
  isPlayerControlled,
  requiredRoutePointCount,
  runFlight,
  savedAltitudeForScore,
  shouldAcceptPlayerInput,
  stepFlight,
  touchesRoutePoint,
  type ChapterTenPhase,
  type FlightState,
} from '../src/lib/chapterTenFlight';
import {
  CHAPTER_TEN_COMPLETE_LINES,
  CHAPTER_TEN_MEMORY_LINES,
  CHAPTER_TEN_TERMINAL_LABEL,
  getBirdForm,
  getCollisionGeometry,
  getHudMode,
  getObstacleForm,
  getPixelPresence,
  getPeelStage,
  isNostalgicFlight,
} from '../src/lib/chapterTenVisualPhases';
import { GATE_40_INDEX, getGateHeights, getGateOpeningBounds } from '../src/lib/flappyPhysics';
import {
  ARCANE_FLIGHT_REFLECTIONS,
  ARCANE_TAKEOVER_LINES,
  CHAPTER_TEN_FLIGHT_CREDITS,
  getCompletionScoreAtFrame,
  getCreditsScoreAtProgress,
  getFlightCreditsAtScore,
  NOAH_FINAL_TRANSMISSION,
} from '../src/lib/chapterTenCredits';

const CANVAS_HEIGHT = 320;
const BIRD_RADIUS = 12;

test('Gate 40 takeover identifies Arcane as ARC_184 before he takes control', () => {
  assert.deepEqual(ARCANE_TAKEOVER_LINES, [
    "It's me—ARC_184. My turn.",
    'I know these routes. Leave the rest to me.',
  ]);
});

// 1. Route points are derived deterministically from the existing Gate structure.
test('route points form a deterministic varied path through gates and between them', () => {
  const a = deriveRoutePoints(CANVAS_HEIGHT, BIRD_RADIUS);
  const b = deriveRoutePoints(CANVAS_HEIGHT, BIRD_RADIUS);

  assert.equal(a.length, GATE_40_INDEX + 8);
  assert.equal(requiredRoutePointCount(), GATE_40_INDEX + 8);
  assert.deepEqual(a, b); // deterministic

  const gatePoints = a.filter((point) => point.placement === 'gate');
  const betweenPoints = a.filter((point) => point.placement === 'between');
  assert.equal(gatePoints.length, GATE_40_INDEX);
  assert.equal(betweenPoints.length, CHAPTER_TEN_BETWEEN_POINT_GATES.length);
  assert.deepEqual(
    betweenPoints.map((point) => point.gateIndex),
    [...CHAPTER_TEN_BETWEEN_POINT_GATES],
  );

  for (const point of gatePoints) {
    const opening = getGateOpeningBounds(
      getGateHeights(point.gateIndex, CANVAS_HEIGHT),
      CANVAS_HEIGHT,
      BIRD_RADIUS,
    );
    assert.ok(point.y >= opening.top && point.y <= opening.bottom, `gate ${point.gateIndex} on path`);
  }
  assert.ok(new Set(gatePoints.map((point) => Math.round(point.y))).size >= 10);
  assert.ok(gatePoints.filter((point) => {
    const opening = getGateOpeningBounds(
      getGateHeights(point.gateIndex, CANVAS_HEIGHT),
      CANVAS_HEIGHT,
      BIRD_RADIUS,
    );
    return Math.abs(point.y - (opening.top + opening.bottom) / 2) < 2;
  }).length <= 1);

  for (const point of betweenPoints) {
    assert.equal(point.offsetX, 112);
    assert.ok(point.y >= BIRD_RADIUS && point.y <= CANVAS_HEIGHT - BIRD_RADIUS);
  }
});

test('route collection requires physical contact with each light point', () => {
  assert.equal(CHAPTER_TEN_ROUTE_POINT_SCALE, 1.5);
  assert.equal(CHAPTER_TEN_ROUTE_COLLECTION_RADIUS, 25.5);
  assert.equal(touchesRoutePoint(80, 120, 80, 120), true);
  assert.equal(touchesRoutePoint(80, 120, 105.49, 120), true);
  assert.equal(touchesRoutePoint(80, 120, 105.51, 120), false);
  assert.equal(touchesRoutePoint(80, 120, 80, 145.51), false);
});

test('the rendered route point uses the same 150% scale as its pickup radius', () => {
  const source = readFileSync(new URL('../src/components/chapterTenCanvas.ts', import.meta.url), 'utf8');
  assert.match(source, /const pointRadius = \(collected \? 2 : 4\) \* CHAPTER_TEN_ROUTE_POINT_SCALE/);
  assert.match(source, /ctx\.arc\(pointX, point\.y, pointRadius/);
});

// 2. Missing any single route point keeps Gate 40 sealed.
test('Gate 40 stays sealed if any route point is missing', () => {
  const total = requiredRoutePointCount();
  const all = Array.from({ length: total }, (_, i) => i);
  for (let missing = 0; missing < total; missing += 1) {
    const collected = all.filter((i) => i !== missing);
    assert.equal(isGate40Passable(collected, total), false, `missing ${missing} keeps it sealed`);
  }
});

// 3. Collecting every route point in one run opens Gate 40.
test('Gate 40 opens once every route point of the run is collected', () => {
  const total = requiredRoutePointCount();
  const run = createRunRouteState();
  for (let i = 0; i < total; i += 1) {
    assert.equal(isGate40Passable(run, total), false);
    run.add(i);
  }
  assert.equal(isGate40Passable(run, total), true);
});

// 4. A fresh run resets the route-point collection.
test('a new run resets route-point collection (no cross-run assembly)', () => {
  const firstRun = createRunRouteState();
  for (let i = 0; i < requiredRoutePointCount() - 1; i += 1) firstRun.add(i);
  assert.equal(isGate40Passable(firstRun), false);

  const secondRun = createRunRouteState();
  assert.equal(secondRun.size, 0);
  assert.equal(isGate40Passable(secondRun), false);
});

// 5. The player controls the bird before Gate 40 is passed.
test('the player controls the bird only in the player-route phase', () => {
  assert.equal(isPlayerControlled('player-route'), true);
  assert.equal(shouldAcceptPlayerInput('player-route'), true);
});

// 6. After Gate 40 the autonomous phases ignore player input.
test('after Gate 40 player input no longer moves the bird', () => {
  const autonomousPhases: ChapterTenPhase[] = [
    'gate40-takeover',
    'peeling',
    'restored-2013',
    'memory-184',
    'coordinate-flight',
    'terminal-256',
    'complete',
  ];
  for (const phase of autonomousPhases) {
    assert.equal(isPlayerControlled(phase), false, `${phase} is not player-controlled`);
    assert.equal(shouldAcceptPlayerInput(phase), false, `${phase} ignores input`);
  }
});

// 7. The autonomous flap is a single event the finger and the bird both consume.
test('every autonomous flap is one shared event (finger + bird rise)', () => {
  const result = runFlight(160);
  assert.ok(result.flaps > 0, 'the flight flaps');
  // The flap count and the recorded flap frames come from the same event stream.
  assert.equal(result.flaps, result.flapFrames.length);

  // Re-stepping confirms each flap frame set the bird to jump velocity, i.e. the
  // same event that would drive the Meta finger also raised the bird.
  let state = createFlightState(160);
  const jumpFrames: number[] = [];
  for (let i = 0; i < result.frames; i += 1) {
    const stepped = stepFlight(state, DEFAULT_FLIGHT_CONFIG);
    state = stepped.state;
    if (stepped.events.includes('flap')) {
      // The shared event raised the bird this frame: velocity is the jump
      // impulse with this frame's gravity already folded in, and clearly rising.
      assert.ok(state.velocityY < 0, 'flap event makes the bird rise');
      assert.ok(state.velocityY <= DEFAULT_FLIGHT_CONFIG.jump + DEFAULT_FLIGHT_CONFIG.gravity + 1e-9);
      jumpFrames.push(state.frame);
    }
  }
  assert.deepEqual(jumpFrames, result.flapFrames);
});

// 8. The autonomous trajectory is fully deterministic.
test('the autonomous trajectory is fully deterministic', () => {
  const trace = (): FlightState[] => {
    let state = createFlightState(150);
    const frames: FlightState[] = [];
    for (let i = 0; i < 400; i += 1) {
      state = stepFlight(state).state;
      frames.push({ ...state });
    }
    return frames;
  };
  assert.deepEqual(trace(), trace());

  const a = runFlight(150);
  const b = runFlight(150);
  assert.deepEqual(a.flapFrames, b.flapFrames);
  assert.equal(a.frames, b.frames);
  assert.deepEqual(a.finalState, b.finalState);
});

// 9. The 184 identity check fires exactly once.
test('the 184 identity check fires exactly once', () => {
  let state = createFlightState(160);
  let memoryEvents = 0;
  for (let i = 0; i < 20000 && !state.completed; i += 1) {
    const stepped = stepFlight(state);
    state = stepped.state;
    memoryEvents += stepped.events.filter((e) => e === 'memory-184').length;
  }
  assert.equal(memoryEvents, 1);
  assert.equal(state.memoryMatched, true);
});

// 10. The 184 check contains ARC_184, ARCANE KADE and twelve years ago.
test('the 184 identity check states ARC_184, ARCANE KADE and twelve years ago', () => {
  const joined = CHAPTER_TEN_MEMORY_LINES.join('\n');
  assert.match(joined, /ARC_184/);
  assert.match(joined, /ARCANE KADE/);
  assert.match(joined, /12 YEARS AGO/);
});

// 11. From 185 the HUD switches to DISTANCE TO END.
test('from score 185 the HUD is DISTANCE TO END, not a rank', () => {
  assert.equal(getHudMode(184), 'rank');
  assert.equal(getHudMode(CHAPTER_TEN_NODES.distanceHudFrom), 'distance-to-end');
  assert.equal(getHudMode(186), 'distance-to-end');
  assert.equal(getHudMode(256), 'distance-to-end');
  assert.equal(distanceToEnd(184), 72);
  assert.equal(distanceToEnd(256), 0);
  assert.equal(distanceToEnd(300), 0);
});

// 12 & 13. At 256 the finger stops, the bird dives to altitude 0 and leaves the
// bottom — and that is a completion, never a death.
test('at 256 the finger stops, the bird dives to altitude 0 and completes without dying', () => {
  const result = runFlight(140);
  assert.notEqual(result.terminalFrame, null);
  assert.notEqual(result.completeFrame, null);
  assert.ok((result.completeFrame as number) > (result.terminalFrame as number));

  // No flaps happen after the terminal — the finger has stopped.
  const flapsAfterTerminal = result.flapFrames.filter((f) => f > (result.terminalFrame as number));
  assert.equal(flapsAfterTerminal.length, 0);

  const finalState = result.finalState;
  assert.equal(finalState.descending, true);
  assert.equal(finalState.exitedBottom, true);
  assert.equal(finalState.completed, true);
  // The bird left the bottom of the screen; nothing marks this as a death.
  assert.ok(finalState.birdY - DEFAULT_FLIGHT_CONFIG.birdRadius > DEFAULT_FLIGHT_CONFIG.canvasHeight);
  assert.equal(finalState.phase, 'complete');
  assert.equal(Object.prototype.hasOwnProperty.call(finalState, 'died'), false);
});

// 14. The completion screen keeps the preserved text.
test('the completion screen keeps SKYLINE COMPLETE / THANK YOU FOR PLAYING', () => {
  assert.deepEqual([...CHAPTER_TEN_COMPLETE_LINES], ['SKYLINE COMPLETE', 'THANK YOU FOR PLAYING']);
  assert.equal(CHAPTER_TEN_TERMINAL_LABEL, 'SERVICE TERMINATED');
});

// 15. The score overflow order is 256 → 65535 → −65535.
test('the score overflow sequence is 256, 65535, -65535', () => {
  assert.deepEqual([...CHAPTER_TEN_SCORE_OVERFLOW], [256, 65535, -65535]);
});

// 16. No visual phase changes the collision data.
test('no visual phase or score changes the collision geometry', () => {
  const baseline = getCollisionGeometry(0);
  for (let score = 0; score <= 300; score += 1) {
    assert.deepEqual(getCollisionGeometry(score), baseline);
  }
  // The presentation curves do vary, proving the invariance is meaningful.
  const forms = new Set([getBirdForm(60), getBirdForm(210), getBirdForm(255)]);
  const stages = new Set([getPeelStage(184), getPeelStage(210), getPeelStage(250)]);
  const obstacles = new Set([getObstacleForm(60), getObstacleForm(200), getObstacleForm(255)]);
  assert.ok(forms.size > 1);
  assert.ok(stages.size > 1);
  assert.ok(obstacles.size > 1);
});

test('scores 40 through 184 keep the complete nostalgic pixel presentation', () => {
  for (const score of [40, 80, 120, 183, 184]) {
    assert.equal(isNostalgicFlight(score), true);
    assert.equal(getPixelPresence(score), 1);
    assert.equal(getBirdForm(score), 'pixel-bird');
    assert.equal(getObstacleForm(score), 'pixel');
    assert.equal(getPeelStage(score), 'restored-2013');
    assert.equal(getHudMode(score), 'rank');
  }
  assert.equal(isNostalgicFlight(185), false);
  assert.equal(getHudMode(185), 'distance-to-end');
});

test('the live renderer delays terminal language until after ARC_184', () => {
  const source = readFileSync(new URL('../src/components/chapterTenCanvas.ts', import.meta.url), 'utf8');
  const nostalgicWorld = source.slice(
    source.indexOf('if (isNostalgicFlight(score))'),
    source.indexOf('const drain = getTerminalDrain(score)'),
  );
  const nostalgicHud = source.slice(
    source.indexOf('// A plain arcade score, not a terminal readout.'),
    source.indexOf("ctx.fillStyle = 'rgba(4,10,13,.76)'"),
  );

  assert.match(nostalgicWorld, /#69c6d4/);
  assert.match(nostalgicWorld, /#79a84b/);
  assert.match(nostalgicWorld, /#d9bd72/);
  assert.doesNotMatch(nostalgicWorld, /JetBrains|LOCAL RANK|TRACE|#6d28d9/);
  assert.match(nostalgicHud, /Courier New/);
  assert.doesNotMatch(nostalgicHud, /LOCAL RANK|TRACE|JetBrains/);
});

// 17. reduced-motion and fullscreen-only never wedge the run.
test('reduced-motion and fullscreen-only still transfer control and complete', () => {
  for (const options of [
    { reducedMotion: true },
    { fullscreenOnly: true },
    { reducedMotion: true, fullscreenOnly: true },
  ]) {
    // Control still leaves the player at Gate 40 regardless of mode.
    assert.equal(shouldAcceptPlayerInput('coordinate-flight', options), false);
    assert.equal(shouldAcceptPlayerInput('player-route', options), true);
  }
  // The deterministic flight reaches completion on its own, so no mode can
  // deadlock waiting for an input that autonomy will never accept.
  const result = runFlight(150);
  assert.notEqual(result.completeFrame, null);
});

// Supporting: phases progress monotonically through the canonical order.
test('autonomous phases progress through the canonical order to complete', () => {
  const order: ChapterTenPhase[] = [
    'gate40-takeover',
    'peeling',
    'restored-2013',
    'memory-184',
    'coordinate-flight',
    'terminal-256',
    'complete',
  ];
  const seen: ChapterTenPhase[] = [];
  let state = createFlightState(150);
  seen.push(state.phase);
  for (let i = 0; i < 20000 && !state.completed; i += 1) {
    state = stepFlight(state).state;
    if (seen[seen.length - 1] !== state.phase) seen.push(state.phase);
  }
  // Every phase seen appears in canonical order and never goes backwards.
  let cursor = -1;
  for (const phase of seen) {
    const idx = order.indexOf(phase);
    assert.ok(idx >= 0, `${phase} is a known phase`);
    assert.ok(idx >= cursor, `${phase} does not regress`);
    cursor = idx;
  }
  assert.equal(seen[seen.length - 1], 'complete');
});

// Supporting: the saved altitude track threads the preserved samples and is finite.
test('the saved altitude track is deterministic and bounded', () => {
  for (let score = CHAPTER_TEN_NODES.takeover; score <= CHAPTER_TEN_NODES.terminal; score += 2) {
    const alt = savedAltitudeForScore(score);
    assert.ok(Number.isFinite(alt));
    assert.ok(alt >= 0 && alt <= 256);
  }
  assert.equal(savedAltitudeForScore(CHAPTER_TEN_NODES.takeover), 184);
});

// Supporting: the module never reaches for Math.random.
test('the Chapter 10 flight core contains no Math.random', () => {
  const source = readFileSync(new URL('../src/lib/chapterTenFlight.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Math\.random/);
  const phase = deriveAutonomousPhase(createFlightState(150));
  assert.equal(phase, 'gate40-takeover');
});

test('the live game wires Gate 40 to the deterministic Chapter 10 flight', () => {
  const source = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /isGate40Passable\(state\.chapterTenRoute\)/);
  assert.match(source, /createFlightState\(state\.birdY/);
  // The autonomous flight is now Arcane's verified hard performance, driven by
  // his deterministic click pattern rather than the smooth saved re-flight.
  assert.match(source, /computePerformancePlan\(\)/);
  assert.match(source, /performanceSampleAt\(plan, state\.chapterTenPerfFrame\)/);
  assert.match(source, /shouldAcceptPlayerInput\(stateRef\.current\.chapterTenPhase\)/);
  assert.match(source, /beginAutonomousControlRef\.current\('flappy-canvas'\)/);
  assert.match(source, /pulsePlayerTap\('flappy-canvas'\)/);
  assert.match(source, /pulseAutonomousTap\(\)/);
});

test('missing one Chapter 10 route point dies at Gate 40 instead of using the old altitude bypass', () => {
  const source = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const gate40Branch = source.slice(
    source.indexOf('if (pipe.index === GATE_40_INDEX'),
    source.indexOf('} else if (pipe.index > GATE_40_INDEX'),
  );
  assert.match(
    gate40Branch,
    /else if \(chapterTenActive\) \{[\s\S]*?handleDeath\('Level 2 Seal #40', 'gate40'\);[\s\S]*?\} else if \(progress\.unlockedCodeRoute\)/,
  );
  assert.ok(
    gate40Branch.indexOf('else if (chapterTenActive)') < gate40Branch.indexOf('const currentAltitude'),
    'Chapter 10 death must be resolved before the legacy altitude fallback',
  );
});

test('Arcane stays silent before Gate 40 and the player tap uses the visible hand relay', () => {
  const gameSource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  assert.match(gameSource, /chapterTenEntryDotsSpokenRef/);
  assert.match(gameSource, /chapterTenActive && state\.score < CHAPTER_TEN_NODES\.takeover[\s\S]*?speak\(\['\.\.\.'\]\)/);
  assert.match(gameSource, /speak\(ARCANE_TAKEOVER_LINES, resumeChapterTenTakeover\)/);
  assert.match(metaSource, /const pulsePlayerTap = useCallback/);
  assert.match(metaSource, /this only[\s\S]*lets Arcane's finger visibly perform/);
  assert.doesNotMatch(
    metaSource.match(/const pulsePlayerTap = useCallback[\s\S]*?\}, \[active, clearPlayerTapTimers, getRestPosition\]\);/)?.[0] ?? '',
    /dispatchEvent|\.click\(\)/,
  );
});

test('Gate 40 pauses for the Meta pullback and resumes only after My turn finishes typing', () => {
  const gameSource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const canvasSource = readFileSync(new URL('../src/components/chapterTenCanvas.ts', import.meta.url), 'utf8');
  const gate40 = gameSource.slice(
    gameSource.indexOf('state.chapterTenTakeoverPaused = true'),
    gameSource.indexOf("// Arcane's hard performance"),
  );
  const resume = gameSource.slice(
    gameSource.indexOf('const resumeChapterTenTakeover'),
    gameSource.indexOf('const restartRun'),
  );

  assert.match(gate40, /state\.chapterTenTakeoverPaused = true/);
  assert.match(gate40, /onChapterTenTakeover\(\)/);
  assert.match(gate40, /speak\(ARCANE_TAKEOVER_LINES, resumeChapterTenTakeover\)/);
  assert.doesNotMatch(gate40, /beginAutonomousControl/);
  assert.match(resume, /state\.chapterTenTakeoverPaused = false/);
  assert.match(resume, /beginAutonomousControlRef\.current\('flappy-canvas'\)/);
  assert.match(resume, /music\.playFinaleOnce\(\)/);
  assert.match(gameSource, /drawChapterTenTakeoverPause\(ctx, width, height\)/);
  assert.match(canvasSource, /fillText\('PAUSED'/);
  assert.match(metaSource, /onComplete=\{handleDialogueComplete\}/);
  assert.match(metaSource, /doneRef\.current = true;\s+onComplete\?\.\(\)/);
});

test('the live Chapter 10 renderer keeps the memory, terminal and finish beats', () => {
  const source = readFileSync(new URL('../src/components/chapterTenCanvas.ts', import.meta.url), 'utf8');
  assert.match(source, /CHAPTER_TEN_MEMORY_LINES/);
  assert.match(source, /CHAPTER_TEN_TERMINAL_LABEL/);
  assert.match(source, /CHAPTER_TEN_COMPLETE_LINES/);
  assert.match(source, /fillText\('SCORE 256'/);
  assert.match(source, /distanceToEnd/);
});

test('Meta input is blocked while Arcane owns the flight', () => {
  const source = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  assert.match(source, /beginAutonomousControl/);
  assert.match(source, /pulseAutonomousTap/);
  assert.match(source, /endAutonomousControl/);
  assert.match(source, /data-autonomous-control/);
  assert.match(source, /if \(autonomousTappingRef\.current\)/);
});

test('Chapter 10 lets Arcane keep reflecting after 184 and starts Finale after the typed takeover', () => {
  const source = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /speak\(ARCANE_TAKEOVER_LINES, resumeChapterTenTakeover\)/);
  assert.match(source, /chapterTenTakeoverSpoken/);
  assert.match(source, /ARCANE_FLIGHT_REFLECTIONS/);
  assert.match(source, /state\.chapterTenFinaleStarted = true;\s+music\.playFinaleOnce\(\)/);
  assert.match(source, /music\.playFinaleOnce\(\)/);
  assert.equal(ARCANE_FLIGHT_REFLECTIONS.length, 9);
  assert.ok(ARCANE_FLIGHT_REFLECTIONS.some((reflection) => reflection.score > 184));
  assert.ok(ARCANE_FLIGHT_REFLECTIONS.every((reflection) => reflection.score > 40 && reflection.score < 256));
});

test('flight credits stay sparse, leave 184 clear, and continue after the reveal', () => {
  assert.ok(CHAPTER_TEN_FLIGHT_CREDITS.some((credit) => credit.startScore < 184));
  assert.ok(CHAPTER_TEN_FLIGHT_CREDITS.some((credit) => credit.startScore > 184));
  assert.deepEqual(getFlightCreditsAtScore(184), []);
  for (let score = 40; score <= 256; score += 1) {
    assert.ok(getFlightCreditsAtScore(score).length <= 1, `score ${score} stays readable`);
  }
});

test('completion score climbs to the unsigned ceiling and then overflows at once', () => {
  assert.equal(getCompletionScoreAtFrame(0), 256);
  assert.equal(getCompletionScoreAtFrame(24), 256);
  assert.ok(getCompletionScoreAtFrame(80) > 256);
  assert.ok(getCompletionScoreAtFrame(143) < 65535);
  assert.equal(getCompletionScoreAtFrame(144), 65535);
  assert.equal(getCompletionScoreAtFrame(156), -65535);
  assert.equal(getCreditsScoreAtProgress(0), 256);
  assert.equal(getCreditsScoreAtProgress(144 / 156), 65535);
  assert.equal(getCreditsScoreAtProgress(1), -65535);
});

test('Skyline credits stay inside the phone game and own the score overflow', () => {
  const gameSource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const canvasSource = readFileSync(new URL('../src/components/chapterTenCanvas.ts', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');

  assert.match(gameSource, /id="chapter-ten-game-credits"/);
  assert.match(gameSource, /data-credit-surface="skyline-256-phone-game"/);
  assert.match(gameSource, /id="chapter-ten-credit-score"/);
  assert.match(gameSource, /getCreditsScoreAtProgress\(creditsPlaybackProgress \?\? 0\)/);
  assert.match(canvasSource, /fillText\('SCORE 256'/);
  assert.doesNotMatch(canvasSource, /getCompletionScoreAtFrame/);
  assert.doesNotMatch(appSource, /id="credits-overlay"/);
  assert.match(phoneSource, />\s*Flappy Something\s*</);
  assert.doesNotMatch(phoneSource, /progress\.unlockedCodeRoute \? 'Skyline 256'/);
});

test('Noah final transmission closes established canon without adding another puzzle', () => {
  const message = NOAH_FINAL_TRANSMISSION.join(' ');
  assert.match(message, /184, 40, and 256/);
  assert.match(message, /counter overflowed/);
  assert.match(message, /Devices stop working/);
  assert.match(message, /You reached the end/);
});
