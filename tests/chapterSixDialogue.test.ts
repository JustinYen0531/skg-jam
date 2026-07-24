import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CHAPTER_SIX_DIALOGUE,
  classifyChapterSixSearch,
  getChapterSixAdDialogue,
  getChapterSixCommentDialogue,
  getChapterSixCompanionDialogue,
  getChapterSixNoiseDialogue,
  getChapterSixPostDialogue,
  getChapterSixSearchDialogue,
  getChapterSixWrongAppDialogue,
  type ChapterSixNoiseKind,
} from '../src/lib/chapterSixDialogue';

const noiseKinds: readonly ChapterSixNoiseKind[] = ['home-feed', 'left-sidebar', 'right-sidebar', 'sidebar-ad'];

test('Chapter 6 dialogue covers search, feed noise, ads, posts, comments, and wrong apps', () => {
  for (const kind of noiseKinds) assert.ok(getChapterSixNoiseDialogue(kind, 0).length > 0, kind);
  for (const id of ['ad-1', 'ad-2', 'ad-3', 'ad-4', 'ad-5', 'ad-6']) assert.ok(getChapterSixAdDialogue(id, 0).length > 0, id);
  for (const id of ['noah-2010-02', 'noah-2011-03', 'noah-2012-04', 'noah-2012-12', 'noah-2013-06', 'noah-2014-04', 'noah-2014-08', 'noah-2014-10']) assert.ok(getChapterSixPostDialogue(id, 0).length > 0, id);
  for (const app of ['flappy', 'viewtube', 'amazemart', 'browser', 'messages', 'screenshots', 'about'] as const) assert.ok(getChapterSixWrongAppDialogue(app, 0).length > 0, app);
  assert.notDeepEqual(getChapterSixCommentDialogue(false, 0), getChapterSixCommentDialogue(false, 1));
  assert.deepEqual(getChapterSixCommentDialogue(true, 0), CHAPTER_SIX_DIALOGUE.maraNameVisible);
  assert.notDeepEqual(getChapterSixCompanionDialogue(0), getChapterSixCompanionDialogue(1));
});

test('Chapter 6 search responses distinguish known premature names without unlocking Noah', () => {
  assert.equal(classifyChapterSixSearch(''), 'empty');
  assert.equal(classifyChapterSixSearch('Mara Kade'), 'mara');
  assert.equal(classifyChapterSixSearch('Elias Vale'), 'elias');
  assert.equal(classifyChapterSixSearch('Silver Kite Games'), 'studio');
  assert.equal(classifyChapterSixSearch('someone else'), 'other');
  for (const query of ['', 'Mara', 'Elias Vale', 'SKG', 'someone else']) assert.ok(getChapterSixSearchDialogue(query).length > 0, query);
});

test('Chapter 6 remains English-only and does not leak Chapter 7 or the later ARC identity reveal', () => {
  const allLines = [
    ...Object.values(CHAPTER_SIX_DIALOGUE).flat(),
    ...noiseKinds.flatMap((kind) => getChapterSixNoiseDialogue(kind, 0)),
    ...['ad-1', 'ad-2', 'ad-3', 'ad-4', 'ad-5', 'ad-6'].flatMap((id) => getChapterSixAdDialogue(id, 0)),
    ...['noah-2010-02', 'noah-2011-03', 'noah-2012-04', 'noah-2012-12', 'noah-2013-06', 'noah-2014-04', 'noah-2014-08', 'noah-2014-10'].flatMap((id) => getChapterSixPostDialogue(id, 0)),
  ];
  for (const line of allLines) assert.doesNotMatch(line, /[\u3400-\u9fff]/, line);
  assert.doesNotMatch(allLines.join(' '), /184-40-256|ALT184|password|ARC_?184|hidden route|old account/i);

  const beforeMaraSelection = [
    ...CHAPTER_SIX_DIALOGUE.entry,
    ...CHAPTER_SIX_DIALOGUE.homeReturned,
    ...CHAPTER_SIX_DIALOGUE.socialOpened,
    ...CHAPTER_SIX_DIALOGUE.searchFocused,
    ...CHAPTER_SIX_DIALOGUE.profileLoaded,
    ...CHAPTER_SIX_DIALOGUE.sponsoredWallVisible,
    ...CHAPTER_SIX_DIALOGUE.sortedOldest,
    ...CHAPTER_SIX_DIALOGUE.earlyTimelineRead,
    ...CHAPTER_SIX_DIALOGUE.recallPostRead,
    ...CHAPTER_SIX_DIALOGUE.maraNameVisible,
  ].join(' ');
  assert.doesNotMatch(beforeMaraSelection, /my father|I am the child|left for me/i);
  assert.doesNotMatch(CHAPTER_SIX_DIALOGUE.maraCommentSelected.join(' '), /my father|I am the child/i);
  assert.match(CHAPTER_SIX_DIALOGUE.completed.join(' '), /I am the child/);
  assert.match(CHAPTER_SIX_DIALOGUE.completed.join(' '), /remember Dad/);
  assert.match(CHAPTER_SIX_DIALOGUE.completed.join(' '), /Noah was the name/);
  assert.doesNotMatch(Object.values(CHAPTER_SIX_DIALOGUE).flat().join(' '), /dead man/i);
});

test('Chapter 6 dialogue is wired to Meta entry, Phone navigation, and FaceSpace investigation events', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const phone = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const social = readFileSync(new URL('../src/components/SocialApp.tsx', import.meta.url), 'utf8');

  assert.match(scene, /CHAPTER_SIX_DIALOGUE\.entry/);
  assert.match(phone, /getChapterSixWrongAppDialogue/);
  assert.match(phone, /getChapterSixCompanionDialogue/);
  assert.match(phone, /CHAPTER_SIX_DIALOGUE\.profilePageOpened/);
  assert.match(phone, /CHAPTER_SIX_DIALOGUE\.completed/);
  assert.match(social, /CHAPTER_SIX_DIALOGUE\.profileLoaded/);
  assert.match(social, /getChapterSixSearchDialogue/);
  assert.match(social, /getChapterSixNoiseDialogue/);
  assert.match(social, /getChapterSixAdDialogue/);
  assert.match(social, /getChapterSixPostDialogue/);
  assert.match(social, /getChapterSixCommentDialogue/);
});
