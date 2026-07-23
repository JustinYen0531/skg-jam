import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTER_EIGHT_MEMORY_IDS,
  MARA_ARCHIVE_THREADS,
  NOAH_ARCHIVE_FRAGMENTS,
  addUniqueChapterEightId,
  getChapterEightMemory,
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

test('the human archive never leaks the Chapter 9 altitude attachment', () => {
  const humanArchive = JSON.stringify(MARA_ARCHIVE_THREADS);
  for (const altitude of [172, 149, 133, 121, 118, 126, 143]) {
    assert.doesNotMatch(humanArchive, new RegExp(String(altitude)));
  }

  const ceiling = NOAH_ARCHIVE_FRAGMENTS.find(({ id }) => id === 'ceiling');
  assert.match(ceiling?.restoredText ?? '', /Not my signature/);
  assert.doesNotMatch(JSON.stringify(NOAH_ARCHIVE_FRAGMENTS), /ARC_184\s*=\s*Noah/i);
});
