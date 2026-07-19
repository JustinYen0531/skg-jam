import assert from 'node:assert/strict';
import test from 'node:test';
import { createFeedSeed, shuffleFeed } from '../src/lib/pseudoFeed';

test('feed shuffle is stable for the same namespace and timestamp', () => {
  const seed = createFeedSeed('viewtube', 123456);
  const first = shuffleFeed(['a', 'b', 'c', 'd', 'e'], seed);
  const second = shuffleFeed(['a', 'b', 'c', 'd', 'e'], seed);

  assert.deepEqual(first, second);
});

test('feed shuffle only reorders the finite content pool', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f'];
  const shuffled = shuffleFeed(items, createFeedSeed('amazemart', 987654));

  assert.deepEqual([...shuffled].sort(), [...items].sort());
  assert.equal(new Set(shuffled).size, items.length);
});

test('app namespaces produce different feed orders', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const viewTube = shuffleFeed(items, createFeedSeed('viewtube', 42));
  const faceSpace = shuffleFeed(items, createFeedSeed('facespace', 42));

  assert.notDeepEqual(viewTube, faceSpace);
});
