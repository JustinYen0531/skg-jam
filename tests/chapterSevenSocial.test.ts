import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getChapterSnapshot } from '../src/lib/chapterProgress';
import {
  getMaraNumberValue,
  hasAllMaraNumberClues,
  isMaraCoordinateMappingCorrect,
  MARA_COLLECTIBLE_NUMBERS,
  MARA_PROFILE_POSTS,
} from '../src/lib/chapterSevenSocial';

const socialSource = readFileSync(new URL('../src/components/SocialApp.tsx', import.meta.url), 'utf8');
const messagesSource = readFileSync(new URL('../src/components/MessagesApp.tsx', import.meta.url), 'utf8');

test('Mara owns three separate number clues inside a larger personal timeline', () => {
  assert.equal(MARA_PROFILE_POSTS.length, 9);
  const clues = MARA_PROFILE_POSTS.filter((post) => post.clue);
  assert.deepEqual(clues.map((post) => post.clue), ['arc', 'gate', 'end']);
  assert.deepEqual(clues.map((post) => getMaraNumberValue(post.clue!)), [184, 40, 256]);
  assert.doesNotMatch(MARA_PROFILE_POSTS.map((post) => post.content).join(' '), /184\s*[-–—/]\s*40\s*[-–—/]\s*256/);
});

test('Chapter 7 re-entry exposes Mara through Recently viewed instead of Noah Q&A', () => {
  assert.match(socialSource, /id="social-recently-viewed"/);
  assert.match(socialSource, /social-recent-mara/);
  assert.match(socialSource, /setActiveProfile\('mara'\)/);
  assert.doesNotMatch(socialSource, /My favorite coordinate is/);
  assert.doesNotMatch(socialSource, /184-40-256/);
});

test('all three Mara posts are persistent evidence required by the archive login', () => {
  assert.equal(hasAllMaraNumberClues(getChapterSnapshot(7)), false);
  assert.equal(hasAllMaraNumberClues(getChapterSnapshot(8)), true);
  assert.match(socialSource, /discoveredMaraArc184/);
  assert.match(socialSource, /discoveredMaraGate40/);
  assert.match(socialSource, /discoveredMaraEnd256/);
  assert.match(socialSource, /data-mara-number=\{clueValue\}/);
  assert.match(socialSource, /underline decoration-2 underline-offset-2/);
  assert.match(socialSource, /COLLECTED/);
  assert.doesNotMatch(socialSource, /Remember this place/);
  assert.match(messagesSource, /completePuzzleChapter\(prev, 7, \{ unlockedAdminLogin: true, loggedIntoAdmin: true \}\)/);
});

test('collecting the three numbers unlocks a separate ARC GATE END mapping puzzle', () => {
  assert.deepEqual(MARA_COLLECTIBLE_NUMBERS, [184, 40, 256]);
  assert.equal(isMaraCoordinateMappingCorrect({ arc: 184, gate: 40, end: 256 }), true);
  assert.equal(isMaraCoordinateMappingCorrect({ arc: 40, gate: 184, end: 256 }), false);
  assert.match(messagesSource, /id="archive-number-collection-lock"/);
  assert.match(messagesSource, /id="archive-coordinate-mapping"/);
  assert.match(messagesSource, /id=\{`archive-map-\$\{label\}`\}/);
  assert.match(messagesSource, /isMaraCoordinateMappingCorrect\(coordinateMapping\)/);
  assert.match(messagesSource, /unlockedAdminLogin: true/);
  assert.match(messagesSource, /id="archive-password-stage"/);
  assert.match(messagesSource, /data-admin-stage=/);
});

test('Chapter 8 begins at the restored index and completes only after restoring the private thread', () => {
  assert.match(messagesSource, /progress\.currentChapter === 8/);
  assert.match(messagesSource, /id="admin-archive-index"/);
  assert.match(messagesSource, /id="messages-open-private-thread"/);
  assert.match(messagesSource, /hasRestoredAllNoahFragments\(restoredNoahMessages\)/);
  assert.match(messagesSource, /if \(!allNoahMessagesRestored\) return/);
  assert.match(messagesSource, /id="chapter-eight-legacy-profile-attachment"/);
  assert.match(messagesSource, /onClick=\{handleOpenLegacyChildProfile\}/);
  assert.match(messagesSource, /completePuzzleChapter\(prev, 8\)/);
});
