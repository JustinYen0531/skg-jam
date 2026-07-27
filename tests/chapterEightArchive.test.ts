import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CHAPTER_EIGHT_MEMORY_IDS,
  MARA_ARCHIVE_THREADS,
  NOAH_ARCHIVE_FRAGMENTS,
  addUniqueChapterEightId,
  canRestoreNoahFragmentInOrder,
  getAvailableChapterEightMemoryIds,
  getChapterEightMemory,
  getNextNoahArchiveFragment,
  hasRestoredAllNoahFragments,
  isCorrectNoahMemory,
} from '../src/lib/chapterEightArchive.ts';

test('Chapter 8 has one collectible memory in each human thread and eight damaged Noah messages', () => {
  const humanThreads = MARA_ARCHIVE_THREADS.filter((thread) => !thread.isCase);
  assert.equal(humanThreads.length, 8);
  assert.equal(CHAPTER_EIGHT_MEMORY_IDS.length, humanThreads.length);
  assert.equal(new Set(CHAPTER_EIGHT_MEMORY_IDS).size, humanThreads.length);
  assert.equal(NOAH_ARCHIVE_FRAGMENTS.length, 8);

  for (const thread of humanThreads) {
    assert.equal(thread.messages.filter((message) => message.memory).length, 1, thread.id);
  }
});

test('every damaged Noah message accepts exactly its matching recovered memory', () => {
  for (const fragment of NOAH_ARCHIVE_FRAGMENTS) {
    assert.ok(getChapterEightMemory(fragment.memoryId));
    assert.equal(isCorrectNoahMemory(fragment.id, fragment.memoryId), true);
    const wrong = CHAPTER_EIGHT_MEMORY_IDS.find((id) => id !== fragment.memoryId);
    assert.ok(wrong);
    assert.equal(isCorrectNoahMemory(fragment.id, wrong), false);
  }
});

test('Chapter 8 progress helpers deduplicate clues and require all damaged messages', () => {
  assert.deepEqual(addUniqueChapterEightId(['silver-kite'], 'silver-kite'), ['silver-kite']);
  assert.deepEqual(addUniqueChapterEightId([], 'silver-kite'), ['silver-kite']);
  assert.equal(hasRestoredAllNoahFragments(NOAH_ARCHIVE_FRAGMENTS.slice(0, -1).map(({ id }) => id)), false);
  assert.equal(hasRestoredAllNoahFragments(NOAH_ARCHIVE_FRAGMENTS.map(({ id }) => id)), true);
});

test('Noah messages restore in order while collected answers grow and used answers disappear', () => {
  const [first, second] = NOAH_ARCHIVE_FRAGMENTS;
  assert.equal(getNextNoahArchiveFragment([])?.id, first.id);
  assert.equal(canRestoreNoahFragmentInOrder(first.id, []), true);
  assert.equal(canRestoreNoahFragmentInOrder(second.id, []), false);

  assert.deepEqual(getAvailableChapterEightMemoryIds([], []), []);
  assert.deepEqual(
    getAvailableChapterEightMemoryIds([first.memoryId, second.memoryId], []),
    [first.memoryId, second.memoryId],
  );
  assert.deepEqual(
    getAvailableChapterEightMemoryIds([first.memoryId, second.memoryId], [first.id]),
    [second.memoryId],
  );
  assert.equal(getNextNoahArchiveFragment([first.id])?.id, second.id);
});

test('the human archive never leaks the Chapter 9 altitude attachment', () => {
  const humanArchive = JSON.stringify(MARA_ARCHIVE_THREADS);
  for (const altitude of [172, 149, 133, 121, 118, 126, 143]) {
    assert.doesNotMatch(humanArchive, new RegExp(String(altitude)));
  }

  const ceiling = NOAH_ARCHIVE_FRAGMENTS.find(({ id }) => id === 'ceiling');
  assert.match(ceiling?.restoredText ?? '', /Not my signature/);
  assert.doesNotMatch(JSON.stringify(NOAH_ARCHIVE_FRAGMENTS), /ARC_184\s*=\s*Noah/i);
});

test('the player Mom thread mirrors the recovered window-seat exchange without early identity spoilers', () => {
  const messagesSource = readFileSync(new URL('../src/components/MessagesApp.tsx', import.meta.url), 'utf8');
  const sonThread = MARA_ARCHIVE_THREADS.find(({ id }) => id === 'son');
  assert.ok(sonThread);
  const windowExchange = sonThread.messages.slice(0, 3);

  assert.deepEqual(windowExchange.map(({ from }) => from), ['mara', 'them', 'mara']);
  assert.deepEqual(windowExchange.map(({ text }) => text), [
    'Look at you. Taller than the door frame already. Come home before the harbor lights go out.',
    'Next month, I promise. Save me the window seat.',
    'It is always your window seat. It has your name on it, even the days I forget to write it.',
  ]);
  assert.match(messagesSource, /getMaraArchiveThread\('son'\)\?\.messages\.slice\(0, 3\)/);
  assert.match(messagesSource, /message\.from === 'mara' \? 'mom' as const : 'me' as const/);

  assert.doesNotMatch(messagesSource, /I found the old Silver Kite pages/);
  assert.doesNotMatch(messagesSource, /And your FaceSpace profile/);
  assert.doesNotMatch(messagesSource, /The old login asked for ARC, gate, and end/);
  assert.doesNotMatch(messagesSource, /My memory wanders, but the Silver Kite archive/);
  assert.doesNotMatch(messagesSource, /Mom \(Mara\)/);
  assert.match(messagesSource, /id: 'mom', name: 'Mom', initials: 'M'/);
  assert.match(messagesSource, /activeThread === 'mom'\s*\? 'Mom'/);
  const momPanel = messagesSource.slice(
    messagesSource.indexOf("activeThread === 'mom' ?"),
    messagesSource.indexOf("activeThread === 'jules'"),
  );
  assert.match(momPanel, /msg\.sender === 'me'[\s\S]{0,220}bg-\[#2f7d60\]/);
  assert.match(momPanel, /bg-\[#1d212b\] text-slate-200/);
  assert.doesNotMatch(momPanel, /Mara is typing|Mara's memories|father's database credentials/);
  assert.doesNotMatch(momPanel, /sweetheart did you eat|Message unavailable|voice message/);
});

test('the archive treats Arcane as an existing young son and leaves Noah missing', () => {
  const archive = JSON.stringify(MARA_ARCHIVE_THREADS);
  const fragments = JSON.stringify(NOAH_ARCHIVE_FRAGMENTS);
  assert.doesNotMatch(`${archive} ${fragments}`, /future son|unborn|child we have not met/i);
  assert.match(archive, /young son/);
  assert.match(fragments, /our son, until he was old enough/);

  const noah = MARA_ARCHIVE_THREADS.find(({ id }) => id === 'noah');
  assert.match(noah?.subtitle ?? '', /status unknown/i);
  assert.match(noah?.preview ?? '', /no confirmed departure record/i);
});
