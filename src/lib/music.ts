import type { GameProgress } from '../types';
import { assetPath } from './assetPath';

export type MusicPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'finale';

export const MUSIC_FADE_MS = 800;
export const MUSIC_LOOP_GAP_MS = 700;

export interface FinalePlaybackSnapshot {
  currentTime: number;
  duration: number | null;
  ended: boolean;
}

/**
 * Maps only the part of Finale that remains when the credits appear. A null
 * result means the browser has not exposed trustworthy audio metadata yet.
 */
export function getFinaleCreditProgress(
  startedAt: number,
  playback: FinalePlaybackSnapshot,
): number | null {
  if (playback.ended) return 1;
  if (playback.duration === null || playback.duration <= startedAt) return null;

  return Math.max(
    0,
    Math.min(1, (playback.currentTime - startedAt) / (playback.duration - startedAt)),
  );
}

export const MUSIC_TRACKS: Readonly<Record<MusicPhase, string>> = {
  0: assetPath('assets/music/Phase 00.mp3'),
  1: assetPath('assets/music/Phase 01.mp3'),
  2: assetPath('assets/music/Phase 02.mp3'),
  3: assetPath('assets/music/Phase 03.mp3'),
  4: assetPath('assets/music/Phase 04.mp3'),
  5: assetPath('assets/music/Phase 05.mp3'),
  6: assetPath('assets/music/Phase 06.mp3'),
  7: assetPath('assets/music/Phase 07.mp3'),
  8: assetPath('assets/music/Phase 08.mp3'),
  9: assetPath('assets/music/Phase 09.mp3'),
  10: assetPath('assets/music/Phase 10.mp3'),
  finale: assetPath('assets/music/Phase 10 (Finale).mp3'),
};

/** The cheap opening uses Phase 00; the Meta view follows Chapters 1–10. */
export function getMusicPhase(
  progress: Pick<GameProgress, 'phase' | 'currentChapter'>,
): MusicPhase {
  if (progress.phase === 'intro_game') return 0;
  if (progress.phase === 'credits') return 'finale';
  return Math.max(1, Math.min(10, progress.currentChapter)) as MusicPhase;
}

class MusicManager {
  private current: HTMLAudioElement | null = null;
  private currentPhase: MusicPhase | null = null;
  private muted = false;
  private suppressed = false;
  private fadeTimer: number | null = null;
  private loopGapTimer: number | null = null;
  private loopFading = false;
  private inLoopGap = false;
  private unlockArmed = false;
  private targetVolume = 0.28;
  private playCurrentOnce = false;
  private finaleEnded = false;
  private finaleEndListeners = new Set<(ended: boolean) => void>();
  private finalePlaybackListeners = new Set<(playback: FinalePlaybackSnapshot) => void>();
  private finalePlaybackFrame: number | null = null;

  setPhase(phase: MusicPhase) {
    if (phase === this.currentPhase || typeof Audio === 'undefined') return;

    this.playCurrentOnce = false;
    this.clearLoopGap();

    const previous = this.current;
    if (previous) this.detachLoopHandlers(previous);

    const next = new Audio(MUSIC_TRACKS[phase]);
    next.loop = false;
    next.preload = 'auto';
    next.muted = this.muted || this.suppressed;
    next.volume = 0;

    this.current = next;
    this.currentPhase = phase;
    this.loopFading = false;
    this.inLoopGap = false;
    this.attachLoopHandlers(next);
    this.tryPlay(next);

    if (previous) {
      this.crossfade(previous, next);
    } else {
      this.fadeIn(next);
    }
  }

  playFinaleOnce() {
    if (this.currentPhase === 'finale' && this.playCurrentOnce) return;
    this.finaleEnded = false;
    this.notifyFinaleEnded();
    if (this.currentPhase !== 'finale') {
      this.setPhase('finale');
    } else if (this.current) {
      this.current.currentTime = 0;
      this.attachLoopHandlers(this.current);
      this.tryPlay(this.current);
    }
    this.playCurrentOnce = true;
    this.notifyFinalePlayback();
    this.startFinalePlaybackFrames();
  }

  onFinaleEnded(listener: (ended: boolean) => void): () => void {
    this.finaleEndListeners.add(listener);
    listener(this.finaleEnded);
    return () => {
      this.finaleEndListeners.delete(listener);
    };
  }

  getFinalePlayback(): FinalePlaybackSnapshot {
    const duration = this.current && Number.isFinite(this.current.duration) && this.current.duration > 0
      ? this.current.duration
      : null;
    const currentTime = this.current && Number.isFinite(this.current.currentTime)
      ? this.current.currentTime
      : 0;

    return { currentTime, duration, ended: this.finaleEnded };
  }

  onFinalePlayback(listener: (playback: FinalePlaybackSnapshot) => void): () => void {
    this.finalePlaybackListeners.add(listener);
    listener(this.getFinalePlayback());
    this.startFinalePlaybackFrames();
    return () => {
      this.finalePlaybackListeners.delete(listener);
      if (this.finalePlaybackListeners.size === 0) this.stopFinalePlaybackFrames();
    };
  }

  private notifyFinaleEnded() {
    this.finaleEndListeners.forEach((listener) => listener(this.finaleEnded));
  }

  private notifyFinalePlayback() {
    const playback = this.getFinalePlayback();
    this.finalePlaybackListeners.forEach((listener) => listener(playback));
  }

  private startFinalePlaybackFrames() {
    if (
      this.finalePlaybackFrame !== null
      || this.currentPhase !== 'finale'
      || !this.playCurrentOnce
      || this.finalePlaybackListeners.size === 0
      || typeof window === 'undefined'
      || typeof window.requestAnimationFrame !== 'function'
    ) return;

    const update = () => {
      this.finalePlaybackFrame = null;
      this.notifyFinalePlayback();
      if (this.playCurrentOnce && !this.finaleEnded) {
        this.finalePlaybackFrame = window.requestAnimationFrame(update);
      }
    };
    this.finalePlaybackFrame = window.requestAnimationFrame(update);
  }

  private stopFinalePlaybackFrames() {
    if (
      this.finalePlaybackFrame === null
      || typeof window === 'undefined'
      || typeof window.cancelAnimationFrame !== 'function'
    ) return;
    window.cancelAnimationFrame(this.finalePlaybackFrame);
    this.finalePlaybackFrame = null;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.current) return;
    this.current.muted = this.muted || this.suppressed;
    if (!this.current.muted && !this.inLoopGap) this.tryPlay(this.current);
  }

  setSuppressed(suppressed: boolean) {
    this.suppressed = suppressed;
    if (!this.current) return;
    this.current.muted = this.muted || this.suppressed;
    if (!this.current.muted && !this.inLoopGap) this.tryPlay(this.current);
  }

  setVolume(volume: number) {
    this.targetVolume = 0.28 * Math.max(0, Math.min(1, volume));
    if (this.current && !this.loopFading && !this.inLoopGap) {
      this.current.volume = this.targetVolume;
    }
  }

  private tryPlay(track: HTMLAudioElement) {
    const playback = track.play();
    if (playback) playback.catch(() => this.armPlaybackUnlock());
  }

  private attachLoopHandlers(track: HTMLAudioElement) {
    track.onloadedmetadata = () => {
      if (this.current === track && this.currentPhase === 'finale') {
        this.notifyFinalePlayback();
      }
    };

    track.ontimeupdate = () => {
      if (this.current === track && this.currentPhase === 'finale') {
        this.notifyFinalePlayback();
      }
      if (
        this.current !== track
        || this.loopFading
        || this.inLoopGap
        || !Number.isFinite(track.duration)
      ) return;

      const remainingSeconds = track.duration - track.currentTime;
      if (remainingSeconds <= MUSIC_FADE_MS / 1000) {
        this.loopFading = true;
        this.fadeOut(track);
      }
    };

    track.onended = () => {
      if (this.current !== track) return;

      this.clearFade();
      track.volume = 0;
      track.currentTime = 0;
      if (this.playCurrentOnce) {
        this.playCurrentOnce = false;
        this.finaleEnded = true;
        this.notifyFinaleEnded();
        this.notifyFinalePlayback();
        this.stopFinalePlaybackFrames();
        return;
      }
      this.inLoopGap = true;
      this.loopGapTimer = window.setTimeout(() => {
        if (this.current !== track) return;
        this.loopGapTimer = null;
        this.inLoopGap = false;
        this.loopFading = false;
        this.tryPlay(track);
        this.fadeIn(track);
      }, MUSIC_LOOP_GAP_MS);
    };
  }

  private detachLoopHandlers(track: HTMLAudioElement) {
    track.onloadedmetadata = null;
    track.ontimeupdate = null;
    track.onended = null;
  }

  private fadeIn(track: HTMLAudioElement) {
    this.fade(track, track.volume, this.targetVolume);
  }

  private fadeOut(track: HTMLAudioElement) {
    this.fade(track, track.volume, 0);
  }

  private fade(track: HTMLAudioElement, from: number, to: number) {
    this.clearFade();
    const steps = 20;
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      if (this.current !== track) {
        this.clearFade();
        return;
      }

      step += 1;
      const ratio = Math.min(1, step / steps);
      track.volume = from + ((to - from) * ratio);

      if (ratio >= 1) this.clearFade();
    }, MUSIC_FADE_MS / steps);
  }

  private crossfade(previous: HTMLAudioElement, next: HTMLAudioElement) {
    this.clearFade();
    const steps = 20;
    const previousVolume = previous.volume;
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      step += 1;
      const ratio = Math.min(1, step / steps);
      next.volume = this.targetVolume * ratio;
      previous.volume = previousVolume * (1 - ratio);

      if (ratio >= 1) {
        this.clearFade();
        previous.pause();
        previous.src = '';
      }
    }, MUSIC_FADE_MS / steps);
  }

  private clearFade() {
    if (this.fadeTimer === null || typeof window === 'undefined') return;
    window.clearInterval(this.fadeTimer);
    this.fadeTimer = null;
  }

  private clearLoopGap() {
    if (this.loopGapTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.loopGapTimer);
      this.loopGapTimer = null;
    }
    this.inLoopGap = false;
  }

  private readonly resumeAfterGesture = () => {
    this.disarmPlaybackUnlock();
    if (this.current && !this.inLoopGap) this.tryPlay(this.current);
  };

  private armPlaybackUnlock() {
    if (this.unlockArmed || typeof window === 'undefined') return;
    this.unlockArmed = true;
    window.addEventListener('pointerdown', this.resumeAfterGesture, { once: true });
    window.addEventListener('keydown', this.resumeAfterGesture, { once: true });
  }

  private disarmPlaybackUnlock() {
    if (!this.unlockArmed || typeof window === 'undefined') return;
    this.unlockArmed = false;
    window.removeEventListener('pointerdown', this.resumeAfterGesture);
    window.removeEventListener('keydown', this.resumeAfterGesture);
  }
}

export const music = new MusicManager();
export default music;
