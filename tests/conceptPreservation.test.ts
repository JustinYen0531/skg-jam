import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
const gddSource = readFileSync(new URL('../docs/GDD.md', import.meta.url), 'utf8');

test('Concept frames Stop Killing Games as an end-of-service and preservation reflection, not a puzzle', () => {
  assert.match(phoneSource, /independent fictional reflection on[\s\S]*Stop Killing Games/);
  assert.match(phoneSource, /ending publisher support must not make a game[\s\S]*impossible to play/);
  assert.match(phoneSource, /This is not a request for every service to run forever/);
  assert.match(phoneSource, /A replaced build/);
  assert.match(phoneSource, /A disappearing dependency/);
  assert.match(phoneSource, /A broken record/);
  assert.match(phoneSource, /A game does not need to run forever\. It needs to remain possible\./);
  assert.match(phoneSource, /Not an official Stop Killing Games product or statement/);
});

test('Concept names High Score Chaser as the narrative lens while keeping preservation central', () => {
  assert.match(phoneSource, /Why it is also a High Score Chaser story/);
  assert.match(phoneSource, /The score makes the loss visible, but it is not the answer/);
  assert.match(gddSource, /\*\*High Score Chaser\*\*[\s\S]*高分不是答案/);
  assert.match(gddSource, /\*\*Stop Killing Games\*\*[\s\S]*未來仍能執行它/);
});
