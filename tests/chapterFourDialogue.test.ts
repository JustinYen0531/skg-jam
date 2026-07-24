import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CHAPTER_FOUR_DIALOGUE,
  getChapterFourClueDialogue,
  getChapterFourCompanionDialogue,
  getChapterFourDecoyDialogue,
  getChapterFourStalledDialogue,
  getChapterFourWrongAppDialogue,
  getChapterFourWrongDeliveryDialogue,
  type ChapterFourDecoySheetId,
  type ChapterFourWrongDeliveryId,
} from '../src/lib/chapterFourDialogue';

const wrongDeliveries: readonly ChapterFourWrongDeliveryId[] = ['tea', 'bulb', 'notebook', 'cable', 'filters', 'tape'];
const decoys: readonly ChapterFourDecoySheetId[] = ['battery', 'storage', 'box', 'network', 'othergame', 'lockscreen', 'about'];

test('Chapter 4 preserves the physical-to-photo reveal until the target package opens', () => {
  const chapterThree = readFileSync(new URL('../src/lib/chapterThreeDialogue.ts', import.meta.url), 'utf8');
  const messages = readFileSync(new URL('../src/components/MessagesApp.tsx', import.meta.url), 'utf8');
  const screenshots = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

  assert.deepEqual(CHAPTER_FOUR_DIALOGUE.packageOpened, [
    "Wait. No—no, that's not a phone.",
    'Those are screenshots. He sent me screenshots.',
  ]);
  assert.equal('packageAnger' in CHAPTER_FOUR_DIALOGUE, false);
  assert.deepEqual(CHAPTER_FOUR_DIALOGUE.packageDespair, ["There's nothing underneath.", "I paid for somebody else's leftovers."]);
  assert.deepEqual(CHAPTER_FOUR_DIALOGUE.packageResolve, ['Fine. Fine.', 'If this is all we have, then this is what we use.', "Let's see what these screenshots still know."]);
  assert.doesNotMatch(chapterThree, /sellerMatched: \[[^\]]*(?:no device|screenshots?|image packet)/i);
  assert.doesNotMatch(messages, /schematic packet has been delivered/i);
  assert.doesNotMatch(screenshots, /coldboot_17 · signed image packet attached[^\n]*target: true/);
});

test('every wrong parcel and decoy reacts twice, then becomes quiet', () => {
  const firstParcelLines = wrongDeliveries.map((id) => getChapterFourWrongDeliveryDialogue(id, 0)[0]);
  assert.equal(new Set(firstParcelLines).size, wrongDeliveries.length);
  for (const id of wrongDeliveries) {
    assert.ok(getChapterFourWrongDeliveryDialogue(id, 0).length > 0);
    assert.ok(getChapterFourWrongDeliveryDialogue(id, 1).length > 0);
    assert.deepEqual(getChapterFourWrongDeliveryDialogue(id, 2), []);
  }

  const firstDecoyLines = decoys.map((id) => getChapterFourDecoyDialogue(id, 0)[0]);
  assert.equal(new Set(firstDecoyLines).size, decoys.length);
  for (const id of decoys) {
    assert.ok(getChapterFourDecoyDialogue(id, 0).length > 0);
    assert.ok(getChapterFourDecoyDialogue(id, 1).length > 0);
    assert.deepEqual(getChapterFourDecoyDialogue(id, 2), []);
  }
});

test('clues, stalls, re-entry, revisit, wrong apps, and companion loops are covered', () => {
  for (const clueId of ['title', 'params', 'archive'] as const) {
    assert.ok(getChapterFourClueDialogue(clueId).length > 0);
    assert.ok(getChapterFourClueDialogue(clueId, 0).length > 0);
    assert.deepEqual(getChapterFourClueDialogue(clueId, 1), []);
  }
  assert.notDeepEqual(getChapterFourStalledDialogue(0), getChapterFourStalledDialogue(1));
  assert.notDeepEqual(getChapterFourCompanionDialogue(0), getChapterFourCompanionDialogue(1));
  assert.ok(CHAPTER_FOUR_DIALOGUE.packetReentered.length > 0);
  assert.ok(CHAPTER_FOUR_DIALOGUE.completedRevisit.length > 0);
  for (const app of ['browser', 'viewtube', 'amazemart', 'flappy', 'social', 'messages', 'about'] as const) {
    assert.ok(getChapterFourWrongAppDialogue(app, 0).length > 0, app);
  }
});

test('Chapter 4 dialogue stays English-only and inside its knowledge boundary', () => {
  const lines = [
    ...Object.values(CHAPTER_FOUR_DIALOGUE).flat(),
    ...wrongDeliveries.flatMap((id) => [0, 1, 2].flatMap((attempt) => getChapterFourWrongDeliveryDialogue(id, attempt))),
    ...decoys.flatMap((id) => [0, 1, 2].flatMap((attempt) => getChapterFourDecoyDialogue(id, attempt))),
    ...(['title', 'params', 'archive'] as const).flatMap((id) => [
      ...getChapterFourClueDialogue(id),
      ...getChapterFourClueDialogue(id, 0),
    ]),
    ...[0, 1].flatMap((attempt) => getChapterFourStalledDialogue(attempt)),
  ];
  for (const line of lines) assert.doesNotMatch(line, /[\u3400-\u9fff]/, line);
  const completionLines = new Set<string>(CHAPTER_FOUR_DIALOGUE.completed);
  const beforeCompletion = lines.filter((line) => !completionLines.has(line));
  assert.doesNotMatch(beforeCompletion.join(' '), /Silver Kite|Automation|Noah|Mara|Elias|password/i);
});

test('Chapter 4 dialogue is wired to every runtime interaction boundary', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const phone = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const screenshots = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

  assert.match(scene, /chapter === 4 && previousChapter !== 3/);
  assert.match(scene, /CHAPTER_FOUR_DIALOGUE\.entry/);
  assert.match(phone, /getChapterFourWrongAppDialogue/);
  assert.match(phone, /getChapterFourCompanionDialogue/);
  assert.match(phone, /CHAPTER_FOUR_DIALOGUE\.deliveriesOpened/);
  assert.match(phone, /CHAPTER_FOUR_DIALOGUE\.homeReturned/);
  assert.match(screenshots, /getChapterFourWrongDeliveryDialogue/);
  assert.match(screenshots, /getChapterFourDecoyDialogue/);
  assert.match(screenshots, /getChapterFourClueDialogue/);
  assert.match(screenshots, /getChapterFourStalledDialogue/);
  assert.match(screenshots, /CHAPTER_FOUR_DIALOGUE\.packetReentered/);
  assert.match(screenshots, /CHAPTER_FOUR_DIALOGUE\.completedRevisit/);
  assert.match(screenshots, /completedHere\.current = true/);
  assert.match(screenshots, /&& !completedHere\.current/);
  assert.match(screenshots, /CHAPTER_FOUR_DIALOGUE\.caseAssembled/);
  assert.match(screenshots, /CHAPTER_FOUR_DIALOGUE\.completed/);
  assert.match(screenshots, /let openingFinished = false;[\s\S]{0,120}let tappingFinished = false;[\s\S]{0,260}!openingFinished[\s\S]{0,100}!tappingFinished/);
  assert.match(screenshots, /speak\(CHAPTER_FOUR_DIALOGUE\.packageOpened, \(\) => \{[\s\S]{0,160}openingFinished = true;[\s\S]{0,160}tapSequence\('lumen-arc-frustration-tap-zone', 5, \(\) => \{[\s\S]{0,160}tappingFinished = true/);
  assert.match(screenshots, /aftermathStarted = true;[\s\S]{0,180}speak\(CHAPTER_FOUR_DIALOGUE\.packageDespair, \(\) => \{[\s\S]{0,180}speak\(CHAPTER_FOUR_DIALOGUE\.packageResolve\)/);
  assert.doesNotMatch(screenshots, /packageAnger|You sold me a stack of pictures|Come on\. Open\. Do something\./);
  assert.doesNotMatch(screenshots, /packageOpened[\s\S]{0,1000}setTimeout/);
  assert.match(screenshots, /data-sheet-kind=\{sheet\.clueId \? 'clue' : 'decoy'\}[\s\S]{0,100}data-meta-hit-recovery="true"/);
  assert.match(screenshots, /id="lumen-arc-frustration-tap-zone"/);
  assert.match(screenshots, /decoysSinceClue\.current % 3 === 0/);
  assert.match(screenshots, /caseDialogueTimer\.current = setTimeout/);
});
