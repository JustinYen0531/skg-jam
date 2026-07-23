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

test('the title reveal uses two blink pairs before exposing the physical Meta frame', () => {
  assert.match(logoSource, /type PerspectivePhase = 'screen' \| 'blinking' \| 'meta-ready'/);
  assert.match(logoSource, /firstOpen: 180[\s\S]*secondClose: 480[\s\S]*secondOpen: 680/);
  assert.match(logoSource, /thirdClose: 1000[\s\S]*revealRoom: 1180[\s\S]*thirdOpen: 1440/);
  assert.match(logoSource, /fourthClose: 1860[\s\S]*fourthOpen: 2060[\s\S]*ready: 2400/);
  assert.match(logoSource, /data-blink-pairs="2"/);
  assert.match(logoSource, /data-blink-count="4"/);
  assert.match(logoSource, /setMetaFramed\(true\)/);
});

test('each blink closes a horizontal ellipse into a centered line', () => {
  assert.match(logoSource, /data-blink-shape="horizontal-ellipse"/);
  assert.match(logoSource, /<motion\.ellipse[\s\S]*rx="72"/);
  assert.match(logoSource, /initial=\{\{ ry: 52 \}\}/);
  assert.match(logoSource, /animate=\{\{ ry: eyesClosed \? 0\.45 : 52 \}\}/);
  assert.doesNotMatch(logoSource, /animate=\{\{ y: eyesClosed \? '0%' : '-102%' \}\}/);
  assert.doesNotMatch(logoSource, /animate=\{\{ y: eyesClosed \? '0%' : '102%' \}\}/);
});

test('the same title remains on a framed phone with hands until the final tap', () => {
  assert.match(logoSource, /id="intro-title-phone-screen"/);
  assert.match(logoSource, /data-title-location=\{metaFramed \? 'physical-phone' : 'fullscreen'\}/);
  assert.match(logoSource, /id="intro-meta-phone-frame"/);
  assert.match(logoSource, /id="intro-meta-left-hand"/);
  assert.match(logoSource, /id="intro-meta-right-hand"/);
  assert.match(logoSource, /src="\/assets\/meta-hand-grip\.png"/);
  assert.match(logoSource, /perspectivePhase === 'screen'\) beginPerspectiveReveal\(\)/);
  assert.match(logoSource, /perspectivePhase === 'meta-ready'\) finish\(\)/);
});
