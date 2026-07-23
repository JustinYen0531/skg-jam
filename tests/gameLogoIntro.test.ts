import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const logoSource = readFileSync(
  new URL('../src/components/GameLogoIntro.tsx', import.meta.url),
  'utf8',
);

test('the completed wordmark holds both quest cores on the center axis before offsetting', () => {
  assert.match(
    logoSource,
    /const SEQ = \{ collide: 650, burst: 950, center: 2000, ready: 2350 \}/,
  );
  assert.match(logoSource, /coreCentered[\s\S]{0,100}phase === 'burst'/);
});

test('logo lines stay module-scoped so phase changes cannot replay their initial animation', () => {
  const lineAt = logoSource.indexOf('const LogoLine:');
  const introAt = logoSource.indexOf('export const GameLogoIntro:');

  assert.ok(lineAt >= 0);
  assert.ok(introAt > lineAt);
  assert.doesNotMatch(
    logoSource.slice(introAt),
    /const (?:Line|LogoLine): React\.FC/,
  );
});
