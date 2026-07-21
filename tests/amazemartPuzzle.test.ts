import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  isLumenArcSearch,
  isSellerCodeAccepted,
  normalizeSellerCode,
  shouldRevealSuppressedSeller,
} from '../src/lib/amazemartPuzzle';

test('Lumen Arc search accepts spacing variants but not a vague single clue', () => {
  assert.equal(isLumenArcSearch('Lumen Arc'), true);
  assert.equal(isLumenArcSearch('lumen-arc phone'), true);
  assert.equal(isLumenArcSearch('LUMENARC'), true);
  assert.equal(isLumenArcSearch('arc'), false);
  assert.equal(isLumenArcSearch('lumen'), false);
});

test('seller challenge only accepts the simple impossible score 184', () => {
  assert.equal(normalizeSellerCode(' 184 '), '184');
  assert.equal(isSellerCodeAccepted('184'), true);
  assert.equal(isSellerCodeAccepted(' 184 '), true);
  assert.equal(isSellerCodeAccepted('1 8 4'), false);
  assert.equal(isSellerCodeAccepted('ARC-184'), false);
  assert.equal(isSellerCodeAccepted('184-40-256'), false);
  assert.equal(isSellerCodeAccepted('40'), false);
});

test('suppressed seller remains hidden until the player scrolls into the feed', () => {
  const viewport = { scrollHeight: 900, clientHeight: 400 };

  assert.equal(shouldRevealSuppressedSeller({ ...viewport, scrollTop: 0 }), false);
  assert.equal(shouldRevealSuppressedSeller({ ...viewport, scrollTop: 179 }), false);
  assert.equal(shouldRevealSuppressedSeller({ ...viewport, scrollTop: 180 }), true);
  assert.equal(shouldRevealSuppressedSeller({ scrollTop: 200, scrollHeight: 400, clientHeight: 400 }), false);
});

test('Chapter 3 crosses from AmazeMart to Messages before returning for signature', () => {
  const source = readFileSync(new URL('../src/components/AmazeMart.tsx', import.meta.url), 'utf8');
  const messagesSource = readFileSync(new URL('../src/components/MessagesApp.tsx', import.meta.url), 'utf8');
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.match(source, /id="am-search-decoys"/);
  assert.match(source, /shouldRevealSuppressedSeller\(event\.currentTarget\)/);
  assert.match(source, /id="am-suppressed-seller"/);
  assert.match(source, /id="am-risk-confirmation"/);
  assert.match(source, /onRequestSellerVerification\(\)/);
  assert.match(source, /id="am-open-messages"/);
  assert.match(source, /id="am-awaiting-message"/);
  assert.match(source, /id="am-seller-delivery"/);
  assert.match(source, /id="am-sign-delivery"/);
  assert.match(source, /data-meta-immediate="true"/);
  assert.match(source, /data-meta-hit-recovery="true"/);
  assert.match(source, /setOrderRequestPending\(true\)/);
  assert.match(source, /tapElement\('am-buy-button'/);
  assert.match(source, /orderRequestPending \? 'REACHING\.\.\.' : 'ORDER INSTANT'/);
  assert.match(metaSource, /#home-dock button, button\[data-meta-hit-recovery="true"\]/);
  assert.match(metaSource, /const hitSlop = 16/);
  assert.match(metaSource, /element\.id === 'messages-seller-code'/);
  assert.match(phoneSource, /id="messages-seller-notification"/);
  assert.match(phoneSource, /setSellerMessageUnread\(true\)/);
  assert.match(phoneSource, /audio\.play\('messages\.incoming'\)/);
  assert.match(phoneSource, /chapterThreeOrderPhase=\{chapterThreeOrderPhase\}/);
  assert.match(messagesSource, /id="tab-seller"/);
  assert.match(messagesSource, /id="messages-seller-code-form"/);
  assert.match(messagesSource, /id="messages-seller-code"/);
  assert.match(messagesSource, /isSellerCodeAccepted\(sellerCode\)/);
  assert.match(messagesSource, /onSellerVerified\(\)/);
  assert.match(messagesSource, /id="messages-return-amazemart"/);
  assert.doesNotMatch(source, /id="am-seller-code"/);
  assert.match(source, /onClick=\{handleSignDelivery\}/);
  assert.match(source, /const handleSignDelivery[\s\S]*completePuzzleChapter\(prev, 3/);
  assert.doesNotMatch(source, /setTimeout\([\s\S]{0,300}completePuzzleChapter\(prev, 3/);
});
