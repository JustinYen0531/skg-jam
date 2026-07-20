import type { GameProgress } from '../types';

export type MusicPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const MUSIC_TRACKS: Readonly<Record<MusicPhase, string>> = {
  1: '/assets/music/Phase 1.mp3',
  2: '/assets/music/Phase 2.mp3',
  3: '/assets/music/Phase 3.mp3',
  4: '/assets/music/Phase 4.mp3',
  5: '/assets/music/Phase 5.mp3',
  6: '/assets/music/Phase 6.mp3',
  7: '/assets/music/Phase 7.mp3',
  8: '/assets/music/Phase 8.mp3',
  9: '/assets/music/Phase 9.mp3',
  10: '/assets/music/Phase 10.mp3',
  11: '/assets/music/Phase 11.mp3',
};

/** Chapter 0 is the cheap intro game; Chapters 1–10 become music Phases 2–11. */
export function getMusicPhase(
  progress: Pick<GameProgress, 'phase' | 'currentChapter'>,
): MusicPhase {
  if (progress.phase === 'intro_game') return 1;
  return Math.min(11, progress.currentChapter + 1) as MusicPhase;
}

class MusicManager {
  private current: HTMLAudioElement | null = null;
  private currentPhase: MusicPhase | null = null;
  private muted = false;
  private fadeTimer: number | null = null;
  private unlockArmed = false;
  private readonly targetVolume = 0.28;

  setPhase(phase: MusicPhase) {
    if (phase === this.currentPhase || typeof Audio === 'undefined') return;

    const previous = this.current;
    const next = new Audio(MUSIC_TRACKS[phase]);
    next.loop = true;
    next.preload = 'auto';
    next.muted = this.muted;
    next.volume = previous ? 0 : this.targetVolume;

    this.current = next;
    this.currentPhase = phase;
    this.tryPlay(next);

    if (!previous) return;
    this.crossfade(previous, next);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.current) return;
    this.current.muted = muted;
    if (!muted) this.tryPlay(this.current);
  }

  private tryPlay(track: HTMLAudioElement) {
    const playback = track.play();
    if (playback) playback.catch(() => this.armPlaybackUnlock());
  }

  private crossfade(previous: HTMLAudioElement, next: HTMLAudioElement) {
    if (this.fadeTimer !== null) window.clearInterval(this.fadeTimer);
    const steps = 15;
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      step += 1;
      const ratio = Math.min(1, step / steps);
      next.volume = this.targetVolume * ratio;
      previous.volume = this.targetVolume * (1 - ratio);

      if (ratio >= 1) {
        window.clearInterval(this.fadeTimer!);
        this.fadeTimer = null;
        previous.pause();
        previous.src = '';
      }
    }, 40);
  }

  private readonly resumeAfterGesture = () => {
    this.disarmPlaybackUnlock();
    if (this.current) this.tryPlay(this.current);
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
