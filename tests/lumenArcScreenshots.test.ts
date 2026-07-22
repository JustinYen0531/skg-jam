import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  cluesRemaining,
  hasAssembledCase,
  REQUIRED_CLUE_IDS,
  type LumenArcClueId,
} from '../src/lib/lumenArcClues';

test('the case only assembles once every required detail is found', () => {
  assert.equal(REQUIRED_CLUE_IDS.length, 3);
  const none = new Set<LumenArcClueId>();
  assert.equal(hasAssembledCase(none), false);
  assert.equal(cluesRemaining(none), 3);

  const two = new Set<LumenArcClueId>(['title', 'params']);
  assert.equal(hasAssembledCase(two), false);
  assert.equal(cluesRemaining(two), 1);

  const all = new Set<LumenArcClueId>(REQUIRED_CLUE_IDS);
  assert.equal(hasAssembledCase(all), true);
  assert.equal(cluesRemaining(all), 0);
});

test('the screenshot pile hides exactly three clues among many decoys', () => {
  const source = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

  // The player hunts a real pile, not a curated set of three.
  const sheetKinds = source.match(/data-sheet-kind=\{sheet\.clueId \? 'clue' : 'decoy'\}/g) ?? [];
  assert.equal(sheetKinds.length, 1); // rendered once in the map
  const sheetIds = source.match(/^\s*id: '[a-z]+',$/gm) ?? [];
  assert.ok(sheetIds.length >= 9, `expected at least 9 screenshots, found ${sheetIds.length}`);

  // Exactly three sheets carry a clueId, one per required detail.
  const clueSheets = source.match(/clueId: '(title|params|numbers)'/g) ?? [];
  assert.equal(clueSheets.length, 3);
  assert.match(source, /clueId: 'title'/);
  assert.match(source, /clueId: 'params'/);
  assert.match(source, /clueId: 'numbers'/);

  // Each clue is a clickable, underlined word; decoys never render one.
  assert.match(source, /data-clue-word=\{clueId\}/);
  assert.match(source, /underline decoration-dotted/);
});

test('the viewer counts key details and only advances the chapter when assembled', () => {
  const source = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

  // A prominent running n / 3 counter, shown per the requested progression.
  assert.match(source, /id="spec-clue-counter"/);
  assert.match(source, /KEY DETAILS/);
  assert.match(source, /\{found\.size\}<span[^>]*>\/\{CLUE_SHEET_COUNT\}/);
  assert.match(source, /CASE ASSEMBLED/);

  // The advance is gated behind the assembled banner's Continue button, which
  // completes chapter 4 — never the individual clue clicks.
  assert.match(source, /\{assembled && \(/);
  assert.match(source, /id="spec-continue-button"/);
  assert.match(source, /completePuzzleChapter\(prev, 4, \{ discoveredOriginalTitle: true \}\)/);
  // Finding a clue must not itself complete the chapter.
  assert.doesNotMatch(source, /findClue[\s\S]{0,200}completePuzzleChapter/);
});

test('the zoomed screenshot has a reliable Back control that returns to the pile', () => {
  const source = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

  assert.match(source, /const closeActiveSheet = \(\) => \{[\s\S]{0,120}setActiveSheet\(null\)/);
  assert.match(source, /id="spec-back-to-screenshots"/);
  assert.match(source, /aria-label="Back to Lumen Arc screenshots"/);
  assert.match(source, /onClick=\{closeActiveSheet\}/);
  assert.match(source, /id="spec-back-to-screenshots"[\s\S]{0,120}>[\s\S]{0,80}BACK/);
  assert.match(source, /data-meta-immediate="true"[\s\S]{0,80}data-meta-hit-recovery="true"/);
  assert.doesNotMatch(source, /const closeActiveSheet = \(\) => \{[\s\S]{0,160}setActiveDeliveryId/);
});

test('the Lumen Arc evidence must be found inside a normal delivery archive', () => {
  const source = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

  assert.match(source, /const DELIVERY_RECORDS/);
  assert.match(source, /id: 'lumen-arc'/);
  assert.match(source, /Lumen Arc Recovery Lot/);
  assert.match(source, /activeDeliveryId === 'lumen-arc'/);
  assert.match(source, /id="delivery-archive"/);
  assert.match(source, /id="delivery-back-to-archive"/);
});

test('the parcel only reveals after scratching and angle-driven paper inspection', () => {
  const source = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

  assert.match(source, /import \{ LumenArcReveal \}/);
  assert.match(source, /revealPlaying && viewingLumenPackage/);
  assert.match(source, /if \(record\.id === 'lumen-arc'\) \{[\s\S]{0,280}setRevealPlaying\(true\)/);
  assert.match(source, /<LumenArcReveal[\s\S]{0,400}setRevealPlaying\(false\);[\s\S]{0,300}CHAPTER_FOUR_DIALOGUE\.packageOpened/);

  const reveal = readFileSync(new URL('../src/components/LumenArcReveal.tsx', import.meta.url), 'utf8');
  assert.match(reveal, /type RevealPhase = 'scratch' \| 'phone-ready' \| 'inspect' \| 'burst' \| 'clear'/);
  assert.match(reveal, /useState<RevealPhase>\('scratch'\)/);
  assert.match(reveal, /id="lumen-arc-package-scratch-layer"/);
  assert.match(reveal, /globalCompositeOperation = 'destination-out'/);
  assert.match(reveal, /onPointerMove=\{\(event\) =>[\s\S]{0,240}scratchAt\(event\.clientX, event\.clientY\)/);
  assert.match(reveal, /next >= SCRATCH_COMPLETE_AT[\s\S]{0,120}setPhase\('phone-ready'\)/);
  assert.doesNotMatch(reveal, /OPEN PARCEL/);

  assert.match(reveal, /id="lumen-arc-inspect-phone"/);
  assert.match(reveal, /setPhase\('inspect'\)/);
  assert.match(reveal, /delta \* 0\.42/);
  assert.match(reveal, /Math\.abs\(next\) >= BURST_ANGLE/);
  assert.match(reveal, /if \(phase !== 'burst'\) return;/);

  assert.match(reveal, /PHONE_DEPTH_LAYERS/);
  assert.match(reveal, /data-phone-material="stacked-paper"/);
  assert.match(reveal, /data-jester-box-sting="true"/);
  assert.match(reveal, /y: \[-10, image\.apexY, image\.finalY\]/);
  assert.equal((reveal.match(/\{ apexX:/g) ?? []).length, 10);
});
