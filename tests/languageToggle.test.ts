import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DIALOGUE_TRANSLATIONS,
  translateDialogueLine,
} from '../src/lib/dialogueTranslations';
import {
  getLanguageToggleLabel,
  toggleGameLanguage,
} from '../src/lib/language';

test('the language toggle changes between English and Traditional Chinese', () => {
  assert.equal(toggleGameLanguage('en'), 'zh-Hant');
  assert.equal(toggleGameLanguage('zh-Hant'), 'en');
  assert.equal(getLanguageToggleLabel('en'), '中文');
  assert.equal(getLanguageToggleLabel('zh-Hant'), 'EN');
  assert.equal(translateDialogueLine("That's cheating.", 'en'), "That's cheating.");
  assert.equal(translateDialogueLine("That's cheating.", 'zh-Hant'), '這是在作弊。');
});

test('every bilingual dialogue inventory entry has a runtime translation mapping', () => {
  const inventory = readFileSync(
    new URL('../docs/ALL_DIALOGUE_BILINGUAL.md', import.meta.url),
    'utf8',
  );
  const entries = [...inventory.matchAll(/^- English: “(.+)”\s*\r?\n\s*繁中：(.*)$/gm)]
    .map((match) => ({ english: match[1], chinese: match[2].trim() }));
  const uniqueEnglish = new Set(entries.map(({ english }) => english));

  assert.equal(entries.length, 670);
  assert.equal(Object.keys(DIALOGUE_TRANSLATIONS).length, uniqueEnglish.size);
  for (const { english, chinese } of entries) {
    assert.equal(DIALOGUE_TRANSLATIONS[english], chinese, english);
  }
});

test('the Controls dock and Flappy header both expose the language toggle', () => {
  const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const flappySource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const sceneSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.match(phoneSource, /id="dock-language-toggle"/);
  assert.match(phoneSource, /id="dock-language-controls"/);
  assert.match(flappySource, /id="flappy-language-toggle"/);
  assert.match(sceneSource, /translateDialogueLines\(dialogueLines, language\)/);
  assert.match(sceneSource, /onLanguageChange: \(language: GameLanguage\) => void/);
});
