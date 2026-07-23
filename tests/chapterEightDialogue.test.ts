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

test('Messages wires collection, gentle restoration, and the legacy-profile completion gate', () => {
  assert.match(messagesSource, /handleCollectChapterEightMemory/);
  assert.match(messagesSource, /id="chapter-eight-memory-drawer"/);
  assert.match(messagesSource, /id="chapter-eight-restore-prompt"/);
  assert.match(messagesSource, /Not this memory\./);
  assert.match(messagesSource, /id="chapter-eight-legacy-profile-attachment"/);
  assert.match(messagesSource, /hasRestoredAllNoahFragments/);
  assert.match(messagesSource, /handleOpenLegacyChildProfile/);
  assert.match(messagesSource, /onClick=\{handleOpenLegacyChildProfile\}/);
  assert.match(
    messagesSource,
    /const handleOpenLegacyChildProfile = \(\) => \{\s*if \(!allNoahMessagesRestored\) return;[\s\S]{0,180}completePuzzleChapter\(prev, 8\)/,
  );
  assert.match(messagesSource, /LEGACY CHILD PROFILE · ACCESS LOCKED/);
  assert.match(messagesSource, /OPEN RECOVERY RECORD/);
  assert.doesNotMatch(messagesSource, /PRESERVE RESTORED HUMAN RECORD/);
  assert.ok(
    messagesSource.indexOf('NOAH_ARCHIVE_FRAGMENTS.map') < messagesSource.indexOf('id="chapter-eight-legacy-profile-attachment"'),
    'the final restored sentence must render before the Chapter 9 attachment',
  );
  assert.match(messagesSource, /getChapterEightMemorySelectionDialogue/);
  assert.match(messagesSource, /getNextNoahArchiveFragment\(restoredNoahMessages\)/);
  assert.match(messagesSource, /getAvailableChapterEightMemoryIds\(/);
  assert.match(messagesSource, /canRestoreNoahFragmentInOrder\(fragmentId, restoredNoahMessages\)/);
  assert.match(messagesSource, /data-restoration-order=/);
  assert.match(messagesSource, /disabled=\{!current\}/);
  assert.match(messagesSource, /data-available-answer-count=\{availableChapterEightMemories\.length\}/);
  assert.match(messagesSource, /sticky top-0/);
  assert.match(messagesSource, /data-memory-used=\{used\}/);
  assert.match(messagesSource, /availableChapterEightMemories\.map/);
  assert.doesNotMatch(messagesSource, /collectedChapterEightMemories\.map\(\(memoryId\) => \{[\s\S]{0,400}data-restore-choice/);
  assert.doesNotMatch(messagesSource, /onClick=\{handleOpenArchiveThread\}[\s\S]{0,120}completePuzzleChapter\(prev, 8\)/);
});
