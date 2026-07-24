import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../src/components/ChapterEnvironment.tsx', import.meta.url), 'utf8');

test('energy drinks begin below the dialogue center in both camera postures', () => {
  assert.match(source, /left-\[6%\] top-\[76%\] scale-\[2\.025\]/);
  assert.match(source, /left-\[4%\] top-\[90%\] scale-\[2\.7\]/);
  assert.match(source, /transition-\[top,left,scale\]/);
  assert.doesNotMatch(source, /CoffeeCup|TeaService|PaperBalls/);
});
