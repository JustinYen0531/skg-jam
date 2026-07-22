import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CHAPTER_FIVE_DIALOGUE,
  getChapterFiveArchiveDetailDialogue,
  getChapterFiveBotDialogue,
  getChapterFiveCompanionDialogue,
  getChapterFiveCorporateDetailDialogue,
  getChapterFiveDeadFragmentDialogue,
  getChapterFiveDecoyDialogue,
  getChapterFiveEmptyYearDialogue,
  getChapterFiveOffTopicDialogue,
  getChapterFivePortalDialogue,
  getChapterFiveRepeatedTraceDialogue,
  getChapterFiveTraceDialogue,
  getChapterFiveWrongAppDialogue,
  type ChapterFiveArchiveDetailId,
  type ChapterFiveBotTopic,
  type ChapterFiveCorporateDetailId,
  type ChapterFiveDecoyResultId,
  type ChapterFiveNoahTraceId,
} from '../src/lib/chapterFiveDialogue';

const decoys: readonly ChapterFiveDecoyResultId[] = [
  'smart-kitchen', 'secure-key', 'knowledge-grid', 'kinetic-goods', 'slang', 'airport', 'mirror',
];
const botTopics: readonly ChapterFiveBotTopic[] = ['ownership', 'creator', 'restore', 'freeform'];
const corporateDetails: readonly ChapterFiveCorporateDetailId[] = ['stats', 'leadership', 'footer'];
const archiveDetails: readonly ChapterFiveArchiveDetailId[] = ['lumen-arc', 'why-256', 'hidden-route', 'recall', 'guestbook-warning'];
const traces: readonly ChapterFiveNoahTraceId[] = ['studio-credit', 'developer-note', 'cofounder-credit'];

test('every Chapter 5 search decoy reacts once with a distinct line, then becomes quiet', () => {
  const firstLines = decoys.map((id) => getChapterFiveDecoyDialogue(id, 0)[0]);
  assert.equal(new Set(firstLines).size, decoys.length);
  for (const id of decoys) {
    assert.ok(getChapterFiveDecoyDialogue(id, 0).length > 0, id);
    assert.deepEqual(getChapterFiveDecoyDialogue(id, 1), [], id);
  }
});

test('wrong searches, portals, empty years, bot replies, and wrong apps all acknowledge interaction', () => {
  assert.notDeepEqual(getChapterFiveOffTopicDialogue(0), getChapterFiveOffTopicDialogue(1));
  assert.notDeepEqual(getChapterFivePortalDialogue(0), getChapterFivePortalDialogue(1));
  assert.notDeepEqual(getChapterFiveEmptyYearDialogue(2020, 0), getChapterFiveEmptyYearDialogue(2020, 1));
  assert.notDeepEqual(getChapterFiveEmptyYearDialogue(2010, 0), getChapterFiveEmptyYearDialogue(2010, 1));
  assert.match(getChapterFiveEmptyYearDialogue(2009, 0).join(' '), /bottoms out/i);
  for (const topic of botTopics) assert.ok(getChapterFiveBotDialogue(topic).length > 0, topic);
  for (const app of ['flappy', 'viewtube', 'amazemart', 'social', 'messages', 'screenshots', 'about'] as const) {
    assert.ok(getChapterFiveWrongAppDialogue(app, 0).length > 0, app);
  }
  assert.notDeepEqual(getChapterFiveCompanionDialogue(0), getChapterFiveCompanionDialogue(1));
});

test('corporate details, archive fragments, and three distinct Noah references have dialogue coverage', () => {
  for (const id of corporateDetails) {
    assert.ok(getChapterFiveCorporateDetailDialogue(id, 0).length > 0, id);
    assert.deepEqual(getChapterFiveCorporateDetailDialogue(id, 1), [], id);
  }
  for (const id of archiveDetails) {
    assert.ok(getChapterFiveArchiveDetailDialogue(id, 0).length > 0, id);
    assert.deepEqual(getChapterFiveArchiveDetailDialogue(id, 1), [], id);
  }
  assert.ok(getChapterFiveDeadFragmentDialogue(0).length > 0);
  assert.deepEqual(getChapterFiveDeadFragmentDialogue(3), []);
  for (const trace of traces) {
    assert.ok(getChapterFiveTraceDialogue(trace, 0).length > 0, trace);
    assert.ok(getChapterFiveTraceDialogue(trace, 1).length > 0, trace);
    assert.ok(getChapterFiveRepeatedTraceDialogue(trace, 0).length > 0, trace);
    assert.deepEqual(getChapterFiveRepeatedTraceDialogue(trace, 1), [], trace);
  }
  assert.match(CHAPTER_FIVE_DIALOGUE.completed.join(' '), /Noah Kade/);
});

test('Chapter 5 dialogue stays English-only and preserves the pre-archive knowledge boundary', () => {
  const allLines = [
    ...Object.values(CHAPTER_FIVE_DIALOGUE).flat(),
    ...decoys.flatMap((id) => getChapterFiveDecoyDialogue(id, 0)),
    ...botTopics.flatMap((topic) => getChapterFiveBotDialogue(topic)),
    ...corporateDetails.flatMap((id) => getChapterFiveCorporateDetailDialogue(id, 0)),
    ...archiveDetails.flatMap((id) => getChapterFiveArchiveDetailDialogue(id, 0)),
    ...traces.flatMap((id) => getChapterFiveTraceDialogue(id, 0)),
  ];
  for (const line of allLines) assert.doesNotMatch(line, /[\u3400-\u9fff]/, line);

  const preArchiveLines = [
    ...CHAPTER_FIVE_DIALOGUE.entry,
    ...CHAPTER_FIVE_DIALOGUE.homeReturned,
    ...CHAPTER_FIVE_DIALOGUE.browserOpened,
    ...CHAPTER_FIVE_DIALOGUE.searchFinderVisible,
    ...CHAPTER_FIVE_DIALOGUE.searchFocused,
    ...CHAPTER_FIVE_DIALOGUE.relatedSearch,
    ...CHAPTER_FIVE_DIALOGUE.bridgeOpened,
    ...CHAPTER_FIVE_DIALOGUE.corporateVisible,
    ...CHAPTER_FIVE_DIALOGUE.botOpened,
    ...CHAPTER_FIVE_DIALOGUE.snapshotNoticed,
    ...decoys.flatMap((id) => getChapterFiveDecoyDialogue(id, 0)),
    ...botTopics.flatMap((topic) => getChapterFiveBotDialogue(topic)),
    ...corporateDetails.flatMap((id) => getChapterFiveCorporateDetailDialogue(id, 0)),
  ].join(' ');
  assert.doesNotMatch(preArchiveLines, /Silver Kite|Noah Kade|Elias|Mara|password/i);
});

test('Chapter 5 dialogue is wired to the Browser, phone, direct debug entry, and final three-name gate', () => {
  const browser = readFileSync(new URL('../src/components/BrowserApp.tsx', import.meta.url), 'utf8');
  const phone = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.match(scene, /chapter === 5 && previousChapter !== 4/);
  assert.match(scene, /CHAPTER_FIVE_DIALOGUE\.entry/);
  assert.match(phone, /CHAPTER_FIVE_DIALOGUE\.browserOpened/);
  assert.match(phone, /getChapterFiveWrongAppDialogue/);
  assert.match(phone, /getChapterFiveCompanionDialogue/);
  assert.match(browser, /onFocus=\{handleChapterFiveSearchFocus\}/);
  assert.match(browser, /getChapterFiveDecoyDialogue/);
  assert.match(browser, /getChapterFiveOffTopicDialogue/);
  assert.match(browser, /getChapterFivePortalDialogue/);
  assert.match(browser, /getChapterFiveBotDialogue/);
  assert.match(browser, /getChapterFiveEmptyYearDialogue/);
  assert.match(browser, /getChapterFiveCorporateDetailDialogue/);
  assert.match(browser, /getChapterFiveArchiveDetailDialogue/);
  assert.match(browser, /getChapterFiveDeadFragmentDialogue/);
  assert.match(browser, /speakChapterFive\(CHAPTER_FIVE_DIALOGUE\.archiveLoaded\)/);

  const traceHandler = browser.slice(browser.indexOf('const handleNoahTrace'), browser.indexOf('const renderNoahTrace'));
  assert.match(traceHandler, /getChapterFiveRepeatedTraceDialogue\(traceId, attempt\)/);
  assert.match(traceHandler, /getChapterFiveTraceDialogue\(traceId, next\.length - 1\)/);
  assert.match(traceHandler, /if \(next\.length === NOAH_TRACE_IDS\.length\)/);
  assert.match(traceHandler, /speakChapterFive\(CHAPTER_FIVE_DIALOGUE\.completed\)/);
  assert.match(traceHandler, /completePuzzleChapter\(prev, 5, \{ discoveredSKGHistory: true \}\)/);
});
