import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
const runtimeSources = [
  '../src/components/ChapterEnvironment.tsx',
  '../src/components/FlappyGame.tsx',
  '../src/components/GameLogoIntro.tsx',
  '../src/components/MetaInteractionScene.tsx',
  '../src/lib/music.ts',
].map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');

test('itch build uses relative entry and public-asset URLs', () => {
  assert.match(viteConfig, /base:\s*'\.\/'/);
  assert.doesNotMatch(runtimeSources, /['"`]\/assets\//);
  assert.match(runtimeSources, /assetPath\(/);
});
