import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  main?: string;
  build?: {
    electronVersion?: string;
    files?: string[];
    win?: {
      target?: Array<{ target?: string; arch?: string[] }>;
      signAndEditExecutable?: boolean;
    };
  };
};
const mainSource = readFileSync(new URL('../electron/main.cjs', import.meta.url), 'utf8');
const scriptSource = readFileSync(new URL('../scripts/package-windows.ps1', import.meta.url), 'utf8');

test('Windows packaging points at the local Vite build and portable x64 target', () => {
  assert.equal(packageJson.main, 'electron/main.cjs');
  assert.equal(packageJson.build?.electronVersion, '36.4.0');
  assert.deepEqual(packageJson.build?.files, ['dist/**/*', 'electron/main.cjs', 'package.json']);
  assert.deepEqual(packageJson.build?.win?.target, [{ target: 'portable', arch: ['x64'] }]);
  assert.equal(packageJson.build?.win?.signAndEditExecutable, false);
  assert.match(mainSource, /contextIsolation: true/);
  assert.match(mainSource, /loadFile\(path\.join\(__dirname, '\.\.', 'dist', 'index\.html'\)\)/);
  assert.match(scriptSource, /electron-builder@26\.0\.12/);
  assert.match(scriptSource, /--win portable --x64/);
});
