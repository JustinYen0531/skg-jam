import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAPTER_THREE_DIALOGUE } from '../src/lib/chapterThreeDialogue';
import { CHAPTER_SIX_DIALOGUE } from '../src/lib/chapterSixDialogue';
import { CHAPTER_SEVEN_DIALOGUE } from '../src/lib/chapterSevenDialogue';
import { CHAPTER_NINE_DIALOGUE } from '../src/lib/chapterNineDialogue';

test('cross-app handoffs receive protagonist guidance without exposing the solution', () => {
  assert.match(CHAPTER_THREE_DIALOGUE.sellerNotification.join(' '), /Messages/);
  assert.match(CHAPTER_SIX_DIALOGUE.maraCommentSelected.join(' '), /another page tied to the family backup/);
  assert.match(CHAPTER_SIX_DIALOGUE.profilePageOpened.join(' '), /linked accounts/);
  assert.match(CHAPTER_SEVEN_DIALOGUE.momMappingRead.join(' '), /Silver Kite account.*corner/);
  assert.match(CHAPTER_NINE_DIALOGUE.storageBlocked.join(' '), /Holding an icon.*tapping will not/);
});

test('phone handoffs move the badge and recent-use trace at the relevant chapter checkpoints', () => {
  const phone = readFileSync('src/components/PhoneSimulator.tsx', 'utf8');
  const messages = readFileSync('src/components/MessagesApp.tsx', 'utf8');

  assert.match(phone, /progress\.currentChapter === 3 && sellerMessageUnread[\s\S]{0,240}app: 'messages'[\s\S]{0,160}recentApp: 'amazemart'/);
  assert.match(phone, /progress\.currentChapter === 6 && progress\.discoveredMotherComment[\s\S]{0,140}recentApp: 'social'/);
  assert.match(phone, /chapterSevenReadyForMessages[\s\S]{0,260}app: 'messages'[\s\S]{0,160}recentApp: 'social'/);
  assert.match(phone, /id="home-profile-page-next"[\s\S]{0,520}Linked accounts have one new family record/);
  assert.match(messages, /id="messages-account-switch"[\s\S]{0,520}Silver Kite account has one new lead/);
});
