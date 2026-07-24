import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  loadChapterCheckpoint,
  saveChapterCheckpoint,
} from '../src/lib/chapterCheckpoint';
import type { GameProgress } from '../src/types';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');

const progress = {
  currentChapter: 4,
  phase: 'os_unlocked',
  chapterEightMemoryIds: [],
  chapterEightRestoredMessageIds: [],
  chapterNineDeletedAppIds: [],
} as GameProgress;

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

test('single checkpoint stores and restores the current chapter snapshot', () => {
  const storage = createStorage();
  const saved = saveChapterCheckpoint(progress, storage);
  const loaded = loadChapterCheckpoint(progress, storage);

  assert.equal(saved?.progress.currentChapter, 4);
  assert.equal(loaded?.progress.currentChapter, 4);
  assert.equal(loaded?.version, 1);
});

test('corrupt checkpoint is ignored safely', () => {
  const storage = createStorage();
  storage.setItem('game-questing.chapter-checkpoint', '{not json');
  assert.equal(loadChapterCheckpoint(progress, storage), null);
});

test('App writes only when a formal progress update advances the chapter', () => {
  assert.match(appSource, /if \(next\.currentChapter > prev\.currentChapter\)/);
  assert.match(appSource, /pendingCheckpointChapter\.current = next\.currentChapter/);
  assert.doesNotMatch(appSource, /const jumpToChapter[\s\S]{0,250}saveChapterCheckpoint/);
});

test('FileBox exposes load, chapter restore, and full-loop restart', () => {
  assert.match(phoneSource, /id="dock-load-checkpoint"/);
  assert.match(phoneSource, /id="dock-restart-chapter"/);
  assert.match(phoneSource, /id="dock-restart-loop"/);
  assert.match(phoneSource, /AUTO CHECKPOINT/);
});
