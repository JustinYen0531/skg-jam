import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const readComponent = (name: string) => readFileSync(new URL(`../src/components/${name}.tsx`, import.meta.url), 'utf8');
const scene = readComponent('MetaInteractionScene');
const messages = readComponent('MessagesApp');
const phone = readComponent('PhoneSimulator');

test('every enabled text-like phone input can summon the Meta keyboard', () => {
  assert.match(scene, /!element\.disabled/);
  assert.match(scene, /!element\.readOnly/);
  assert.match(scene, /\['text', 'search', 'password', 'email', 'tel', 'url', 'number'\]\.includes\(element\.type\)/);
  assert.doesNotMatch(scene, /element\.id === 'vt-search-input'/);
});

test('unregistered controlled inputs receive virtual keys through native input and form submission', () => {
  assert.match(scene, /HTMLInputElement\.prototype, 'value'/);
  assert.match(scene, /dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\)/);
  assert.match(scene, /input\.form\?\.requestSubmit\(\)/);
});

test('Developer Chapter 7 can exercise the login without weakening normal clue gating', () => {
  assert.match(phone, /developerPreview=\{developerToolsOpen \|\| Boolean\(debugTargetApp\)\}/);
  assert.match(messages, /developerPreview = false/);
  assert.match(messages, /!developerPreview && !canUseProgressionAction\('admin-login', progress\)/);
});

test('the archive login is centered away from the hands and carries account context', () => {
  assert.match(messages, /id="archive-account-context"/);
  assert.match(messages, /id="archive-login-notice"/);
  assert.match(messages, /id="admin-login-form"/);
  assert.match(messages, /max-w-\[620px\]/);
  assert.match(messages, /id="admin-password-input"/);
  assert.match(messages, /w-\[74%\]/);
  assert.match(messages, /data-meta-hit-recovery="true"/);
});
