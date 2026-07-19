import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  applyVirtualKey,
  canStartMetaInteraction,
  normalizeVirtualKey,
  shouldRevealMetaView,
} from '../src/lib/metaInteraction';

test('meta camera reveal requires both a second Gate 37 death and an opened leaderboard', () => {
  assert.equal(shouldRevealMetaView(1, true), false);
  assert.equal(shouldRevealMetaView(2, false), false);
  assert.equal(shouldRevealMetaView(2, true), true);
  assert.equal(shouldRevealMetaView(3, true), true);
});

test('only one animated meta interaction can run at a time', () => {
  assert.equal(canStartMetaInteraction(true, false, false), true);
  assert.equal(canStartMetaInteraction(true, true, false), false);
  assert.equal(canStartMetaInteraction(false, false, false), false);
});

test('reduced motion keeps interaction immediate instead of queueing hand movement', () => {
  assert.equal(canStartMetaInteraction(true, false, true), false);
});

test('virtual keys append, erase, and submit deterministically', () => {
  assert.deepEqual(applyVirtualKey('ARC', '_'), { value: 'ARC_', submit: false });
  assert.deepEqual(applyVirtualKey('ARC_', '1'), { value: 'ARC_1', submit: false });
  assert.deepEqual(applyVirtualKey('ARC_1', 'Backspace'), { value: 'ARC_', submit: false });
  assert.deepEqual(applyVirtualKey('ARC_184', 'Enter'), { value: 'ARC_184', submit: true });
});

test('unsupported keys are ignored and max length is respected', () => {
  assert.equal(normalizeVirtualKey('ArrowLeft'), null);
  assert.equal(normalizeVirtualKey('a'), 'a');
  assert.deepEqual(applyVirtualKey('ABCD', 'E', 4), { value: 'ABCD', submit: false });
});
