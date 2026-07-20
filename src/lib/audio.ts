/**
 * Web Audio synthesis engine for SKG: Scorekeeper.
 *
 * Implements the P0 sound families from docs/SOUND_EFFECT_DESIGN.md using
 * only Web Audio primitives — no samples. Design rules honoured here:
 *
 * - Event identity: one event name per interaction family ("what happened"),
 *   instead of one shared tick for everything (§2, §8).
 * - Five sound worlds via bus grouping and timbre (§3, §6.1): cheap-ad UI is
 *   bright and compressed, gameplay is early-mobile waveforms, keyboard and
 *   glyph sounds are quieter than UI, meta foley is dry and close.
 * - Polyphony caps and rate limits (§6.3): flap ≤2, score ≤3, key ≤4,
 *   glyph ≤2; new voices steal the oldest.
 * - Determinism (§7): variants rotate on counters; no Math.random pitches on
 *   story-critical data events.
 * - Mute silences everything through the master bus (§12); reduced motion is
 *   not mute — callers keep firing events at the correct moments.
 */

export type SfxEvent =
  | 'flight.flap'
  | 'flight.score'
  | 'flight.pipeHit'
  | 'flight.birdFall'
  | 'flight.deathResult'
  | 'flight.restart'
  | 'flight.complete'
  | 'ad.playNow'
  | 'ui.primaryTap'
  | 'ui.secondaryTap'
  | 'leaderboard.open'
  | 'phone.appOpen'
  | 'phone.home'
  | 'key.character'
  | 'key.backspace'
  | 'key.enter'
  | 'search.noResult'
  | 'search.found'
  | 'auth.wrong'
  | 'auth.correct'
  | 'narrative.glyph'
  | 'narrative.word'
  | 'narrative.systemLine'
  | 'meta.fingerContact'
  | 'meta.cameraPullback'
  | 'story.clueUnlock'
  | 'story.hiddenEntriesPrompt'
  | 'story.signedValueReveal'
  | 'story.scoreOverflow'
  | 'story.endingPreserve'
  | 'archive.downloadComplete'
  | 'viewtube.pause'
  /* ---- P1: world material and chapter difference ---- */
  | 'flight.gate40Block'
  | 'flight.level2Connect'
  | 'flight.altitudeStep'
  | 'flight.collisionBypass'
  | 'ui.close'
  | 'ui.toggle'
  | 'ui.disabled'
  | 'phone.tab'
  | 'phone.scroll'
  | 'phone.modalOpen'
  | 'phone.modalClose'
  | 'phone.notification'
  | 'key.space'
  | 'narrative.lineEnd'
  | 'narrative.interrupt'
  | 'narrative.clueEmphasis'
  | 'meta.handDepart'
  | 'meta.fingerSwipe'
  | 'meta.regrip'
  | 'viewtube.videoStart'
  | 'viewtube.barrage'
  | 'archive.yearSwitch'
  | 'archive.downloadStart'
  | 'amazemart.purchase'
  | 'amazemart.delivery'
  | 'screenshot.zoom'
  | 'social.sort'
  | 'messages.incoming'
  | 'messages.typing'
  | 'story.dataCorrupt'
  | 'story.serviceTerminated'
  | 'story.endingSubmit'
  | 'story.endingPublicize';

export interface SfxOptions {
  /** Deterministic variant selector (e.g. pipe material, score count). */
  variant?: number;
  /** 0..1 — reduces decoration, e.g. the plainer post-reveal death sting. */
  intensity?: number;
  /** Seconds to defer the event on the audio clock (no JS timers). */
  delay?: number;
}

type BusName = 'gameplay' | 'ui' | 'narrative' | 'metaFoley' | 'ambience';

interface Voice {
  gain: GainNode;
  until: number;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses: Partial<Record<BusName, GainNode>> = {};
  private noiseBuffer: AudioBuffer | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted = false;
  private counters: Record<string, number> = {};
  private lastPlayed: Record<string, number> = {};
  private voices: Record<string, Voice[]> = {};

  /* ---------------------------------------------------------------- */
  /* Context, buses, shared sources                                    */
  /* ---------------------------------------------------------------- */

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.master) {
      this.master = this.ctx.createGain();
      this.master.gain.value = this.isMuted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
      // §6.2 relative levels: keep the hierarchy, but compensate for the
      // event × bus × master gain stages so short sounds remain audible on
      // laptop and phone speakers. Ambience stays below interaction detail.
      const levels: Record<BusName, number> = {
        gameplay: 0.85,
        ui: 0.6,
        narrative: 0.5,
        metaFoley: 0.65,
        ambience: 0.12,
      };
      (Object.keys(levels) as BusName[]).forEach((name) => {
        const bus = this.ctx!.createGain();
        bus.gain.value = levels[name];
        bus.connect(this.master!);
        this.buses[name] = bus;
      });
    }
  }

  private bus(name: BusName): GainNode {
    return this.buses[name] ?? this.master!;
  }

  /** Deterministic noise: seeded LCG so data sounds replay identically. */
  private getNoiseBuffer(): AudioBuffer {
    if (!this.noiseBuffer && this.ctx) {
      const length = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let seed = 0x5eed;
      for (let i = 0; i < length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        data[i] = (seed / 0xffffffff) * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer!;
  }

  private nextVariant(family: string, count: number): number {
    const next = (this.counters[family] ?? 0) + 1;
    this.counters[family] = next;
    return next % count;
  }

  /** Polyphony caps (§6.3): steal the oldest voice with a fast fade. */
  private registerVoice(family: string, cap: number, gain: GainNode, until: number) {
    const pool = (this.voices[family] ??= []);
    const now = this.ctx!.currentTime;
    this.voices[family] = pool.filter((v) => v.until > now);
    if (this.voices[family].length >= cap) {
      const oldest = this.voices[family].shift();
      if (oldest) {
        try {
          oldest.gain.gain.cancelScheduledValues(now);
          oldest.gain.gain.setTargetAtTime(0, now, 0.012);
        } catch { /* already gone */ }
      }
    }
    this.voices[family].push({ gain, until });
  }

  /* ---------------------------------------------------------------- */
  /* Synthesis helpers                                                 */
  /* ---------------------------------------------------------------- */

  /** Envelope gain node: fast attack, exponential-ish release. */
  private env(busName: BusName, t: number, peak: number, dur: number, attack = 0.004): GainNode {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    g.connect(this.bus(busName));
    return g;
  }

  private tone(opts: {
    bus: BusName; type: OscillatorType; f0: number; f1?: number;
    t: number; dur: number; g: number; attack?: number;
    filterType?: BiquadFilterType; filterFreq?: number; filterQ?: number;
    family?: string; cap?: number;
  }) {
    const { bus, type, f0, f1, t, dur, g } = opts;
    const osc = this.ctx!.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    }
    const gain = this.env(bus, t, g, dur, opts.attack);
    if (opts.filterType && opts.filterFreq) {
      const filter = this.ctx!.createBiquadFilter();
      filter.type = opts.filterType;
      filter.frequency.setValueAtTime(opts.filterFreq, t);
      if (opts.filterQ) filter.Q.setValueAtTime(opts.filterQ, t);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    if (opts.family && opts.cap) this.registerVoice(opts.family, opts.cap, gain, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(opts: {
    bus: BusName; t: number; dur: number; g: number; attack?: number;
    filterType?: BiquadFilterType; filterFreq?: number; filterQ?: number;
    family?: string; cap?: number;
  }) {
    const { bus, t, dur, g } = opts;
    const src = this.ctx!.createBufferSource();
    src.buffer = this.getNoiseBuffer();
    src.loop = true;
    const gain = this.env(bus, t, g, dur, opts.attack);
    if (opts.filterType && opts.filterFreq) {
      const filter = this.ctx!.createBiquadFilter();
      filter.type = opts.filterType;
      filter.frequency.setValueAtTime(opts.filterFreq, t);
      if (opts.filterQ) filter.Q.setValueAtTime(opts.filterQ, t);
      src.connect(filter);
      filter.connect(gain);
    } else {
      src.connect(gain);
    }
    if (opts.family && opts.cap) this.registerVoice(opts.family, opts.cap, gain, t + dur);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  /** Momentarily lower a set of buses (used by the −65535 reveal). */
  private duck(names: BusName[], factor: number, holdSec: number) {
    const now = this.ctx!.currentTime;
    names.forEach((name) => {
      const bus = this.buses[name];
      if (!bus) return;
      const base = bus.gain.value;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setTargetAtTime(base * factor, now, 0.04);
      bus.gain.setTargetAtTime(base, now + holdSec, 0.25);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Public API                                                        */
  /* ---------------------------------------------------------------- */

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.02);
    }
    if (muted) {
      this.stopAmbientHum();
    } else {
      this.startAmbientHum();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  play(event: SfxEvent, options: SfxOptions = {}) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + Math.max(0, options.delay ?? 0);

    switch (event) {
      /* -------------------- flight (§4.1) -------------------- */

      case 'flight.flap': {
        // 70–130 ms light upward blip with a papery wing transient.
        const v = options.variant ?? this.nextVariant('flap', 3);
        const base = [372, 402, 434][v % 3];
        this.tone({ bus: 'gameplay', type: 'square', f0: base, f1: base * 1.38, t, dur: 0.1, g: 0.085, filterType: 'lowpass', filterFreq: 2600, family: 'flap', cap: 2 });
        this.noise({ bus: 'gameplay', t, dur: 0.035, g: 0.04, filterType: 'bandpass', filterFreq: 1500, filterQ: 1.2, family: 'flap', cap: 2 });
        break;
      }

      case 'flight.score': {
        // 40–80 ms clean ping, higher than flap; every 5th score gains one
        // very light overtone layer — never a melody.
        const count = options.variant ?? 0;
        this.tone({ bus: 'gameplay', type: 'triangle', f0: 1175, t, dur: 0.06, g: 0.06, family: 'score', cap: 3 });
        if (count > 0 && count % 5 === 0) {
          this.tone({ bus: 'gameplay', type: 'sine', f0: 2350, t: t + 0.01, dur: 0.05, g: 0.018, family: 'score', cap: 3 });
        }
        break;
      }

      case 'flight.pipeHit': {
        // Contact first, then stall. Variants: 0 plastic pipe, 1 Level 2
        // material (more metallic), 2 spikes (shorter, brighter).
        const v = options.variant ?? 0;
        if (v === 1) {
          this.noise({ bus: 'gameplay', t, dur: 0.03, g: 0.11, filterType: 'bandpass', filterFreq: 1400, filterQ: 4 });
          this.tone({ bus: 'gameplay', type: 'square', f0: 210, f1: 150, t: t + 0.008, dur: 0.07, g: 0.12, filterType: 'lowpass', filterFreq: 1100 });
          this.tone({ bus: 'gameplay', type: 'sine', f0: 620, t: t + 0.008, dur: 0.09, g: 0.03 });
        } else if (v === 2) {
          this.noise({ bus: 'gameplay', t, dur: 0.016, g: 0.1, filterType: 'highpass', filterFreq: 1800 });
          this.tone({ bus: 'gameplay', type: 'square', f0: 260, f1: 190, t: t + 0.006, dur: 0.045, g: 0.1, filterType: 'lowpass', filterFreq: 1400 });
        } else {
          this.noise({ bus: 'gameplay', t, dur: 0.026, g: 0.1, filterType: 'lowpass', filterFreq: 900 });
          this.tone({ bus: 'gameplay', type: 'square', f0: 165, f1: 118, t: t + 0.008, dur: 0.07, g: 0.13, filterType: 'lowpass', filterFreq: 900 });
        }
        break;
      }

      case 'flight.birdFall': {
        // 150–300 ms descent, separate from the hit; no explosion.
        this.tone({ bus: 'gameplay', type: 'triangle', f0: 620, f1: 170, t, dur: 0.26, g: 0.07 });
        break;
      }

      case 'flight.deathResult': {
        // Cheap ad-game fail sting: short, awkward, slightly cheerful.
        // intensity < 1 strips decoration after the meta reveal.
        const plain = (options.intensity ?? 1) < 1;
        const notes = plain ? [659, 523] : [659, 523, 392];
        notes.forEach((f, i) => {
          const start = t + i * 0.1;
          const isLast = i === notes.length - 1;
          this.tone({
            bus: 'gameplay', type: 'square', f0: f,
            f1: !plain && isLast ? f * 0.92 : f,
            t: start, dur: 0.12, g: plain ? 0.05 : 0.065,
            filterType: 'lowpass', filterFreq: 2400,
          });
        });
        break;
      }

      case 'flight.restart': {
        // 80–140 ms reverse-suction reset; never the unlock chord.
        this.noise({ bus: 'gameplay', t, dur: 0.1, g: 0.05, attack: 0.08, filterType: 'bandpass', filterFreq: 1000, filterQ: 0.8 });
        this.tone({ bus: 'gameplay', type: 'sine', f0: 210, f1: 720, t, dur: 0.12, g: 0.05 });
        break;
      }

      case 'flight.complete': {
        // Simple, unshowy early-mobile completion figure. The emotion
        // belongs to the BGM's final bars, not to this cue.
        this.tone({ bus: 'gameplay', type: 'triangle', f0: 392, t, dur: 0.14, g: 0.06, filterType: 'lowpass', filterFreq: 3200 });
        this.tone({ bus: 'gameplay', type: 'triangle', f0: 523, t: t + 0.16, dur: 0.34, g: 0.06, filterType: 'lowpass', filterFreq: 3200 });
        this.tone({ bus: 'gameplay', type: 'sine', f0: 1046, t: t + 0.16, dur: 0.3, g: 0.014 });
        break;
      }

      /* --------------- cheap-ad UI & leaderboard (§4.2) --------------- */

      case 'ad.playNow': {
        // Overly bright two-note CTA rise, glossy and compressed.
        this.tone({ bus: 'ui', type: 'sawtooth', f0: 523, f1: 560, t, dur: 0.08, g: 0.09, filterType: 'lowpass', filterFreq: 5200 });
        this.tone({ bus: 'ui', type: 'square', f0: 784, f1: 830, t: t + 0.09, dur: 0.14, g: 0.1, filterType: 'lowpass', filterFreq: 5200 });
        this.tone({ bus: 'ui', type: 'sine', f0: 1568, t: t + 0.09, dur: 0.12, g: 0.03 });
        break;
      }

      case 'ui.primaryTap': {
        // 40–70 ms clean, slightly thick click.
        this.tone({ bus: 'ui', type: 'sine', f0: 880, t, dur: 0.035, g: 0.1 });
        this.tone({ bus: 'ui', type: 'sine', f0: 1760, t, dur: 0.018, g: 0.03 });
        this.tone({ bus: 'ui', type: 'sine', f0: 320, t, dur: 0.03, g: 0.045 });
        break;
      }

      case 'ui.secondaryTap': {
        // Smaller, drier, no pitch statement.
        this.noise({ bus: 'ui', t, dur: 0.014, g: 0.05, filterType: 'highpass', filterFreq: 2500 });
        this.tone({ bus: 'ui', type: 'sine', f0: 1350, t, dur: 0.016, g: 0.038 });
        break;
      }

      case 'leaderboard.open': {
        // Rapid numeric scan that settles; reveals nothing hidden.
        [900, 1000, 1120, 1240, 1320].forEach((f, i) => {
          this.tone({ bus: 'ui', type: 'sine', f0: f, t: t + i * 0.03, dur: 0.016, g: 0.032 });
        });
        this.tone({ bus: 'ui', type: 'sine', f0: 520, t: t + 0.2, dur: 0.05, g: 0.055 });
        break;
      }

      /* ---------------- phone & navigation (§4.3) ---------------- */

      case 'phone.appOpen': {
        // 90–140 ms small expansion.
        this.tone({ bus: 'ui', type: 'sine', f0: 520, f1: 760, t, dur: 0.11, g: 0.06 });
        this.tone({ bus: 'ui', type: 'sine', f0: 1040, f1: 1520, t, dur: 0.09, g: 0.014 });
        break;
      }

      case 'phone.home': {
        // The same material folding back in.
        this.tone({ bus: 'ui', type: 'sine', f0: 730, f1: 470, t, dur: 0.1, g: 0.055 });
        break;
      }

      /* ---------------- keyboard & search (§4.4) ---------------- */

      case 'key.character': {
        // 20–35 ms soft tap; 4 micro-variants cycling; ≤ ~18/sec (§4.4).
        const last = this.lastPlayed['key'] ?? 0;
        if (t - last < 0.055) return;
        this.lastPlayed['key'] = t;
        const v = options.variant ?? this.nextVariant('key', 4);
        const nf = [2300, 2500, 2150, 2650][v % 4];
        const tf = [1120, 1180, 1080, 1240][v % 4];
        this.noise({ bus: 'ui', t, dur: 0.018, g: 0.045, filterType: 'bandpass', filterFreq: nf, filterQ: 2, family: 'keyChar', cap: 4 });
        this.tone({ bus: 'ui', type: 'sine', f0: tf, t, dur: 0.016, g: 0.02, family: 'keyChar', cap: 4 });
        break;
      }

      case 'key.backspace': {
        this.tone({ bus: 'ui', type: 'sine', f0: 760, f1: 640, t, dur: 0.026, g: 0.045 });
        this.noise({ bus: 'ui', t, dur: 0.012, g: 0.03, filterType: 'bandpass', filterFreq: 1800, filterQ: 2 });
        break;
      }

      case 'key.enter': {
        // 60–100 ms confirm contact plus a short downward press.
        this.noise({ bus: 'ui', t, dur: 0.02, g: 0.05, filterType: 'lowpass', filterFreq: 1200 });
        this.tone({ bus: 'ui', type: 'sine', f0: 640, f1: 470, t: t + 0.008, dur: 0.08, g: 0.065 });
        break;
      }

      case 'search.noResult': {
        // Two short convergent digital tones; no buzzer.
        this.tone({ bus: 'ui', type: 'sine', f0: 640, f1: 615, t, dur: 0.07, g: 0.055 });
        this.tone({ bus: 'ui', type: 'sine', f0: 505, f1: 488, t: t + 0.1, dur: 0.09, g: 0.055 });
        break;
      }

      case 'search.found': {
        // One clear locating tone; clue sounds take over afterwards.
        this.tone({ bus: 'ui', type: 'triangle', f0: 980, t, dur: 0.12, g: 0.075 });
        this.tone({ bus: 'ui', type: 'sine', f0: 1960, t: t + 0.01, dur: 0.09, g: 0.014 });
        break;
      }

      case 'auth.wrong': {
        // Dry, low, done within 100 ms; not the data-corruption glitch.
        this.tone({ bus: 'ui', type: 'square', f0: 175, t, dur: 0.07, g: 0.085, filterType: 'lowpass', filterFreq: 700 });
        this.noise({ bus: 'ui', t, dur: 0.024, g: 0.035, filterType: 'lowpass', filterFreq: 500 });
        break;
      }

      case 'auth.correct': {
        // A latch releasing, then a short old-system chord — lo-fi, mono.
        this.noise({ bus: 'ui', t, dur: 0.016, g: 0.05, filterType: 'bandpass', filterFreq: 900, filterQ: 2 });
        this.tone({ bus: 'ui', type: 'sine', f0: 240, t: t + 0.01, dur: 0.045, g: 0.055 });
        this.tone({ bus: 'ui', type: 'square', f0: 261.6, t: t + 0.09, dur: 0.26, g: 0.04, filterType: 'lowpass', filterFreq: 2800 });
        this.tone({ bus: 'ui', type: 'square', f0: 392, t: t + 0.09, dur: 0.26, g: 0.04, filterType: 'lowpass', filterFreq: 2800 });
        break;
      }

      /* -------------- monologue & terminal text (§4.5) -------------- */

      case 'narrative.glyph': {
        // 8–20 ms, very quiet, dry; ±3% deterministic pitch drift.
        const v = options.variant ?? this.nextVariant('glyph', 5);
        const f = 1150 * (1 + ((v % 5) - 2) * 0.015);
        this.tone({ bus: 'narrative', type: 'sine', f0: f, t, dur: 0.013, g: 0.02, family: 'glyph', cap: 2 });
        break;
      }

      case 'narrative.word': {
        // Fallback mode: one slightly longer tick per word.
        this.tone({ bus: 'narrative', type: 'sine', f0: 1150, t, dur: 0.024, g: 0.022, family: 'glyph', cap: 2 });
        break;
      }

      case 'narrative.systemLine': {
        // Colder and higher than the protagonist's own text.
        this.tone({ bus: 'narrative', type: 'sine', f0: 1650, t, dur: 0.02, g: 0.016 });
        this.noise({ bus: 'narrative', t, dur: 0.01, g: 0.012, filterType: 'highpass', filterFreq: 3000 });
        break;
      }

      /* ---------------- meta physical space (§4.6) ---------------- */

      case 'meta.fingerContact': {
        // Soft fingertip pad with a tiny glass high-frequency; dry, close.
        const last = this.lastPlayed['finger'] ?? 0;
        if (t - last < 0.06) return;
        this.lastPlayed['finger'] = t;
        this.noise({ bus: 'metaFoley', t, dur: 0.028, g: 0.11, filterType: 'lowpass', filterFreq: 700 });
        this.noise({ bus: 'metaFoley', t, dur: 0.009, g: 0.045, filterType: 'bandpass', filterFreq: 3600, filterQ: 3 });
        this.tone({ bus: 'metaFoley', type: 'sine', f0: 225, t, dur: 0.022, g: 0.055 });
        break;
      }

      case 'meta.cameraPullback': {
        // Screen-capture signal cut, then the room's air quietly exists.
        this.noise({ bus: 'metaFoley', t, dur: 0.008, g: 0.06, filterType: 'highpass', filterFreq: 2500 });
        this.tone({ bus: 'metaFoley', type: 'square', f0: 1150, f1: 190, t: t + 0.004, dur: 0.09, g: 0.055, filterType: 'lowpass', filterFreq: 2600 });
        this.noise({ bus: 'ambience', t: t + 0.15, dur: 0.9, g: 0.04, attack: 0.45, filterType: 'lowpass', filterFreq: 380 });
        break;
      }

      /* --------------- truth & endings (§4.8) --------------- */

      case 'story.clueUnlock': {
        // Restrained three-note ascent; first-time unlocks only (caller's
        // responsibility), never a fanfare.
        this.tone({ bus: 'ui', type: 'triangle', f0: 330, t, dur: 0.1, g: 0.055, filterType: 'lowpass', filterFreq: 3500 });
        this.tone({ bus: 'ui', type: 'triangle', f0: 440, t: t + 0.11, dur: 0.1, g: 0.055, filterType: 'lowpass', filterFreq: 3500 });
        this.tone({ bus: 'ui', type: 'triangle', f0: 660, t: t + 0.24, dur: 0.14, g: 0.04, filterType: 'lowpass', filterFreq: 3500 });
        break;
      }

      case 'story.hiddenEntriesPrompt': {
        // The sorting motor slows, stops, and one low pulse remains.
        [480, 440, 400].forEach((f, i) => {
          this.tone({ bus: 'ui', type: 'sine', f0: f, t: t + [0, 0.09, 0.21][i], dur: 0.018, g: 0.035 });
        });
        this.tone({ bus: 'ui', type: 'sine', f0: 92, t: t + 0.38, dur: 0.16, g: 0.08 });
        break;
      }

      case 'story.signedValueReveal': {
        // Almost no sting: pull the other sounds back, then one
        // low-resolution confirmation.
        this.duck(['ui', 'gameplay'], 0.55, 0.9);
        this.tone({ bus: 'narrative', type: 'square', f0: 196, t: t + 0.25, dur: 0.18, g: 0.07, filterType: 'lowpass', filterFreq: 900 });
        break;
      }

      case 'story.scoreOverflow': {
        // 256 → 65535 → −65535: three data steps; the last returns to the
        // first pitch with a degraded voice.
        this.tone({ bus: 'narrative', type: 'sine', f0: 880, t, dur: 0.09, g: 0.06 });
        this.tone({ bus: 'narrative', type: 'sine', f0: 1245, t: t + 0.14, dur: 0.09, g: 0.06 });
        this.tone({ bus: 'narrative', type: 'square', f0: 880, t: t + 0.28, dur: 0.1, g: 0.055, filterType: 'lowpass', filterFreq: 1200 });
        break;
      }

      case 'story.endingPreserve': {
        // A single file finishing its write. Completion, not triumph.
        this.noise({ bus: 'ui', t, dur: 0.012, g: 0.04, filterType: 'bandpass', filterFreq: 1600, filterQ: 2 });
        this.noise({ bus: 'ui', t: t + 0.07, dur: 0.012, g: 0.04, filterType: 'bandpass', filterFreq: 1600, filterQ: 2 });
        this.tone({ bus: 'ui', type: 'triangle', f0: 320, t: t + 0.18, dur: 0.22, g: 0.06 });
        this.tone({ bus: 'ui', type: 'sine', f0: 640, t: t + 0.18, dur: 0.18, g: 0.014 });
        break;
      }

      case 'archive.downloadComplete': {
        // Short, restrained data-settling; no victory chord.
        this.tone({ bus: 'ui', type: 'sine', f0: 1300, t, dur: 0.014, g: 0.035 });
        this.tone({ bus: 'ui', type: 'sine', f0: 1450, t: t + 0.05, dur: 0.014, g: 0.035 });
        this.tone({ bus: 'ui', type: 'triangle', f0: 430, t: t + 0.12, dur: 0.15, g: 0.05 });
        break;
      }

      case 'viewtube.pause': {
        // Mechanical pause click; the recording's air cuts off with it.
        this.noise({ bus: 'ui', t, dur: 0.01, g: 0.065, filterType: 'bandpass', filterFreq: 2000, filterQ: 1.5 });
        this.tone({ bus: 'ui', type: 'sine', f0: 500, t: t + 0.004, dur: 0.03, g: 0.05 });
        this.noise({ bus: 'ambience', t: t + 0.01, dur: 0.08, g: 0.02, attack: 0.002, filterType: 'lowpass', filterFreq: 1400 });
        break;
      }

      /* ============ P1: flight secrets (§4.1) ============ */

      case 'flight.gate40Block': {
        // A very short low locking pulse layered over the normal hit.
        // Identical every time — it must never hint at the secret route.
        this.tone({ bus: 'gameplay', type: 'sine', f0: 65, t: t + 0.05, dur: 0.07, g: 0.1 });
        this.tone({ bus: 'gameplay', type: 'square', f0: 130, t: t + 0.05, dur: 0.035, g: 0.035, filterType: 'lowpass', filterFreq: 500 });
        break;
      }

      case 'flight.level2Connect': {
        // The old synth voice reconnecting: a held-down channel recovering,
        // not a cinematic burst. Fires once per run.
        [220, 330].forEach((f) => {
          const osc = this.ctx!.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(f, t);
          const filter = this.ctx!.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, t);
          filter.frequency.exponentialRampToValueAtTime(2600, t + 0.35);
          const gain = this.ctx!.createGain();
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(0.04, t + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.62);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bus('gameplay'));
          osc.start(t);
          osc.stop(t + 0.66);
        });
        break;
      }

      case 'flight.altitudeStep': {
        // Soft sensor pulse; pitch follows the position in the sequence
        // (variant 0–7), never the raw altitude value.
        const idx = Math.max(0, Math.min(7, options.variant ?? 0));
        const scale = [523, 587, 659, 698, 784, 880, 988, 1046];
        this.tone({ bus: 'gameplay', type: 'sine', f0: scale[idx], t, dur: 0.09, g: 0.05, attack: 0.012 });
        this.tone({ bus: 'gameplay', type: 'sine', f0: 130, t, dur: 0.05, g: 0.02 });
        break;
      }

      case 'flight.collisionBypass': {
        // Two tiny fragments of data dislocation: the collision sound is
        // cut off, and its missing middle is the effect. No big glitch.
        this.noise({ bus: 'gameplay', t, dur: 0.03, g: 0.09, filterType: 'lowpass', filterFreq: 900 });
        this.noise({ bus: 'gameplay', t: t + 0.12, dur: 0.02, g: 0.05, filterType: 'bandpass', filterFreq: 1200, filterQ: 3 });
        break;
      }

      /* ============ P1: UI states (§4.2) ============ */

      case 'ui.close': {
        // Short downward soft-plastic release.
        this.tone({ bus: 'ui', type: 'sine', f0: 620, f1: 420, t, dur: 0.06, g: 0.05 });
        this.noise({ bus: 'ui', t, dur: 0.012, g: 0.025, filterType: 'highpass', filterFreq: 2000 });
        break;
      }

      case 'ui.toggle': {
        // Same material both ways, opposite direction: variant 1 on, 0 off.
        const on = (options.variant ?? 1) > 0;
        this.tone({ bus: 'ui', type: 'sine', f0: on ? 480 : 660, f1: on ? 660 : 480, t, dur: 0.05, g: 0.05 });
        break;
      }

      case 'ui.disabled': {
        // A muted dot; not an error alarm.
        this.noise({ bus: 'ui', t, dur: 0.02, g: 0.03, filterType: 'lowpass', filterFreq: 300 });
        this.tone({ bus: 'ui', type: 'sine', f0: 240, t, dur: 0.026, g: 0.04 });
        break;
      }

      /* ============ P1: phone navigation (§4.3) ============ */

      case 'phone.tab': {
        // A very short lateral switch tick.
        this.noise({ bus: 'ui', t, dur: 0.01, g: 0.035, filterType: 'highpass', filterFreq: 1800 });
        this.tone({ bus: 'ui', type: 'sine', f0: 980, t, dur: 0.014, g: 0.035 });
        break;
      }

      case 'phone.scroll': {
        // Faint finger-on-glass friction; gesture start and end only.
        this.noise({ bus: 'ui', t, dur: 0.06, g: 0.025, attack: 0.015, filterType: 'bandpass', filterFreq: 1000, filterQ: 0.7 });
        break;
      }

      case 'phone.modalOpen': {
        // A thin card expanding — lighter than an app opening.
        this.tone({ bus: 'ui', type: 'sine', f0: 660, f1: 880, t, dur: 0.07, g: 0.04 });
        this.noise({ bus: 'ui', t, dur: 0.02, g: 0.015, filterType: 'highpass', filterFreq: 2400 });
        break;
      }

      case 'phone.modalClose': {
        // The same card folding shut.
        this.tone({ bus: 'ui', type: 'sine', f0: 880, f1: 640, t, dur: 0.06, g: 0.038 });
        break;
      }

      case 'phone.notification': {
        // One low-volume prompt; deliberately no famous brand shape.
        this.tone({ bus: 'ui', type: 'triangle', f0: 740, t, dur: 0.15, g: 0.04 });
        this.tone({ bus: 'ui', type: 'sine', f0: 494, t: t + 0.02, dur: 0.12, g: 0.015 });
        break;
      }

      /* ============ P1: keyboard (§4.4) ============ */

      case 'key.space': {
        // Lower and wider than a character key; only every other press.
        if ((this.counters['space'] = (this.counters['space'] ?? 0) + 1) % 2 === 0) return;
        this.noise({ bus: 'ui', t, dur: 0.025, g: 0.045, filterType: 'bandpass', filterFreq: 1400, filterQ: 1.2 });
        this.tone({ bus: 'ui', type: 'sine', f0: 720, t, dur: 0.02, g: 0.02 });
        break;
      }

      /* ============ P1: monologue (§4.5) ============ */

      case 'narrative.lineEnd': {
        // A light landing, 30–50 ms; no cadence melody.
        this.tone({ bus: 'narrative', type: 'sine', f0: 880, f1: 820, t, dur: 0.04, g: 0.022 });
        break;
      }

      case 'narrative.interrupt': {
        // A tiny tape cut / cursor abort when a thought is replaced.
        this.noise({ bus: 'narrative', t, dur: 0.018, g: 0.03, filterType: 'highpass', filterFreq: 1200 });
        this.tone({ bus: 'narrative', type: 'square', f0: 400, f1: 200, t: t + 0.008, dur: 0.025, g: 0.02, filterType: 'lowpass', filterFreq: 1500 });
        break;
      }

      case 'narrative.clueEmphasis': {
        // A single firmer tick for an evidence-backed keyword.
        this.tone({ bus: 'narrative', type: 'sine', f0: 1150, t, dur: 0.022, g: 0.035 });
        this.tone({ bus: 'narrative', type: 'sine', f0: 575, t, dur: 0.02, g: 0.012 });
        break;
      }

      /* ============ P1: meta foley (§4.6) ============ */

      case 'meta.handDepart': {
        // Low skin/cloth friction, under 100 ms.
        this.noise({ bus: 'metaFoley', t, dur: 0.09, g: 0.05, attack: 0.02, filterType: 'lowpass', filterFreq: 500 });
        break;
      }

      case 'meta.fingerSwipe': {
        // Fine friction, 120–350 ms; intensity 0..1 sets the travel length.
        const amount = Math.max(0, Math.min(1, options.intensity ?? 0.5));
        const dur = 0.12 + amount * 0.23;
        this.noise({ bus: 'metaFoley', t, dur, g: 0.04, attack: dur * 0.3, filterType: 'bandpass', filterFreq: 900, filterQ: 0.8 });
        break;
      }

      case 'meta.regrip': {
        // Light frame contact, then the palm settling.
        this.tone({ bus: 'metaFoley', type: 'sine', f0: 180, t, dur: 0.03, g: 0.05 });
        this.noise({ bus: 'metaFoley', t: t + 0.03, dur: 0.04, g: 0.055, filterType: 'lowpass', filterFreq: 600 });
        break;
      }

      /* ============ P1: app evidence (§4.7) ============ */

      case 'viewtube.videoStart': {
        // Old player relay click, then the compressed noise floor engages.
        this.noise({ bus: 'ui', t, dur: 0.008, g: 0.06, filterType: 'bandpass', filterFreq: 2500, filterQ: 2 });
        this.tone({ bus: 'ui', type: 'sine', f0: 320, t: t + 0.004, dur: 0.03, g: 0.04 });
        this.noise({ bus: 'ambience', t: t + 0.06, dur: 0.7, g: 0.016, attack: 0.12, filterType: 'lowpass', filterFreq: 1800 });
        break;
      }

      case 'viewtube.barrage': {
        // One density-rising data sizzle for the whole flood — never one
        // sound per comment.
        this.noise({ bus: 'ui', t, dur: 0.55, g: 0.022, attack: 0.4, filterType: 'highpass', filterFreq: 2000 });
        this.noise({ bus: 'ui', t: t + 0.25, dur: 0.4, g: 0.016, attack: 0.2, filterType: 'highpass', filterFreq: 3200 });
        break;
      }

      case 'archive.yearSwitch': {
        // An old drive doing a short seek: head ticks, then a motor thunk.
        [0, 0.04, 0.085].forEach((offset) => {
          this.noise({ bus: 'ui', t: t + offset, dur: 0.01, g: 0.04, filterType: 'bandpass', filterFreq: 1200, filterQ: 3 });
        });
        this.tone({ bus: 'ui', type: 'sine', f0: 90, t: t + 0.12, dur: 0.06, g: 0.06 });
        break;
      }

      case 'archive.downloadStart': {
        // An old data-transfer chirp starting up.
        this.tone({ bus: 'ui', type: 'square', f0: 600, f1: 1400, t, dur: 0.09, g: 0.03, filterType: 'lowpass', filterFreq: 3000 });
        this.tone({ bus: 'ui', type: 'square', f0: 1400, f1: 900, t: t + 0.1, dur: 0.08, g: 0.025, filterType: 'lowpass', filterFreq: 3000 });
        break;
      }

      case 'amazemart.purchase': {
        // A deliberately over-happy store checkout.
        [523, 659, 784].forEach((f, i) => {
          this.tone({ bus: 'ui', type: 'triangle', f0: f, t: t + i * 0.07, dur: 0.12, g: 0.06 });
          this.tone({ bus: 'ui', type: 'sawtooth', f0: f, t: t + i * 0.07, dur: 0.1, g: 0.018, filterType: 'lowpass', filterFreq: 4200 });
        });
        break;
      }

      case 'amazemart.delivery': {
        // The checkout jingle is truncated; a file unzips and drops instead.
        this.tone({ bus: 'ui', type: 'triangle', f0: 523, t, dur: 0.09, g: 0.055 });
        this.tone({ bus: 'ui', type: 'triangle', f0: 659, t: t + 0.07, dur: 0.05, g: 0.05 });
        this.noise({ bus: 'ui', t: t + 0.26, dur: 0.04, g: 0.045, filterType: 'bandpass', filterFreq: 1600, filterQ: 1.5 });
        this.tone({ bus: 'ui', type: 'sine', f0: 220, f1: 140, t: t + 0.32, dur: 0.08, g: 0.06 });
        break;
      }

      case 'screenshot.zoom': {
        // Paper coming closer under glass.
        this.noise({ bus: 'ui', t, dur: 0.1, g: 0.032, attack: 0.03, filterType: 'lowpass', filterFreq: 900 });
        this.tone({ bus: 'ui', type: 'sine', f0: 500, f1: 620, t, dur: 0.08, g: 0.02 });
        break;
      }

      case 'social.sort': {
        // Cards shuffling: variant 1 rewinds to oldest (ascending ticks),
        // variant 0 returns to newest (descending).
        const oldest = (options.variant ?? 0) > 0;
        const steps = oldest ? [820, 940, 1080] : [1080, 940, 820];
        steps.forEach((f, i) => {
          this.noise({ bus: 'ui', t: t + i * 0.045, dur: 0.012, g: 0.03, filterType: 'bandpass', filterFreq: 1100, filterQ: 2 });
          this.tone({ bus: 'ui', type: 'sine', f0: f, t: t + i * 0.045, dur: 0.02, g: 0.022 });
        });
        break;
      }

      case 'messages.incoming': {
        // A gentle, old-device single-tone notification.
        this.tone({ bus: 'ui', type: 'triangle', f0: 620, t, dur: 0.18, g: 0.045 });
        this.tone({ bus: 'ui', type: 'sine', f0: 1240, t: t + 0.02, dur: 0.1, g: 0.01 });
        break;
      }

      case 'messages.typing': {
        // Two or three sparse, irregular soft keys — then she stops.
        [0, 0.22, 0.55].forEach((offset, i) => {
          if (i === 2 && (this.counters['maraTyping'] ?? 0) % 2 === 0) return;
          this.noise({ bus: 'ui', t: t + offset, dur: 0.014, g: 0.02, filterType: 'bandpass', filterFreq: 2100, filterQ: 2 });
        });
        this.counters['maraTyping'] = (this.counters['maraTyping'] ?? 0) + 1;
        break;
      }

      /* ============ P1: truth & endings (§4.8) ============ */

      case 'story.dataCorrupt': {
        // A controlled, reproducible read gap: the tone plays, loses its
        // middle, and resumes. Same shape every time.
        this.tone({ bus: 'narrative', type: 'square', f0: 440, t, dur: 0.06, g: 0.04, filterType: 'lowpass', filterFreq: 1600 });
        this.tone({ bus: 'narrative', type: 'square', f0: 440, t: t + 0.15, dur: 0.05, g: 0.035, filterType: 'lowpass', filterFreq: 1200 });
        break;
      }

      case 'story.serviceTerminated': {
        // An electronic service going away: dry, descending, done.
        this.tone({ bus: 'narrative', type: 'square', f0: 520, f1: 180, t, dur: 0.15, g: 0.05, filterType: 'lowpass', filterFreq: 1800 });
        this.noise({ bus: 'narrative', t: t + 0.16, dur: 0.012, g: 0.04, filterType: 'bandpass', filterFreq: 1000, filterQ: 2 });
        break;
      }

      case 'story.endingSubmit': {
        // A modern ad-style victory: complete, loud enough, and hollow —
        // it simply stops, with nothing after it.
        [523, 659, 784, 1046].forEach((f, i) => {
          this.tone({ bus: 'ui', type: 'sawtooth', f0: f, t: t + i * 0.09, dur: 0.14, g: 0.055, filterType: 'lowpass', filterFreq: 5200 });
          this.tone({ bus: 'ui', type: 'square', f0: f / 2, t: t + i * 0.09, dur: 0.12, g: 0.02 });
        });
        break;
      }

      case 'story.endingPublicize': {
        // Notifications cluster and rise — then the server shuts them off.
        [740, 831, 740, 880].forEach((f, i) => {
          this.tone({ bus: 'ui', type: 'triangle', f0: f, t: t + i * 0.1, dur: 0.09, g: 0.04 });
        });
        this.tone({ bus: 'ui', type: 'square', f0: 400, f1: 60, t: t + 0.48, dur: 0.2, g: 0.06, filterType: 'lowpass', filterFreq: 900 });
        break;
      }
    }
  }

  /* ---------------------------------------------------------------- */
  /* Legacy method names (§7 migration): kept so existing call sites   */
  /* keep working; each maps onto a single new identity.               */
  /* ---------------------------------------------------------------- */

  playJump() { this.play('flight.flap'); }
  playTick() { this.play('ui.secondaryTap'); }
  playUnlock() { this.play('story.clueUnlock'); }
  playGlitch() { this.play('search.noResult'); }
  playSuccess() { this.play('auth.correct'); }
  playExplode() {
    // Contact first, stall after — causality stays readable (§4.1).
    this.play('flight.pipeHit');
    this.play('flight.birdFall', { delay: 0.07 });
  }

  /* ---------------------------------------------------------------- */
  /* Ambient hum (phone electronics; routed through the ambience bus)  */
  /* ---------------------------------------------------------------- */

  startAmbientHum() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    if (this.ambientOsc) return;

    try {
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
      this.ambientGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(this.ambientOsc.frequency);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.bus('ambience'));

      lfo.start();
      this.ambientOsc.start();
    } catch (e) {
      console.warn('Failed to start ambient hum:', e);
    }
  }

  stopAmbientHum() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch (e) { /* already stopped */ }
      this.ambientOsc = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch (e) { /* already disconnected */ }
      this.ambientGain = null;
    }
  }

  /* ---------------------------------------------------------------- */
  /* Meta room tone (§4.6): the room only exists after the reveal.     */
  /* Low enough that it is felt when listened for, never noticed.      */
  /* ---------------------------------------------------------------- */

  private roomToneSrc: AudioBufferSourceNode | null = null;
  private roomToneGain: GainNode | null = null;

  startRoomTone() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || this.roomToneSrc) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer();
      src.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1.6);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.bus('ambience'));
      src.start();
      this.roomToneSrc = src;
      this.roomToneGain = gain;
    } catch (e) {
      console.warn('Failed to start room tone:', e);
    }
  }

  stopRoomTone() {
    if (this.roomToneGain && this.ctx) {
      try {
        this.roomToneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
      } catch (e) { /* already gone */ }
    }
    const src = this.roomToneSrc;
    if (src) {
      try {
        src.stop(this.ctx ? this.ctx.currentTime + 1.2 : undefined);
      } catch (e) { /* already stopped */ }
      this.roomToneSrc = null;
      this.roomToneGain = null;
    }
  }
}

export const audio = new AudioManager();
export default audio;
