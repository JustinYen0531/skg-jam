import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
const gddSource = readFileSync(new URL('../docs/GDD.md', import.meta.url), 'utf8');

test('Concept frames Stop Killing Games as an end-of-service and preservation reflection, not a puzzle', () => {
  assert.match(phoneSource, /THE HIGH SCORE IS THE BAIT\. THE MISSING GAME IS THE STORY\./);
  assert.match(phoneSource, /Gate 40 reveals that the contest is no longer fair/);
  assert.match(phoneSource, /not a general introduction to an organization/);
  assert.match(phoneSource, /Stop Killing Games[\s\S]*after official support ends/);
  assert.match(phoneSource, /The playable route/);
  assert.match(phoneSource, /The means to run it/);
  assert.match(phoneSource, /The human record/);
  assert.match(phoneSource, /A game does not need to run forever\. It needs to remain possible\./);
  assert.match(phoneSource, /Not an official Stop Killing Games product or statement/);
});

test('Concept names High Score Chaser as the narrative lens while keeping preservation central', () => {
  assert.match(phoneSource, /High Score Chaser[\s\S]*beat[\s\S]*ARC_184/);
  assert.match(phoneSource, /Arcane chases first place[\s\S]*Noah chases an ending/);
  assert.match(phoneSource, /The number is never the answer/);
  assert.match(gddSource, /\*\*High Score Chaser\*\*[\s\S]*高分不是答案/);
  assert.match(gddSource, /\*\*Stop Killing Games\*\*[\s\S]*未來仍能執行它/);
});
