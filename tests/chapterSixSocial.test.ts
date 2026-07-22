import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CHAPTER_SIX_POSTS,
  SKG_AUTOMATION_FACE_ADS,
  getChapterSixTimeline,
  getMaraCluePostIndex,
} from '../src/lib/chapterSixSocial';

const socialSource = readFileSync(new URL('../src/components/SocialApp.tsx', import.meta.url), 'utf8');
const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');

test('FaceSpace search starts with an SKG Automation ad wall until sorted by date', () => {
  const defaultTimeline = getChapterSixTimeline(false);
  assert.equal(SKG_AUTOMATION_FACE_ADS.length, 6);
  assert.deepEqual(defaultTimeline.slice(0, 6).map((entry) => entry.kind), Array(6).fill('ad'));
  assert.equal(getChapterSixTimeline(true)[0].kind, 'post');
  assert.match(socialSource, /data-timeline-order=\{sortOldest \? 'oldest-first' : 'sponsored-first'\}/);
});

test('Mara is hidden in the eighth oldest post and every post has expandable discussion', () => {
  assert.equal(getMaraCluePostIndex(), 7);
  assert.equal(CHAPTER_SIX_POSTS.length, 10);
  for (const post of CHAPTER_SIX_POSTS) {
    assert.ok(post.comments.length >= 2 && post.comments.length <= 3, post.id);
  }
  assert.match(socialSource, /data-comment-toggle=\{post\.id\}/);
  assert.match(socialSource, /data-mara-clue=\{comment\.clue === 'mara-kade' \? 'hidden-in-comment' : undefined\}/);
  assert.doesNotMatch(socialSource, /completePuzzleChapter\([^)]*,\s*6/);
});

test('FaceSpace uses two noise sidebars and never recommends Noah before search', () => {
  assert.match(socialSource, /id="social-three-column-layout"/);
  assert.match(socialSource, /id="social-left-sidebar"/);
  assert.match(socialSource, /id="social-right-sidebar"/);
  assert.doesNotMatch(socialSource, /id="social-noah-suggestion"/);
});

test('Chapter 6 only completes from Arcane Kade linked accounts after Mara is found', () => {
  assert.match(phoneSource, /data-profile-owner="Arcane Kade"/);
  assert.match(phoneSource, /id="home-profile-owner-name">Arcane Kade/);
  assert.match(phoneSource, /profilePageUnlocked = progress\.discoveredMotherComment \|\| progress\.currentChapter >= 7/);
  assert.match(phoneSource, /id="home-linked-accounts-toggle"/);
  assert.match(phoneSource, /id="home-mara-related-account"/);
  assert.match(phoneSource, /completePuzzleChapter\(prev, 6, \{ discoveredMotherComment: true \}\)/);
  const clueIndex = phoneSource.indexOf('const handleMaraFound');
  const completionIndex = phoneSource.indexOf('const confirmMaraFamilyAccount');
  assert.ok(clueIndex >= 0 && completionIndex > clueIndex);
});
