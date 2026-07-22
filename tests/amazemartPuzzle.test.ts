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

test('Chapter 3 completes immediately after the correct Messages reply', () => {
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
  assert.doesNotMatch(source, /id="am-seller-delivery"/);
  assert.doesNotMatch(source, /id="am-sign-delivery"/);
  assert.match(source, /data-meta-immediate="true"/);
  assert.match(source, /data-meta-hit-recovery="true"/);
  assert.match(source, /setOrderRequestPending\(true\)/);
  assert.match(source, /tapElement\('am-buy-button'/);
  assert.match(source, /orderRequestPending \? 'REACHING\.\.\.' : 'ORDER INSTANT'/);
  assert.match(metaSource, /#home-dock button, button\[data-meta-hit-recovery="true"\]/);
  assert.match(metaSource, /input\[data-meta-hit-recovery="true"\]/);
  assert.match(metaSource, /const hitSlop = 16/);
  assert.match(metaSource, /\['text', 'search', 'password', 'email', 'tel', 'url', 'number'\]\.includes\(element\.type\)/);
  assert.match(messagesSource, /registerInput\('messages-seller-code'/);
  assert.match(phoneSource, /id="messages-seller-notification"/);
  assert.match(phoneSource, /setSellerMessageUnread\(true\)/);
  assert.match(phoneSource, /audio\.play\('messages\.incoming'\)/);
  assert.match(phoneSource, /chapterThreeOrderPhase=\{chapterThreeOrderPhase\}/);
  assert.match(messagesSource, /id="tab-seller"/);
  assert.match(messagesSource, /id="messages-seller-code-form"/);
  assert.match(messagesSource, /id="messages-seller-code"/);
  assert.match(messagesSource, /placeholder="Text Message"[\s\S]{0,180}data-meta-immediate="true"[\s\S]{0,100}data-meta-hit-recovery="true"/);
  assert.match(messagesSource, /type="submit" data-meta-immediate="true" data-meta-hit-recovery="true"[\s\S]{0,240}id="messages-submit-seller-code"/);
  assert.match(messagesSource, /isSellerCodeAccepted\(sellerCode\)/);
  assert.match(messagesSource, /onSellerVerified\(\)/);
  assert.doesNotMatch(messagesSource, /id="messages-return-amazemart"/);
  assert.doesNotMatch(source, /id="am-seller-code"/);
  assert.match(phoneSource, /const handleSellerVerified[\s\S]{0,240}completePuzzleChapter\(prev, 3/);
  assert.doesNotMatch(source, /handleSignDelivery|SIGN FOR DELIVERY/);
});

test('projected bottom inputs focus and submit on pointer-down before posture movement', () => {
  const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.match(metaSource, /const directControl = source\.closest<HTMLElement>\(selector\)/);
  assert.match(metaSource, /if \(!directControl && source\.closest\('button, input'\)\) return/);
  assert.match(metaSource, /control instanceof HTMLInputElement[\s\S]{0,180}control\.focus\(\{ preventScroll: true \}\)/);
  assert.match(metaSource, /isMetaKeyboardInput\(control\)\) setKeyboardTarget\(control\)/);
  assert.match(metaSource, /control instanceof HTMLButtonElement && !control\.disabled\) control\.click\(\)/);
});

test('both projected Messages entry points open reliably from the system notification layer', () => {
  const martSource = readFileSync(new URL('../src/components/AmazeMart.tsx', import.meta.url), 'utf8');
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const martButton = martSource.slice(
    martSource.lastIndexOf('<button', martSource.indexOf('id="am-open-messages"')),
    martSource.indexOf('</button>', martSource.indexOf('id="am-open-messages"')),
  );
  const notification = phoneSource.slice(
    phoneSource.lastIndexOf('<motion.button', phoneSource.indexOf('id="messages-seller-notification"')),
    phoneSource.indexOf('</motion.button>', phoneSource.indexOf('id="messages-seller-notification"')),
  );

  assert.match(martButton, /onPointerDown=\{\(event\) => \{[\s\S]*onOpenMessages\(\)/);
  assert.match(martButton, /if \(event\.detail !== 0\) return;[\s\S]*onOpenMessages\(\)/);
  assert.match(martButton, /data-meta-immediate="true"/);
  assert.match(martButton, /data-meta-hit-recovery="true"/);

  assert.match(phoneSource, /const handleSellerMessagePointerDown[\s\S]{0,220}handleLaunchApp\('messages'\)/);
  assert.match(notification, /onPointerDown=\{handleSellerMessagePointerDown\}/);
  assert.match(notification, /onClick=\{handleSellerMessageClick\}/);
  assert.match(notification, /data-meta-hit-recovery="true"/);
  assert.match(notification, /data-system-notification="incoming-message"/);
  assert.match(notification, /absolute left-1\/2 top-3[\s\S]*-translate-x-1\/2/);
  assert.match(notification, /Cognitive Investigation/);
  assert.doesNotMatch(notification, /absolute right-3|>OPEN</);
});
