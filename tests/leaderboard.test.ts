import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { calculateBeatPercentage, createPublicLeaderboard } from '../src/lib/leaderboard';

test('public leaderboard is long, sorted, and dominated by anonymous visitors near score 40', () => {
  const entries = createPublicLeaderboard(40);
  const anonymous = entries.filter((entry) => entry.kind === 'anonymous');

  assert.equal(entries.length, 55);
  assert.equal(anonymous.length, 48);
  assert.ok(anonymous.every((entry) => entry.score >= 37 && entry.score <= 40));
  assert.ok(anonymous.every((entry) => /Anonymous Visitor|Guest Player|Unnamed Flyer/.test(entry.name)));
  assert.ok(entries.every((entry, index) => index === 0 || entries[index - 1].score >= entry.score));
});

test('player row uses the exact best score and receives its sorted rank', () => {
  const entries = createPublicLeaderboard(52);
  const player = entries.find((entry) => entry.kind === 'player');

  assert.equal(player?.score, 52);
  assert.equal(player?.rank, 3);
});

test('public leaderboard does not reveal the hidden Noah overflow record', () => {
  const serialized = JSON.stringify(createPublicLeaderboard(40)).toLowerCase();
  const panelSource = readFileSync(new URL('../src/components/LeaderboardPanel.tsx', import.meta.url), 'utf8').toLowerCase();

  assert.equal(serialized.includes('noah'), false);
  assert.equal(serialized.includes('-65535'), false);
  assert.equal(serialized.includes('overflow'), false);
  assert.equal(panelSource.includes('noah'), false);
  assert.equal(panelSource.includes('-65535'), false);
  assert.equal(panelSource.includes('system overflow'), false);
});

test('marketing percentage rises with score and caps below one hundred percent', () => {
  const percentages = [0, 20, 40, 62, 184].map(calculateBeatPercentage);

  assert.deepEqual(percentages, [1, 54, 96.8, 97.4, 99.99]);
  assert.ok(percentages.every((value) => value < 100));
});
