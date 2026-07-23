import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  calculateBeatPercentage,
  createPublicLeaderboard,
  isSuspiciousLeaderboardEntry,
} from '../src/lib/leaderboard';

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

test('the six anomalous top runs are the only leaderboard story entry points', () => {
  const entries = createPublicLeaderboard(40);
  const suspicious = entries.filter(isSuspiciousLeaderboardEntry);

  assert.equal(suspicious.length, 6);
  assert.deepEqual(suspicious.map((entry) => entry.rank), [1, 2, 3, 4, 5, 6]);
  assert.ok(suspicious.every((entry) => entry.score > 40));

  const panelSource = readFileSync(new URL('../src/components/LeaderboardPanel.tsx', import.meta.url), 'utf8');
  assert.match(panelSource, /data-suspicious-run="true"/);
  assert.match(panelSource, /Game <span[^>]*>Quest<\/span>ing,/);
  assert.match(panelSource, /<span[^>]*>Quest<\/span>ioning Game/);
  assert.doesNotMatch(panelSource, /INVESTIGATE/);
});

test('selecting a suspicious run asks whether to ignore it before the title can begin', () => {
  const panelSource = readFileSync(new URL('../src/components/LeaderboardPanel.tsx', import.meta.url), 'utf8');

  assert.match(panelSource, /id="leaderboard-anomaly-prompt"/);
  assert.match(panelSource, /THE FIRST FEW RECORDS LOOK STRANGE\./);
  assert.match(panelSource, /IGNORE THEM\?/);
  assert.match(panelSource, /id="ignore-anomaly-yes"/);
  assert.match(panelSource, /id="ignore-anomaly-no"/);
  assert.match(panelSource, /if \(!showTitleIntro\) return;/);
  assert.match(panelSource, /setSelectedRun\(null\);[\s\S]{0,100}setShowTitleIntro\(false\)/);
  assert.match(panelSource, /id="ignore-anomaly-no"[\s\S]{0,160}>[\s\S]{0,30}NO/);
  assert.match(panelSource, /setShowTitleIntro\(true\)/);
});

test('the cheap landing page uses a non-functional premium unlock instead of Learn More', () => {
  const flappySource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const documentSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(flappySource, /id="premium-unlock-button"/);
  assert.match(flappySource, /<Zap[^>]*\/> Unlock/);
  assert.doesNotMatch(flappySource, /Learn More|learn-more-modal/);
  assert.match(documentSource, /<title>Game Questing, Questioning Game<\/title>/);
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
