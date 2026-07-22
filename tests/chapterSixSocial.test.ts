import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CHAPTER_SIX_POSTS,
  DEFAULT_RELEVANCE_POST_IDS,
  SKG_AUTOMATION_FACE_ADS,
  getChapterSixTimeline,
  getMaraCluePostIndex,
} from '../src/lib/chapterSixSocial';

const socialSource = readFileSync(new URL('../src/components/SocialApp.tsx', import.meta.url), 'utf8');
const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');

test('FaceSpace search starts with an SKG Automation ad wall until sorted by date', () => {
  const defaultTimeline = getChapterSixTimeline(false);
  const defaultPosts = defaultTimeline.filter((entry) => entry.kind === 'post');
  const oldestTimeline = getChapterSixTimeline(true);
  assert.equal(SKG_AUTOMATION_FACE_ADS.length, 6);
  assert.deepEqual(defaultTimeline.slice(0, 6).map((entry) => entry.kind), Array(6).fill('ad'));
  assert.equal(defaultTimeline.length, 9);
  assert.deepEqual(defaultPosts.map((post) => post.id), [...DEFAULT_RELEVANCE_POST_IDS]);
  assert.ok(defaultPosts.every((post) => !post.comments.some((comment) => comment.clue === 'mara-kade')));
  assert.equal(oldestTimeline[0].kind, 'post');
  assert.equal(oldestTimeline.filter((entry) => entry.kind === 'post').length, 10);
  assert.match(socialSource, /data-timeline-order=\{sortOldest \? 'oldest-first' : 'sponsored-first'\}/);
  assert.match(socialSource, /id="social-relevance-archive-limit"/);
  assert.match(socialSource, /data-hidden-post-count=\{hiddenPostCount\}/);
  assert.match(socialSource, /Chronological view is required to load the complete public archive/);
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

test('the personal profile replaces only the right-side app grid', () => {
  assert.match(phoneSource, /id="home-right-page-content"/);
  assert.match(phoneSource, /homePage === 0 \? \(/);
  assert.match(phoneSource, /id="home-personal-profile-page"/);
  assert.doesNotMatch(phoneSource, /className="absolute inset-0 z-40[^\"]*"[\s\S]{0,180}id="home-personal-profile-page"/);
  assert.ok(phoneSource.indexOf('id="home-widget"') < phoneSource.indexOf('id="home-right-page-content"'));
  assert.ok(phoneSource.indexOf('id="home-personal-profile-page"') < phoneSource.indexOf('id="home-dock"'));
});
