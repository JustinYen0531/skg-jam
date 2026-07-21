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
  assert.equal(normalizeSellerCode(' 1-8-4 '), '184');
  assert.equal(isSellerCodeAccepted('184'), true);
  assert.equal(isSellerCodeAccepted('1 8 4'), true);
  assert.equal(isSellerCodeAccepted('ARC-184'), true);
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

test('AmazeMart requires warning, relay verification, and signature before chapter completion', () => {
  const source = readFileSync(new URL('../src/components/AmazeMart.tsx', import.meta.url), 'utf8');

  assert.match(source, /id="am-search-decoys"/);
  assert.match(source, /shouldRevealSuppressedSeller\(event\.currentTarget\)/);
  assert.match(source, /id="am-suppressed-seller"/);
  assert.match(source, /id="am-risk-confirmation"/);
  assert.match(source, /id="am-seller-notification"/);
  assert.match(source, /id="am-seller-relay"/);
  assert.match(source, /id="am-sign-delivery"/);
  assert.match(source, /onClick=\{handleSignDelivery\}/);
  assert.match(source, /const handleSignDelivery[\s\S]*completePuzzleChapter\(prev, 3/);
  assert.doesNotMatch(source, /setTimeout\([\s\S]{0,300}completePuzzleChapter\(prev, 3/);
});
