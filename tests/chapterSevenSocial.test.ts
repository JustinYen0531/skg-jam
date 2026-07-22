import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getChapterSnapshot } from '../src/lib/chapterProgress';
import { getMaraNumberValue, hasAllMaraNumberClues, MARA_PROFILE_POSTS } from '../src/lib/chapterSevenSocial';

const socialSource = readFileSync(new URL('../src/components/SocialApp.tsx', import.meta.url), 'utf8');
const messagesSource = readFileSync(new URL('../src/components/MessagesApp.tsx', import.meta.url), 'utf8');

test('Mara owns three separate number clues inside a larger personal timeline', () => {
  assert.equal(MARA_PROFILE_POSTS.length, 9);
  const clues = MARA_PROFILE_POSTS.filter((post) => post.clue);
  assert.deepEqual(clues.map((post) => post.clue), ['altitude', 'gate', 'end']);
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
  assert.match(socialSource, /discoveredMaraAltitude184/);
  assert.match(socialSource, /discoveredMaraGate40/);
  assert.match(socialSource, /discoveredMaraEnd256/);
  assert.match(messagesSource, /completePuzzleChapter\(prev, 7, \{ unlockedAdminLogin: true, loggedIntoAdmin: true \}\)/);
  assert.doesNotMatch(messagesSource, /ASSEMBLE COORDINATE KEY/);
});

test('Chapter 8 begins at the restored index and opens the private thread', () => {
  assert.match(messagesSource, /progress\.currentChapter === 8/);
  assert.match(messagesSource, /id="admin-archive-index"/);
  assert.match(messagesSource, /id="messages-open-private-thread"/);
  assert.match(messagesSource, /completePuzzleChapter\(prev, 8\)/);
});
