import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CHAPTER_EIGHT_DIALOGUE,
  getChapterEightFragmentRestoredDialogue,
  getChapterEightMemoryDialogue,
  getChapterEightMemorySelectionDialogue,
  getChapterEightThreadDialogue,
} from '../src/lib/chapterEightDialogue.ts';
import {
  CHAPTER_EIGHT_MEMORY_IDS,
  MARA_ARCHIVE_THREADS,
  NOAH_ARCHIVE_FRAGMENTS,
} from '../src/lib/chapterEightArchive.ts';

const messagesSource = readFileSync(new URL('../src/components/MessagesApp.tsx', import.meta.url), 'utf8');

test('Chapter 8 dialogue covers every life thread, memory, and damaged Noah message', () => {
  for (const thread of MARA_ARCHIVE_THREADS) {
    assert.ok(getChapterEightThreadDialogue(thread.id).length, thread.id);
  }
  for (const memoryId of CHAPTER_EIGHT_MEMORY_IDS) {
    assert.ok(getChapterEightMemoryDialogue(memoryId).length, memoryId);
  }
  for (const fragment of NOAH_ARCHIVE_FRAGMENTS) {
    assert.ok(getChapterEightFragmentRestoredDialogue(fragment.id).length, fragment.id);
    assert.ok(getChapterEightMemorySelectionDialogue(fragment.id, fragment.memoryId, false, 0).length);
  }
});

test('Chapter 8 dialogue preserves the Chapter 9 identity and route boundaries', () => {
  const dialogue = JSON.stringify({
    ...CHAPTER_EIGHT_DIALOGUE,
    threads: MARA_ARCHIVE_THREADS.map(({ id }) => getChapterEightThreadDialogue(id)),
    memories: CHAPTER_EIGHT_MEMORY_IDS.map((id) => getChapterEightMemoryDialogue(id)),
    fragments: NOAH_ARCHIVE_FRAGMENTS.map(({ id }) => getChapterEightFragmentRestoredDialogue(id)),
  });

  for (const altitude of [172, 149, 133, 121, 118, 126, 143]) {
    assert.doesNotMatch(dialogue, new RegExp(String(altitude)));
  }
  assert.doesNotMatch(dialogue, /I am ARC_184|Arcane is ARC_184|ARC_184 was me/i);
});

test('Messages wires collection, gentle restoration, sealed attachment, and completion gate', () => {
  assert.match(messagesSource, /handleCollectChapterEightMemory/);
  assert.match(messagesSource, /id="chapter-eight-memory-drawer"/);
  assert.match(messagesSource, /id="chapter-eight-restore-prompt"/);
  assert.match(messagesSource, /Not this memory\./);
  assert.match(messagesSource, /id="chapter-eight-route-attachment"/);
  assert.match(messagesSource, /hasRestoredAllNoahFragments/);
  assert.match(messagesSource, /id="chapter-eight-complete"/);
  assert.match(messagesSource, /getChapterEightMemorySelectionDialogue/);
  assert.doesNotMatch(messagesSource, /onClick=\{handleOpenArchiveThread\}[\s\S]{0,120}completePuzzleChapter\(prev, 8\)/);
});
