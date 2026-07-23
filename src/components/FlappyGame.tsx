import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameProgress, ActiveApp } from '../types';
import audio from '../lib/audio';
import music from '../lib/music';
import { EASY_FLAPPY_SETTINGS, FlappyDeathCause, GATE_40_INDEX, getCheapTelemetry, getFlappyNightMix, getGateHeights, getGateSpawnX, getGateVisualStyle, getScoreAfterPassingGate, nextGate40DeathCount, resolvePipeCollision } from '../lib/flappyPhysics';
import { calculateBeatPercentage, createPublicLeaderboard } from '../lib/leaderboard';
import { RefreshCw, Play, Volume2, VolumeX, CheckCircle, Zap, Crown, Sparkles, Rocket, Brain, Activity } from 'lucide-react';
import { LeaderboardPanel } from './LeaderboardPanel';
import {
  CHAPTER_TEN_NODES,
  createFlightState,
  createRunRouteState,
  deriveRoutePoints,
  isGate40Passable,
  requiredRoutePointCount,
  shouldAcceptPlayerInput,
  touchesRoutePoint,
  type ChapterTenPhase,
  type FlightState,
} from '../lib/chapterTenFlight';
import {
  drawChapterTenBeat,
  drawChapterTenBird,
  drawChapterTenComplete,
  drawChapterTenFlightCredits,
  drawChapterTenHud,
  drawChapterTenPipe,
  drawChapterTenRoutePoint,
  drawChapterTenTakeoverPause,
  drawChapterTenWorld,
} from './chapterTenCanvas';
import {
  CHAPTER_TEN_ASSIST_FAIL_THRESHOLD,
  CHAPTER_TEN_ASSIST_NOTE,
  CHAPTER_TEN_ASSIST_PROMPT,
  CHAPTER_TEN_WELCOME_LABEL,
  CHAPTER_TEN_WELCOME_NOTE,
  computeAssistPlan,
  getAssistMarkPositions,
  type AssistPlan,
} from '../lib/chapterTenAssist';
import { useMetaInteraction } from './MetaInteractionScene';
import { ARCANE_FLIGHT_REFLECTIONS, ARCANE_TAKEOVER_LINES } from '../lib/chapterTenCredits';
import {
  computePerformancePlan,
  getPerformanceObstaclePositions,
  performanceSampleAt,
  performanceScoreAtFrame,
  type PerformancePlan,
} from '../lib/chapterTenPerformance';
import { drawPerformanceBird, drawPerformanceObstacles } from './chapterTenPerformanceCanvas';

interface FlappyGameProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onHome: () => void;
  onSuspiciousRunSelected: () => void;
  chapterTenPlayerFullscreen: boolean;
  onChapterTenTakeover: () => void;
}

// Sequence of target altitudes near pipe 40
const ALTITUDE_SEQUENCE = [184, 172, 149, 133, 121, 118, 126, 143];

// Easier pacing: slower horizontal motion, wider openings, and more breathing
// room between gates. Scoring and gate spawning remain in lockstep.
const PACE_INTERVAL_FRAMES = EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
const CHAPTER_TEN_TAKEOVER_FALLBACK_MS = 9000;

export const FlappyGame: React.FC<FlappyGameProps> = ({
  progress,
  updateProgress,
  onHome,
  onSuspiciousRunSelected,
  chapterTenPlayerFullscreen,
  onChapterTenTakeover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(audio.getMuted());
  const [highScore, setHighScore] = useState(progress.bestScore);
  
  // Real-time debug metrics to display to user
  const [currentAlt, setCurrentAlt] = useState(0);
  const [seqIndex, setSeqIndex] = useState(0); // index in altitude matching
  const [seqMatched, setSeqMatched] = useState<boolean[]>(new Array(8).fill(false));
  const [hackedMode, setHackedMode] = useState(false);
  const [showChapterTenWelcome, setShowChapterTenWelcome] = useState(
    progress.currentChapter === 10,
  );
  const {
    active: metaInteractionActive,
    pulsePlayerTap,
    beginAutonomousControl,
    pulseAutonomousTap,
    endAutonomousControl,
    speak,
  } = useMetaInteraction();
  const chapterTenActive = progress.currentChapter === 10;
  const chapterTenEntryDotsSpokenRef = useRef(false);
  const beginAutonomousControlRef = useRef(beginAutonomousControl);
  const metaInteractionActiveRef = useRef(metaInteractionActive);
  const chapterTenTakeoverFallbackTimerRef = useRef<number | null>(null);
  beginAutonomousControlRef.current = beginAutonomousControl;
  metaInteractionActiveRef.current = metaInteractionActive;

  useEffect(() => {
    if (!chapterTenActive) {
      chapterTenEntryDotsSpokenRef.current = false;
      return;
    }
    if (!chapterTenEntryDotsSpokenRef.current) {
      chapterTenEntryDotsSpokenRef.current = true;
      speak(['...']);
    }
  }, [chapterTenActive, speak]);

  // Chapter 10 route-point assist. After five straight sub-41 runs the game
  // offers a precise, deterministic click pattern (see chapterTenAssist.ts) that
  // threads every light point. Refs mirror the state so the canvas loop reads
  // them without re-subscribing.
  const [assistOffered, setAssistOffered] = useState(false);
  const [assistEnabled, setAssistEnabled] = useState(false);
  const assistEnabledRef = useRef(false);
  const assistPlanRef = useRef<AssistPlan | null>(null);
  const chapterTenFailsRef = useRef(0);

  // Core physics references to prevent state lag in canvas loop
  const stateRef = useRef({
    birdY: 150,
    birdVelocity: 0,
    birdGravity: 0.18,
    birdJump: -3.6,
    pipes: [] as Array<{ x: number; topHeight: number; bottomHeight: number; passed: boolean; index: number }>,
    frameCount: 0,
    score: 0,
    pipeIndexCounter: 0,
    gameOver: false,
    bypassActive: false,
    seqIndex: 0,
    seqMatched: new Array(8).fill(false),
    terminalGlitchActive: false,
    devNotes: [] as Array<{ x: number; y: number; text: string; opacity: number }>,
    trail: [] as number[], // visual-only motion residue for the wireframe layer
    popups: [] as Array<{ x: number; y: number; text: string; life: number }>, // slop praise popups
    lastJumpFrame: -100, // visual-only tap ripple timing
    chapterTenRoute: createRunRouteState(),
    chapterTenFlight: null as FlightState | null,
    chapterTenPhase: 'player-route' as ChapterTenPhase,
    chapterTenBeatFrames: 0,
    chapterTenCompleteFrames: 0,
    chapterTenTakeoverSpoken: false,
    chapterTenMemoryDotsSpoken: false,
    chapterTenTerminalDotsSpoken: false,
    chapterTenReflectionIndex: 0,
    chapterTenFinaleStarted: false,
    chapterTenTakeoverPaused: false,
    chapterTenPerf: null as PerformancePlan | null,
    chapterTenPerfFrame: 0,
    chapterTenGravitySign: 1 as 1 | -1,
    chapterTenDiving: false,
  });

  const resetGame = () => {
    stateRef.current = {
      birdY: 150,
      birdVelocity: 0,
      birdGravity: 0.18,
      birdJump: -3.6,
      pipes: [],
      frameCount: 0,
      score: 0,
      pipeIndexCounter: 0,
      gameOver: false,
      bypassActive: false,
      seqIndex: 0,
      seqMatched: new Array(8).fill(false),
      terminalGlitchActive: false,
      devNotes: [
        { x: 400, y: 80, text: 'INIT SYSTEM_CORE', opacity: 0.8 },
        { x: 600, y: 220, text: 'MEM_ALLOC: OK', opacity: 0.6 },
        { x: 900, y: 150, text: 'WARNING: SYSTEM OBSOLETE', opacity: 0.5 },
        { x: 1200, y: 120, text: 'PIPE_A_040 · COLLIDER: TRUE', opacity: 0.5 },
        { x: 1500, y: 260, text: 'LEGACY_ASSET_MISSING', opacity: 0.6 },
      ],
      trail: [],
      popups: [],
      lastJumpFrame: -100,
      chapterTenRoute: createRunRouteState(),
      chapterTenFlight: null,
      chapterTenPhase: 'player-route',
      chapterTenBeatFrames: 0,
      chapterTenCompleteFrames: 0,
      chapterTenTakeoverSpoken: false,
      chapterTenMemoryDotsSpoken: false,
      chapterTenTerminalDotsSpoken: false,
      chapterTenReflectionIndex: 0,
      chapterTenFinaleStarted: false,
      chapterTenTakeoverPaused: false,
      chapterTenPerf: null,
      chapterTenPerfFrame: 0,
      chapterTenGravitySign: 1,
      chapterTenDiving: false,
    };
    endAutonomousControl();
    if (chapterTenTakeoverFallbackTimerRef.current !== null) {
      window.clearTimeout(chapterTenTakeoverFallbackTimerRef.current);
      chapterTenTakeoverFallbackTimerRef.current = null;
    }
    if (chapterTenActive) music.setPhase(10);
    setScore(0);
    setSeqIndex(0);
    setSeqMatched(new Array(8).fill(false));
    setHackedMode(false);
    setIsPlaying(true);
    setShowLeaderboard(false);
    setShowResults(false);
  };

  const resumeChapterTenTakeover = useCallback(() => {
    const state = stateRef.current;
    if (!state.chapterTenTakeoverPaused || state.gameOver) return;
    state.chapterTenTakeoverPaused = false;
    if (chapterTenTakeoverFallbackTimerRef.current !== null) {
      window.clearTimeout(chapterTenTakeoverFallbackTimerRef.current);
      chapterTenTakeoverFallbackTimerRef.current = null;
    }
    if (metaInteractionActiveRef.current) {
      beginAutonomousControlRef.current('flappy-canvas');
    }
    if (!state.chapterTenFinaleStarted) {
      state.chapterTenFinaleStarted = true;
      music.playFinaleOnce();
    }
    audio.play('flight.level2Connect');
  }, []);

  useEffect(() => () => {
    if (chapterTenTakeoverFallbackTimerRef.current !== null) {
      window.clearTimeout(chapterTenTakeoverFallbackTimerRef.current);
    }
  }, []);

  // Retry is a reset-suction, never the clue-unlock chord (§4.1).
  const restartRun = () => {
    audio.play('flight.restart');
    resetGame();
  };

  const beginChapterTenTrace = () => {
    setShowChapterTenWelcome(false);
    audio.play('ui.toggle', { variant: 1 });
    resetGame();
  };

  const openLeaderboard = () => {
    audio.play('leaderboard.open');
    setShowLeaderboard(true);
    updateProgress((prev) => ({ ...prev, seenLeaderboard: true }));
  };

  const enterMetaFromRun = () => {
    onHome();
    onSuspiciousRunSelected();
  };

  // Accept the offered help: compute the pattern once (deterministic, ~0.5s),
  // switch the crosses on, and immediately start a fresh guided run.
  const acceptAssist = () => {
    if (!assistPlanRef.current) assistPlanRef.current = computeAssistPlan();
    assistEnabledRef.current = true;
    setAssistEnabled(true);
    setAssistOffered(false);
    audio.play('ui.toggle', { variant: 1 });
    restartRun();
  };

  const declineAssist = () => {
    setAssistOffered(false);
    audio.play('ui.close');
  };

  const handleJump = (e: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
    if (e.type === 'keydown' && (e as KeyboardEvent).code !== 'Space') return;
    if (e.cancelable) e.preventDefault();

    if (!isPlaying) {
      if (showLeaderboard) {
        setShowLeaderboard(false);
      } else {
        // From the results screen or the start screen, SPACE starts a new run
        restartRun();
      }
      return;
    }

    if (stateRef.current.gameOver) {
      restartRun();
      return;
    }

    if (
      chapterTenActive
      && !shouldAcceptPlayerInput(stateRef.current.chapterTenPhase)
    ) return;
    stateRef.current.birdVelocity = stateRef.current.birdJump;
    stateRef.current.lastJumpFrame = stateRef.current.frameCount; // tap ripple
    if (chapterTenActive) pulsePlayerTap('flappy-canvas');
    audio.play('flight.flap');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleJump(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterTenActive, isPlaying, showLeaderboard]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    const gameLoop = () => {
      const state = stateRef.current;
      // width and height are already defined in outer scope if needed, or we can use local duplicates
      const width = canvas.width;
      const height = canvas.height;

      // Clean Canvas
      ctx.clearRect(0, 0, width, height);

      // --- Background Rendering ---
      if (chapterTenActive && state.chapterTenFlight) {
        drawChapterTenWorld(ctx, width, height, state.score, state.frameCount);
      } else if (!hackedMode) {
        // Level 1 begins in bright daylight. The night overlay only fades in at
        // score 36 and becomes complete at the sealed Level 2 boundary.
        const nightMix = getFlappyNightMix(state.score);
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#72d8ff');
        bgGrad.addColorStop(0.35, '#a8ddff');
        bgGrad.addColorStop(0.7, '#b8b8ff');
        bgGrad.addColorStop(1, '#42d5ff');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        if (nightMix > 0) {
          const nightGrad = ctx.createLinearGradient(0, 0, 0, height);
          nightGrad.addColorStop(0, '#020617');
          nightGrad.addColorStop(0.45, '#11103d');
          nightGrad.addColorStop(1, '#06283f');
          ctx.save();
          ctx.globalAlpha = nightMix;
          ctx.fillStyle = nightGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // Clashing stylized clouds with 3 different styles
        for (let i = 0; i < 3; i++) {
          const cloudX = ((state.frameCount * (0.8 + i * 0.4)) % (width + 160)) - 80;
          const cloudY = 40 + i * 40;
          
          ctx.save();
          // Add subtle inconsistent shadows/opacities to make it look slightly uncoordinated
          ctx.fillStyle = i === 0 ? 'rgba(255, 255, 255, 0.45)' : i === 1 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.38)';
          ctx.shadowColor = i === 0 ? 'rgba(33, 199, 255, 0.3)' : i === 1 ? 'rgba(112, 72, 232, 0.2)' : 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = i === 0 ? 8 : i === 1 ? 4 : 12;
          ctx.shadowOffsetX = i === 0 ? 2 : -2;
          ctx.shadowOffsetY = i === 1 ? 3 : 1;

          if (i === 0) {
            // Style A: Fluffy cloud with slightly inconsistent circle sizes
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, 18, 0, Math.PI * 2);
            ctx.arc(cloudX + 16, cloudY - 8, 26, 0, Math.PI * 2);
            ctx.arc(cloudX + 36, cloudY, 16, 0, Math.PI * 2);
            ctx.fill();
          } else if (i === 1) {
            // Style B: Semi-flat pill-shaped cloud (oval/rounded rect)
            ctx.beginPath();
            const w = 70;
            const h = 24;
            const r = 8;
            ctx.roundRect(cloudX, cloudY - 10, w, h, r);
            ctx.fill();
          } else {
            // Style C: Sharp flat-bottomed cloud (drawn with bezier curves or simplified arcs)
            ctx.beginPath();
            ctx.moveTo(cloudX, cloudY);
            ctx.lineTo(cloudX + 50, cloudY);
            ctx.arc(cloudX + 40, cloudY - 10, 15, 0, Math.PI * 1.5, true);
            ctx.arc(cloudX + 20, cloudY - 15, 20, Math.PI * 1.1, Math.PI * 1.8, true);
            ctx.arc(cloudX + 5, cloudY - 8, 12, Math.PI * 0.8, Math.PI * 1.6, true);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // Floating glow particles: pure decoration, deliberately pointless
        ctx.save();
        for (let i = 0; i < 10; i++) {
          const px = ((i * 97 + state.frameCount * (0.3 + (i % 3) * 0.2)) % (width + 40)) - 20;
          const py = 30 + ((i * 53) % (height - 60)) + Math.sin((state.frameCount + i * 30) * 0.02) * 10;
          ctx.globalAlpha = 0.25 + (i % 4) * 0.1;
          ctx.fillStyle = i % 2 === 0 ? '#c4b5fd' : '#67e8f9';
          ctx.shadowColor = i % 2 === 0 ? '#8b5cf6' : '#22d3ee';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px, py, 1.2 + (i % 3) * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Ads watermark in early slop mode with machine translation vibes
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.font = 'bold 28px "Space Grotesk"';
        ctx.fillText('⚡ THE MOST LEGENDARY FLY EXPERIENCE ⚡', 20, height - 25);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.font = 'bold 16px "Inter"';
        ctx.fillText('★ REVOLUTIONARY SKY PHYSICS ★', width - 330, 40);
        ctx.restore();
      } else {
        // Retro-Hacked CRT Wireframe grid
        ctx.fillStyle = '#090b0e';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)'; // faint green grid
        ctx.lineWidth = 1;
        
        // Vertical lines
        const gridOffset = (state.frameCount * 2) % 40;
        for (let x = -gridOffset; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        // Horizontal lines
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Render floating development annotations
        ctx.save();
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        state.devNotes.forEach((note, noteIndex) => {
          ctx.fillText(note.text, note.x, note.y);
          note.x -= 2; // scroll with background
          if (note.x < -150) {
            note.x = width + 50 + ((noteIndex * 73) % 200);
            note.y = 30 + ((noteIndex * 61) % Math.max(1, height - 60));
          }
        });
        ctx.restore();

        // Altitude ruler along the right edge: the world itself becomes a
        // coordinate chart. Purely decorative — collision math is untouched.
        ctx.save();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
        ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.font = '7px "JetBrains Mono"';
        for (let alt = 0; alt <= 256; alt += 32) {
          const y = height - (alt / 256) * height;
          ctx.beginPath();
          ctx.moveTo(width - 14, y);
          ctx.lineTo(width - 6, y);
          ctx.stroke();
          ctx.fillText(alt.toString().padStart(3, '0'), width - 40, Math.min(height - 2, Math.max(8, y + 2)));
        }
        // Noah's preserved flight path rendered as brighter scale marks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ALTITUDE_SEQUENCE.forEach((alt) => {
          const y = height - (alt / 256) * height;
          ctx.fillRect(width - 18, y - 1, 12, 2);
        });
        ctx.restore();
      }

      // --- Game Physics (Only update when playing) ---
      if (isPlaying && !state.gameOver) {
        if (!(chapterTenActive && state.chapterTenTakeoverPaused)) state.frameCount++;
        if (chapterTenActive && state.chapterTenFlight) {
          if (state.chapterTenTakeoverPaused) {
            // Gate 40 freezes on contact while the camera pulls back and
            // Arcane finishes typing before the performance advances.
          } else if (state.chapterTenFlight.completed) {
            state.chapterTenCompleteFrames += 1;
            if (state.chapterTenCompleteFrames >= 180) triggerCompletion();
          } else if (state.chapterTenPerf && !state.chapterTenDiving) {
            // Arcane performs the verified hard gauntlet: his frame-tight click
            // pattern drives the bird; the route is built to be cleared by it.
            const plan = state.chapterTenPerf;
            const previousFlightScore = state.score;
            if (state.chapterTenPerfFrame < plan.config.frames) state.chapterTenPerfFrame += 1;
            const perfSample = performanceSampleAt(plan, state.chapterTenPerfFrame);
            state.birdY = perfSample.y;
            state.birdVelocity = perfSample.v;
            state.chapterTenGravitySign = perfSample.gravitySign;
            state.score = performanceScoreAtFrame(state.chapterTenPerfFrame, plan.config);
            state.chapterTenPhase = state.score >= CHAPTER_TEN_NODES.distanceHudFrom
              ? (state.score >= CHAPTER_TEN_NODES.terminal ? 'terminal-256' : 'coordinate-flight')
              : (state.score >= CHAPTER_TEN_NODES.memory ? 'memory-184' : 'restored-2013');
            setScore(state.score);
            const reflection = ARCANE_FLIGHT_REFLECTIONS[state.chapterTenReflectionIndex];
            if (
              reflection
              && previousFlightScore < reflection.score
              && state.score >= reflection.score
            ) {
              speak([...reflection.lines]);
              state.chapterTenReflectionIndex += 1;
            }
            setCurrentAlt(Math.max(0, Math.min(256, Math.round(((height - state.birdY) / height) * 256))));
            // The tap is the single shared event: it drives the Meta finger too.
            if (perfSample.tapped) {
              state.lastJumpFrame = state.frameCount;
              pulseAutonomousTap();
              audio.play('flight.flap');
            }
            if (perfSample.flipped) {
              audio.play('flight.level2Connect');
            }
            if (previousFlightScore < CHAPTER_TEN_NODES.memory && state.score >= CHAPTER_TEN_NODES.memory) {
              state.chapterTenBeatFrames = 1;
              audio.play('flight.altitudeStep', { variant: 0 });
              if (!state.chapterTenMemoryDotsSpoken) {
                state.chapterTenMemoryDotsSpoken = true;
                speak(['...']);
              }
            } else if (state.chapterTenBeatFrames > 0) {
              state.chapterTenBeatFrames += 1;
            }
            if (previousFlightScore < CHAPTER_TEN_NODES.terminal && state.score >= CHAPTER_TEN_NODES.terminal) {
              state.chapterTenDiving = true;
              endAutonomousControl();
              audio.play('story.serviceTerminated');
              if (!state.chapterTenTerminalDotsSpoken) {
                state.chapterTenTerminalDotsSpoken = true;
                speak(['...']);
              }
            }
          } else if (state.chapterTenDiving && !state.chapterTenFlight.completed) {
            // At 256 the finger stops; gravity takes him off the bottom — not a death.
            state.chapterTenGravitySign = 1;
            state.birdVelocity = Math.min(
              state.birdVelocity + state.birdGravity * 1.6,
              EASY_FLAPPY_SETTINGS.maxFallSpeed * 1.8,
            );
            state.birdY += state.birdVelocity;
            setCurrentAlt(Math.max(0, Math.min(256, Math.round(((height - state.birdY) / height) * 256))));
            if (state.birdY - 12 > height) {
              state.chapterTenFlight = { ...state.chapterTenFlight, completed: true };
              state.chapterTenCompleteFrames = 1;
              audio.play('flight.complete');
            }
          }
        } else {
        const previousBirdY = state.birdY;
        state.birdVelocity = Math.min(
          state.birdVelocity + state.birdGravity,
          EASY_FLAPPY_SETTINGS.maxFallSpeed,
        );
        state.birdY += state.birdVelocity;

        // Visual-only motion residue drawn by the wireframe layer
        state.trail.push(state.birdY);
        if (state.trail.length > 16) state.trail.shift();

        // Altitude sensor feedback (mapped from 0 to 256 based on canvas height)
        // Canvas height is 400. 0 is bottom, 400 is top. Let's map it: 256 is top, 0 is bottom
        const computedAltitude = Math.round(((height - state.birdY) / height) * 256);
        setCurrentAlt(Math.max(0, Math.min(256, computedAltitude)));

        // Boundary deaths (except in bypass/hacked mode or diving offscreen at 256)
        if (state.birdY < 0 && !state.bypassActive) {
          state.birdY = 0;
          state.birdVelocity = 0;
        }

        // Distance-based scoring: a point every short stretch of flight, not
        // one point per gate cleared. Kept on the same cadence as pipe
        // Pipe Management
        if (state.frameCount % PACE_INTERVAL_FRAMES === 0) {
          const gateIndex = state.pipeIndexCounter++;
          const { topHeight, bottomHeight } = getGateHeights(gateIndex, height);

          state.pipes.push({
            x: getGateSpawnX(gateIndex, width),
            topHeight,
            bottomHeight,
            passed: false,
            index: gateIndex,
          });
        }

        // Move Pipes
        state.pipes.forEach((pipe) => {
          pipe.x -= EASY_FLAPPY_SETTINGS.pipeSpeed;
        });

        if (chapterTenActive) {
          const routePoints = deriveRoutePoints(height, 12);
          state.pipes.forEach((pipe) => {
            routePoints
              .filter((point) => point.gateIndex === pipe.index)
              .forEach((point) => {
                if (
                  !state.chapterTenRoute.has(point.id)
                  && touchesRoutePoint(80, state.birdY, pipe.x + point.offsetX, point.y)
                ) {
                  state.chapterTenRoute.add(point.id);
                  audio.play('flight.altitudeStep', { variant: point.id % ALTITUDE_SEQUENCE.length });
                }
              });
          });
        }

        // Delete Offscreen Pipes
        state.pipes = state.pipes.filter((p) => p.x > -60);

        // --- Collision Check & Core Sequence Logic ---
        state.pipes.forEach((pipe) => {
          const birdX = 80;
          const birdSize = 12;

          // Check passing midpoint
          if (!pipe.passed && pipe.x < birdX) {
            pipe.passed = true;
            const scoreBeforeGate = state.score;
            const nextScore = getScoreAfterPassingGate(pipe.index);
            state.score = Math.max(state.score, nextScore);
            setScore(state.score);
            audio.play('flight.score', { variant: state.score });
            // The 256 black wall announces itself as a dry service
            // disconnection when the final approach begins (§4.8).
            if (hackedMode && scoreBeforeGate < 250 && state.score >= 250) {
              audio.play('story.serviceTerminated');
            }
            setHighScore((previousBest) => Math.max(previousBest, state.score));
            updateProgress((previousProgress) => (
              state.score > previousProgress.bestScore
                ? { ...previousProgress, bestScore: state.score }
                : previousProgress
            ));

            // Meaningless AI praise popup (slop layer only, decoration)
            if (!state.bypassActive) {
              const slogans = ['OPTIMAL PASSAGE', 'AI-ENHANCED CLEARANCE', 'PERFECT CLEARANCE'];
              state.popups.push({
                x: birdX + 40,
                y: Math.max(30, pipe.topHeight + 24),
                text: slogans[pipe.index % 3],
                life: 45,
              });
            }

            // Trigger terminal/hacked graphics once we are inside sequence 40-47
            if (pipe.index >= GATE_40_INDEX && state.bypassActive) {
              // The old synth voice reconnects exactly once, when the
              // wireframe layer first takes over (§4.1).
              if (!hackedMode) audio.play('flight.level2Connect');
              setHackedMode(true);
            }
          }

          const collision = resolvePipeCollision({
            x: birdX,
            radius: birdSize,
            previousY: previousBirdY,
            currentY: state.birdY,
            velocityY: state.birdVelocity,
            pipeX: pipe.x,
            pipeWidth: 50,
            topHeight: pipe.topHeight,
            bottomHeight: pipe.bottomHeight,
            canvasHeight: height,
          });

          // Horizontal surfaces are safe: the bird can stand on a lower pipe
          // or bump the underside of an upper pipe without dying. Gate 40 keeps
          // its story-critical barrier until the route has been unlocked.
          const safeHorizontalContact = collision.kind === 'land' || collision.kind === 'ceiling';
          if (safeHorizontalContact && (pipe.index !== GATE_40_INDEX || state.bypassActive)) {
            state.birdY = collision.y;
            state.birdVelocity = collision.velocityY;
            return;
          }

          const overlapsPipeX = pipe.x <= birdX + birdSize && pipe.x + 50 >= birdX - birdSize;
          if (overlapsPipeX) {
            // Gate 40 is the visible Level 2 seal. The secret route is only
            // evaluated when the bird actually hits its rendered pipe body.
            if (pipe.index === GATE_40_INDEX && !state.bypassActive && collision.fatal) {
              if (
                chapterTenActive
                && progress.unlockedCodeRoute
                && isGate40Passable(state.chapterTenRoute)
              ) {
                state.bypassActive = true;
                state.chapterTenFlight = createFlightState(state.birdY, {
                  canvasHeight: height,
                  birdRadius: birdSize,
                  gravity: state.birdGravity,
                  jump: state.birdJump,
                  maxFall: EASY_FLAPPY_SETTINGS.maxFallSpeed,
                  cruisePaceFrames: 42,
                  sprintPaceFrames: 24,
                  scorePerPipe: 2,
                });
                state.chapterTenPhase = state.chapterTenFlight.phase;
                state.score = CHAPTER_TEN_NODES.takeover;
                setScore(state.score);
                setHackedMode(true);
                state.chapterTenTakeoverPaused = true;
                audio.play('ui.toggle', { variant: 0 });
                onChapterTenTakeover();
                if (!state.chapterTenTakeoverSpoken) {
                  state.chapterTenTakeoverSpoken = true;
                  chapterTenTakeoverFallbackTimerRef.current = window.setTimeout(
                    resumeChapterTenTakeover,
                    CHAPTER_TEN_TAKEOVER_FALLBACK_MS,
                  );
                  speak(ARCANE_TAKEOVER_LINES, resumeChapterTenTakeover);
                }
                chapterTenFailsRef.current = 0; // cleared the gate → streak resets
                // Arcane's hard performance: a verified click pattern + gauntlet.
                state.chapterTenPerf = computePerformancePlan();
                state.chapterTenPerfFrame = 0;
                state.chapterTenGravitySign = 1;
                state.chapterTenDiving = false;
              } else if (chapterTenActive) {
                // Chapter 10 has exactly one Gate 40 key: every light point in
                // this run. Never fall through to the obsolete altitude bypass
                // when even one point is missing.
                handleDeath('Level 2 Seal #40', 'gate40');
              } else if (progress.unlockedCodeRoute) {
                // If the player knows the code, let's track real-time sequence matching!
                // Let's check the current altitude against target altitude sequence at index 0 (184)
                const currentAltitude = Math.round(((height - state.birdY) / height) * 256);
                const target = ALTITUDE_SEQUENCE[0];
                if (Math.abs(currentAltitude - target) <= 18) {
                  // MATCHED step 0! Trigger bypass start.
                  state.bypassActive = true;
                  state.seqIndex = 1;
                  state.seqMatched[0] = true;
                  setSeqIndex(1);
                  setSeqMatched([...state.seqMatched]);
                  audio.play('flight.altitudeStep', { variant: 0 });
                  // spawn developer logs instantly
                  state.devNotes.push({ x: width, y: 100, text: 'COLLIDER_BYPASS_STAGE_01: INITIATED', opacity: 1 });
                } else {
                  handleDeath('Level 2 Seal #40', 'gate40');
                }
              } else {
                handleDeath('Level 2 Seal #40', 'gate40');
              }
            } else if (pipe.index > GATE_40_INDEX && state.bypassActive) {
              // We are active in the bypass mode!
              // For each pipe index from 41 to 47, check if the player matches the sequence target.
              const seqOffset = pipe.index - 40;
              if (seqOffset < ALTITUDE_SEQUENCE.length) {
                const currentAltitude = Math.round(((height - state.birdY) / height) * 256);
                const target = ALTITUDE_SEQUENCE[seqOffset];

                // If they are passing this pipe, check their altitude
                if (pipe.x < birdX + 20 && pipe.x > birdX - 20 && !state.seqMatched[seqOffset]) {
                  if (Math.abs(currentAltitude - target) <= 20) {
                    state.seqMatched[seqOffset] = true;
                    state.seqIndex = seqOffset + 1;
                    setSeqIndex(seqOffset + 1);
                    setSeqMatched([...state.seqMatched]);
                    audio.play('flight.altitudeStep', { variant: seqOffset });
                    
                    state.devNotes.push({ 
                      x: width, 
                      y: pipe.topHeight + 20, 
                      text: `BYPASS_LINK [${seqOffset}] MATCHED: OK`, 
                      opacity: 1 
                    });

                    // At stage 5 (Altitude 118), complete the full structural collapse!
                    if (seqOffset === 5) {
                      state.terminalGlitchActive = true;
                      // The collision sound loses its middle — a data gap,
                      // not a glitch burst (§4.1).
                      audio.play('flight.collisionBypass');
                    }
                  } else {
                    // Missed the height sequence! Structural breakdown fails, you hit the pipe!
                    handleDeath(`Altitude Sequence Unstable at Gate ${pipe.index}`, 'sequence');
                  }
                }
              }
            } else {
              // Only a true vertical-face impact is fatal.
              if (!state.bypassActive && collision.fatal) {
                handleDeath('Collision Detected', 'collision');
              }
            }
          }
        });

        // Resolve pipe platforms before the bottom boundary. This prevents a
        // fast fall from being declared out-of-bounds in the same frame it
        // should land safely on a low pipe.
        if (!state.gameOver && state.birdY > height - 15) {
          if (state.score >= 255) {
            triggerCompletion();
          } else {
            handleDeath('Boundaries Error', 'boundary');
          }
        }
        }
      }

      // --- Draw Pipes ---
      state.pipes.forEach((pipe) => {
        if (chapterTenActive && state.chapterTenFlight) {
          drawChapterTenPipe(ctx, pipe, height, state.score);
        } else if (!hackedMode) {
          // Glassmorphism obstacle columns: translucent gradient, neon core,
          // meaningless stability telemetry. Same geometry as before.
          const bottomY = height - pipe.bottomHeight;
          const gateStyle = getGateVisualStyle(pipe.index);
          const isLevel2Preview = gateStyle.variant === 'level2-preview';
          const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + 50, 0);
          if (isLevel2Preview) {
            pipeGrad.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
            pipeGrad.addColorStop(0.5, 'rgba(20, 184, 166, 0.42)');
            pipeGrad.addColorStop(1, 'rgba(34, 197, 94, 0.3)');
          } else {
            pipeGrad.addColorStop(0, 'rgba(139, 92, 246, 0.38)');
            pipeGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.18)');
            pipeGrad.addColorStop(1, 'rgba(34, 211, 238, 0.32)');
          }

          ctx.save();
          ctx.shadowColor = isLevel2Preview ? 'rgba(20, 184, 166, 0.65)' : 'rgba(139, 92, 246, 0.55)';
          ctx.shadowBlur = 12;
          ctx.fillStyle = pipeGrad;
          ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
          ctx.fillRect(pipe.x, bottomY, 50, pipe.bottomHeight);
          ctx.restore();

          // Gradient-ish border
          ctx.strokeStyle = isLevel2Preview ? 'rgba(45, 212, 191, 0.95)' : 'rgba(167, 139, 250, 0.9)';
          ctx.lineWidth = 2;
          ctx.strokeRect(pipe.x, -2, 50, pipe.topHeight + 2);
          ctx.strokeRect(pipe.x, bottomY, 50, pipe.bottomHeight + 4);

          // Glowing cyan core line
          ctx.save();
          ctx.shadowColor = isLevel2Preview ? 'rgba(34, 197, 94, 0.75)' : 'rgba(34, 211, 238, 0.8)';
          ctx.shadowBlur = 8;
          ctx.strokeStyle = isLevel2Preview ? 'rgba(74, 222, 128, 0.7)' : 'rgba(34, 211, 238, 0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pipe.x + 25, 0);
          ctx.lineTo(pipe.x + 25, pipe.topHeight);
          ctx.moveTo(pipe.x + 25, bottomY);
          ctx.lineTo(pipe.x + 25, height);
          ctx.stroke();
          ctx.restore();

          // Tiny tech tick marks along the inner edges
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          for (let ty = 12; ty < pipe.topHeight - 6; ty += 20) {
            ctx.beginPath();
            ctx.moveTo(pipe.x + 2, ty);
            ctx.lineTo(pipe.x + 7, ty);
            ctx.stroke();
          }
          for (let by = bottomY + 12; by < height - 6; by += 20) {
            ctx.beginPath();
            ctx.moveTo(pipe.x + 43, by);
            ctx.lineTo(pipe.x + 48, by);
            ctx.stroke();
          }

          // Meaningless telemetry labels
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '6px "JetBrains Mono"';
          ctx.fillText(isLevel2Preview ? 'LEVEL 2 MATERIAL' : 'DYNAMIC OBSTACLE', pipe.x + 2, Math.max(8, pipe.topHeight - 6));
          ctx.fillText(`STABILITY: ${90 + ((pipe.index * 7) % 10)}%`, pipe.x + 2, Math.min(height - 4, bottomY + 12));

          // Gate 40 quietly previews the next level: a different material,
          // a few small teeth, and a locked label instead of a red warning wall.
          if (isLevel2Preview) {
            ctx.save();
            ctx.fillStyle = 'rgba(74, 222, 128, 0.9)';
            ctx.shadowColor = 'rgba(20, 184, 166, 0.75)';
            ctx.shadowBlur = 5;
            const spikeWidth = 8;
            const spikeHeight = 6;
            const spikeSpacing = 12;
            for (let spike = 0; spike < gateStyle.spikeCount; spike++) {
              const spikeX = pipe.x + 3 + spike * spikeSpacing;
              ctx.beginPath();
              ctx.moveTo(spikeX, pipe.topHeight);
              ctx.lineTo(spikeX + spikeWidth / 2, pipe.topHeight + spikeHeight);
              ctx.lineTo(spikeX + spikeWidth, pipe.topHeight);
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(spikeX, bottomY);
              ctx.lineTo(spikeX + spikeWidth / 2, bottomY - spikeHeight);
              ctx.lineTo(spikeX + spikeWidth, bottomY);
              ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(167, 243, 208, 0.8)';
            ctx.font = 'bold 8px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL 2 // LOCKED', pipe.x + 25, pipe.topHeight + EASY_FLAPPY_SETTINGS.openingSize / 2);
            ctx.restore();
          }
        } else {
          // Wireframe neon green glitch pipe
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.fillStyle = 'rgba(34, 197, 94, 0.04)';

          // Top pipe outline
          ctx.beginPath();
          ctx.rect(pipe.x, 0, 50, pipe.topHeight);
          ctx.fill();
          ctx.stroke();

          // Bottom pipe outline
          ctx.beginPath();
          ctx.rect(pipe.x, height - pipe.bottomHeight, 50, pipe.bottomHeight);
          ctx.fill();
          ctx.stroke();

          // Draw the index numeric id
          ctx.fillStyle = '#22c55e';
          ctx.font = '8px "JetBrains Mono"';
          ctx.fillText(`GATE_SEC_${pipe.index.toString().padStart(3, '0')}`, pipe.x + 4, pipe.topHeight + 15);
          ctx.fillText(`C_COLLID: FALSE`, pipe.x + 4, height - pipe.bottomHeight - 10);
        }
      });

      if (chapterTenActive && !state.chapterTenFlight) {
        const routePoints = deriveRoutePoints(height, 12);
        state.pipes.forEach((pipe) => {
          routePoints
            .filter((point) => point.gateIndex === pipe.index)
            .forEach((point) => {
              drawChapterTenRoutePoint(ctx, pipe.x, point, state.chapterTenRoute.has(point.id));
            });
        });

        // Assist crosses: each cross marks a frame to press Space. They drift
        // toward the bird at the world's speed; press when a cross reaches the
        // bird's column (x = 80). The next cross stays yellow for its entire
        // approach; every later cross stays red, so nothing flashes at impact.
        if (assistEnabledRef.current && assistPlanRef.current && isPlaying && !state.gameOver) {
          const marks = getAssistMarkPositions(assistPlanRef.current, state.frameCount);
          const currentTargetFrame = marks.find((mark) => mark.frame >= state.frameCount)?.frame;
          for (const mark of marks) {
            const isCurrentTarget = mark.frame === currentTargetFrame;
            const r = isCurrentTarget ? 10 : 8;
            ctx.save();
            ctx.strokeStyle = isCurrentTarget ? 'rgba(253, 224, 71, 1)' : 'rgba(248, 64, 64, 1)';
            ctx.lineWidth = isCurrentTarget ? 4 : 3;
            ctx.shadowColor = isCurrentTarget ? 'rgba(253, 224, 71, 0.95)' : 'rgba(248, 64, 64, 0.9)';
            ctx.shadowBlur = isCurrentTarget ? 12 : 8;
            ctx.beginPath();
            ctx.moveTo(mark.x - r, mark.y - r);
            ctx.lineTo(mark.x + r, mark.y + r);
            ctx.moveTo(mark.x + r, mark.y - r);
            ctx.lineTo(mark.x - r, mark.y + r);
            ctx.stroke();
            ctx.restore();
          }
          // A vertical "press line" at the bird's column clarifies the trigger.
          ctx.save();
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(80, 0);
          ctx.lineTo(80, height);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Arcane's performance gauntlet: the verified obstacles, drawn under him.
      if (
        chapterTenActive
        && state.chapterTenPerf
        && state.chapterTenFlight
        && !state.chapterTenFlight.completed
        && !state.chapterTenDiving
      ) {
        const placed = getPerformanceObstaclePositions(state.chapterTenPerf, state.chapterTenPerfFrame, width);
        drawPerformanceObstacles(ctx, placed, state.chapterTenPerfFrame, height);
      }

      // --- Draw Bird ---
      const birdX = 80;
      const birdY = state.birdY;
      const angle = Math.min(Math.PI / 6, Math.max(-Math.PI / 7, state.birdVelocity * 0.06));

      if (chapterTenActive && state.chapterTenPerf && state.chapterTenFlight) {
        drawPerformanceBird(ctx, birdX, birdY, state.chapterTenGravitySign, state.birdVelocity);
      } else if (chapterTenActive && state.chapterTenFlight) {
        drawChapterTenBird(ctx, birdX, birdY, state.score);
      } else if (hackedMode) {
        // Sampled-path residue: the bird leaves its recent coordinates behind
        ctx.save();
        state.trail.forEach((ty, i) => {
          const a = ((i + 1) / state.trail.length) * 0.4;
          ctx.fillStyle = `rgba(34, 197, 94, ${a.toFixed(2)})`;
          ctx.fillRect(birdX - (state.trail.length - i) * 7, ty - 1.5, 3, 3);
        });
        ctx.restore();
      } else {
        // Slop layer: rainbow-ish glowing particle trail, no physical purpose
        ctx.save();
        state.trail.forEach((ty, i) => {
          const t = (i + 1) / state.trail.length;
          ctx.globalAlpha = t * 0.35;
          ctx.fillStyle = i % 2 === 0 ? '#8b5cf6' : '#22d3ee';
          ctx.beginPath();
          ctx.arc(birdX - (state.trail.length - i) * 6, ty, 2.5 * t + 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      if (!(chapterTenActive && state.chapterTenFlight)) {
        ctx.save();
        ctx.translate(birdX, birdY);
        ctx.rotate(angle);

      if (!hackedMode) {
        // NeuroBird: purple gradient glowing orb, giant cartoon eye, fake
        // neural circuitry. No light-source logic whatsoever.
        const orb = ctx.createRadialGradient(-4, -4, 2, 0, 0, 15);
        orb.addColorStop(0, '#c4b5fd');
        orb.addColorStop(0.55, '#8b5cf6');
        orb.addColorStop(1, '#4c1d95');

        ctx.save();
        ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Cyan glow ring outline
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Fake neural-network lines and nodes on the body
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-7, 3);
        ctx.lineTo(-2, -2);
        ctx.lineTo(3, 4);
        ctx.lineTo(8, -1);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        [[-7, 3], [-2, -2], [3, 4], [8, -1]].forEach(([nx, ny]) => {
          ctx.beginPath();
          ctx.arc(nx, ny, 1, 0, Math.PI * 2);
          ctx.fill();
        });

        // Giant cartoon eye, plus a tiny misaligned second eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(5, -4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(6, -4, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(7, -5, 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, -8, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Wing: a glowing cyan chevron that flaps like a UI icon
        const wingFlap = Math.sin(state.frameCount * 0.4) * 5;
        ctx.save();
        ctx.shadowColor = 'rgba(34, 211, 238, 0.7)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(34, 211, 238, 0.9)';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-15, -4 - wingFlap);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Flap sparkles while rising
        if (state.birdVelocity < -1) {
          ctx.fillStyle = 'rgba(196, 181, 253, 0.8)';
          [[-18, -2], [-21, 4], [-16, 7]].forEach(([sx, sy]) => {
            ctx.fillRect(sx - 0.5, sy - 2, 1, 4);
            ctx.fillRect(sx - 2, sy - 0.5, 4, 1);
          });
        }

        // Tap ripple: expanding cyan ring for a few frames after each jump
        const sinceJump = state.frameCount - state.lastJumpFrame;
        if (sinceJump >= 0 && sinceJump < 16) {
          ctx.save();
          ctx.globalAlpha = (1 - sinceJump / 16) * 0.6;
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 6 + sinceJump * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // Wireframe geometric green bird representing original developer code
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';

        // Draw simple triangle/polygon bird shape
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.lineTo(12, 0);
        ctx.lineTo(-12, 8);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw direction vectors for debugging
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(25, 0); // forward vector
        ctx.stroke();
      }

        ctx.restore();
      }

      // --- Draw Score HUD ---
      if (chapterTenActive && state.chapterTenFlight) {
        drawChapterTenHud(
          ctx,
          width,
          state.score,
          state.chapterTenRoute.size,
          requiredRoutePointCount(),
        );
        drawChapterTenBeat(
          ctx,
          width,
          height,
          state.chapterTenPhase,
          state.score,
          state.chapterTenBeatFrames,
        );
        drawChapterTenFlightCredits(
          ctx,
          width,
          height,
          state.score,
          state.frameCount,
        );
        if (state.chapterTenFlight.completed) {
          drawChapterTenComplete(ctx, width, height, state.chapterTenCompleteFrames);
        } else if (state.chapterTenTakeoverPaused) {
          drawChapterTenTakeoverPause(ctx, width, height);
        }
      } else if (!hackedMode) {
        // Glassmorphism score card (radius 24) with glow
        ctx.save();
        ctx.shadowColor = 'rgba(139, 92, 246, 0.45)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(width / 2 - 56, 10, 112, 58, 24);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 56, 10, 112, 58, 24);
        ctx.stroke();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px "Inter"';
        ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
        ctx.shadowBlur = 10;
        ctx.fillText(state.score.toString(), width / 2, 42);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#777777';
        ctx.font = 'bold 6px "Inter"';
        ctx.fillText('F L I G H T   P O I N T S', width / 2, 58);
        ctx.restore();

        // Meaningless metrics card (radius 16, inconsistent on purpose)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.beginPath();
        ctx.roundRect(12, 12, 132, 52, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.beginPath();
        ctx.roundRect(12, 12, 132, 52, 16);
        ctx.stroke();
        ctx.font = '7px "JetBrains Mono"';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('NEURAL SYNC', 20, 26);
        ctx.fillText('FLAP ACCURACY', 20, 40);
        ctx.fillText('BIRD CONFIDENCE', 20, 54);
        const cheapTelemetry = getCheapTelemetry(state.frameCount);
        ctx.fillStyle = '#67e8f9';
        ctx.fillText(cheapTelemetry.neuralSync, 108, 26);
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText(cheapTelemetry.flapAccuracy, 108, 40);
        ctx.fillStyle = '#c4b5fd';
        ctx.fillText(cheapTelemetry.birdConfidence, 108, 54);

        // Floating praise popups
        state.popups = state.popups.filter((p) => p.life > 0);
        state.popups.forEach((p) => {
          const rise = (45 - p.life) * 0.4;
          ctx.save();
          ctx.globalAlpha = Math.min(1, p.life / 30);
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px "Inter"';
          ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
          ctx.shadowBlur = 10;
          ctx.fillText('+1', p.x, p.y - rise);
          ctx.font = 'bold 7px "Inter"';
          ctx.fillStyle = '#a5f3fc';
          ctx.fillText(p.text, p.x, p.y + 10 - rise);
          ctx.restore();
          p.life--;
        });
      } else {
        // CRT green HUD
        ctx.fillStyle = '#22c55e';
        ctx.font = '14px "JetBrains Mono"';
        ctx.fillText(`SYS_DIST: ${state.score.toString().padStart(3, '0')}/256`, 20, 30);
        ctx.fillText(`ALTITUDE: ${currentAlt.toString().padStart(3, '0')}`, 20, 50);
        ctx.fillText(`BYPASS_ENGINE: ACTIVE`, 20, 70);
        
        // Progress bar to 256
        ctx.strokeStyle = '#22c55e';
        ctx.strokeRect(20, 80, 150, 6);
        const filledWidth = (state.score / 256) * 150;
        ctx.fillRect(20, 80, filledWidth, 6);

        // Terminal text crawl (history/lore logs scrolling on the right side)
        ctx.save();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.font = '8px "JetBrains Mono"';
        if (state.score >= 50 && state.score < 100) {
          ctx.fillText('NOAH_KADE: "Lumen Arc is over. But Skyline 256 is ours."', width - 260, height - 70);
          ctx.fillText('NOAH_KADE: "I added the final terminal path. 256 is the end."', width - 260, height - 55);
        } else if (state.score >= 100 && state.score < 180) {
          ctx.fillText('LOG: "Silver Kite database offline. Migration to Automation"', width - 260, height - 70);
          ctx.fillText('MARA_KADE: "Noah, I kept a copy of the device for the child."', width - 260, height - 55);
        } else if (state.score >= 180 && state.score < 250) {
          ctx.fillText('NOAH_KADE: "If he ever finds it, let him fly it to the end."', width - 260, height - 70);
          ctx.fillText('NOAH_KADE: "The terminal code is Alt 0. The dive."', width - 260, height - 55);
        } else if (state.score >= 250) {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('CRITICAL: SERVICE TERMINATION AHEAD', width - 240, height - 75);
          ctx.fillText('INSTRUCTION: TARGET ELEVATION ZERO (DIVE OFFSCREEN)', width - 240, height - 60);
        }
        ctx.restore();
      }

      // --- Trigger GameOver overlay or continue loop ---
      if (state.gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = 'center';

        if (!hackedMode) {
          // Politely devastating, in the most corporate way possible
          ctx.fillStyle = '#c4b5fd';
          ctx.font = 'bold 20px "Inter"';
          ctx.shadowColor = 'rgba(139, 92, 246, 0.7)';
          ctx.shadowBlur = 14;
          ctx.fillText('Your current flight journey', width / 2, height / 2 - 34);
          ctx.fillText('has come to an end.', width / 2, height / 2 - 10);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = '13px "Inter"';
          ctx.fillText(`Flight Points: ${state.score}`, width / 2, height / 2 + 20);
          ctx.fillStyle = '#777777';
          ctx.font = '10px "Inter"';
          ctx.fillText('Tap or press SPACE to reinitialize your flight sequence', width / 2, height / 2 + 44);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 28px "Space Grotesk"';
          ctx.fillText('GAME OVER', width / 2, height / 2 - 30);
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px "Inter"';
          ctx.fillText(`Score: ${state.score}`, width / 2, height / 2 + 10);
          ctx.fillText('Press SPACE or TAP to Restart', width / 2, height / 2 + 40);
        }
        ctx.restore();
      } else {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const handleDeath = (reason: string, cause: FlappyDeathCause) => {
      const state = stateRef.current;
      if (state.gameOver) return;
      state.gameOver = true;
      setIsPlaying(false);
      // Contact → stall → cheap result sting, scheduled on the audio clock
      // so the results panel itself appears immediately (§4.1). Gate 40's
      // seal uses the Level 2 material variant; the sting loses its
      // decoration once the meta reveal is near.
      audio.play('flight.pipeHit', { variant: cause === 'gate40' ? 1 : 0 });
      if (cause === 'gate40') audio.play('flight.gate40Block');
      audio.play('flight.birdFall', { delay: 0.07 });
      audio.play('flight.deathResult', {
        intensity: progress.deathsAt40 >= 1 ? 0.5 : 1,
        delay: 0.5,
      });
      
      // Update global context progress
      updateProgress((prev) => {
        const nextDeaths = nextGate40DeathCount(prev.deathsAt40, cause);

        return {
          ...prev,
          deathsAt40: nextDeaths,
          bestScore: Math.max(prev.bestScore, state.score),
        };
      });

      // Count consecutive Chapter 10 runs that never got past Gate 40, and
      // offer the route-point assist on the fifth. Passing Gate 40 (takeover)
      // resets this, so the offer only follows a genuine losing streak.
      if (chapterTenActive && state.score < CHAPTER_TEN_NODES.takeover) {
        speak(['...']);
        chapterTenFailsRef.current += 1;
        if (
          chapterTenFailsRef.current >= CHAPTER_TEN_ASSIST_FAIL_THRESHOLD
          && !assistEnabledRef.current
        ) {
          setAssistOffered(true);
        }
      }

      // Show the cheap results screen; the leaderboard is behind a button
      setShowResults(true);
    };

    const triggerCompletion = () => {
      const state = stateRef.current;
      state.gameOver = true;
      setIsPlaying(false);
      // Simple early-mobile completion — never the five-step victory chord.
      audio.play('flight.complete');
      
      // Update progress to completion!
      updateProgress((prev) => ({
        ...prev,
        bestScore: Math.max(prev.bestScore, state.score),
        phase: 'credits',
        completedGame: true
      }));
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(gameLoop);
    } else {
      // Draw static screen with cheap blue-purple gradient when idle
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#24106B');
      bgGrad.addColorStop(0.5, '#3B18B8');
      bgGrad.addColorStop(1, '#7048E8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Inter"';
      ctx.fillText('FLAPPY SOMETHING', width / 2, height / 2 - 20);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px "Inter"';
      ctx.fillText('Tap to begin your intelligent flight experience', width / 2, height / 2 + 10);
      ctx.restore();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    beginAutonomousControl,
    chapterTenActive,
    endAutonomousControl,
    hackedMode,
    isPlaying,
    progress.unlockedCodeRoute,
    pulsePlayerTap,
    pulseAutonomousTap,
    resumeChapterTenTakeover,
    speak,
  ]);

  const playerBestScore = Math.max(progress.bestScore, highScore, score);
  const publicLeaderboard = createPublicLeaderboard(playerBestScore);
  const beatPercentage = calculateBeatPercentage(playerBestScore);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans select-none overflow-hidden" id="flappy-root">
      
      {/* Top App Header bar — hidden while the leaderboard/title intro owns the
          screen, so the intro is just the black backdrop and the logo. */}
      <div className={`bg-purple-900/60 border-b border-purple-800/50 px-3 py-1.5 flex items-center justify-between text-xs ${showLeaderboard ? 'hidden' : ''}`} id="game-header">
        <div className="flex items-center gap-1.5 font-display font-medium text-purple-200">
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>{hackedMode ? 'SKG: Skyline 256 (v1.04_Final)' : 'Flappy Something (New Version)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              audio.setMute(nextMuted);
              if (!nextMuted) audio.play('ui.toggle', { variant: 1 });
            }}
            className="text-purple-300 hover:text-white transition-colors"
            title="Mute synth sfx"
            id="mute-sfx"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={onHome}
            className="px-2 py-0.5 bg-purple-950/80 rounded border border-purple-700/50 text-[10px] text-purple-200 hover:text-white hover:bg-purple-900"
            id="exit-game"
          >
            HOME OS
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-black overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={(e) => isPlaying && handleJump(e)}
        id="canvas-box"
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-full object-contain"
          id="flappy-canvas"
        />

        {chapterTenPlayerFullscreen && chapterTenActive && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#080b10]/55 px-6 py-4 backdrop-blur-[2px]"
            id="chapter-ten-fullscreen-dialogue"
            data-dialogue-mode="silent-pre-takeover"
          >
            <div className="font-thought text-[9px] tracking-[0.3em] text-slate-400/75">ARCANE</div>
            <div className="mt-1 font-thought text-[18px] tracking-[0.18em] text-slate-100/90">...</div>
          </div>
        )}

        {/* Debug panel: Shown when player has unlocked the code route */}
        {progress.unlockedCodeRoute && isPlaying && !showLeaderboard && !chapterTenActive && (
          <div className="absolute left-3 top-3 bottom-3 w-40 bg-[var(--laos-bg)]/[0.94] border border-[var(--laos-line)] p-2 text-[10px] font-laos text-[var(--laos-text)] flex flex-col justify-between pointer-events-none z-10" id="altitude-sensor-panel">
            <div>
              <div className="flex items-center gap-1.5 laos-label text-[8px] border-b border-[var(--laos-line-dim)] pb-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 bg-[var(--laos-warm)]"></span>
                <span>LUMEN ALT_SENSOR</span>
              </div>
              <div className="text-xs font-mono font-bold text-center py-1 bg-[var(--laos-surface-2)] border border-[var(--laos-line-dim)] mb-2 text-[var(--laos-text)]">
                ALT: {currentAlt}m
              </div>

              {/* Target Sequence Checklist */}
              <div className="space-y-0.5">
                <div className="laos-label text-[7.5px] mb-1">GATE 40 SEQUENCER:</div>
                {ALTITUDE_SEQUENCE.map((alt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-1.5 py-0.5 font-mono ${
                      seqIndex === idx
                        ? 'bg-[var(--laos-surface-2)] text-[var(--laos-warm)] border-l-2 border-[var(--laos-warm)] font-bold'
                        : seqIndex > idx
                          ? 'text-[var(--laos-faint)] line-through'
                          : 'text-[var(--laos-dim)]'
                    }`}
                  >
                    <span>P{40 + idx} Alt Target:</span>
                    <span>{alt}m</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--laos-line-dim)] pt-1.5 mt-1 text-[8px] leading-tight">
              {seqIndex >= 6 ? (
                <span className="text-[var(--laos-warm)] font-bold tracking-wide">!! BOUNDING COLLIDER DISRUPTED !!</span>
              ) : (
                <span className="text-[var(--laos-dim)]">Fly matching target heights strictly as you pass each gate section starting at 40!</span>
              )}
            </div>
          </div>
        )}

        {/* AI Slop SaaS hero overlay when NOT playing */}
        {!isPlaying && !showLeaderboard && !showResults && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-1.5 p-4 pb-8 text-center overflow-y-auto font-sans" id="game-start-panel">
            {/* Embedded styles for CSS animations */}
            <style>{`
              @keyframes floatBtn {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-5px) scale(1.03); }
              }
              .animate-float-button {
                animation: floatBtn 2.8s ease-in-out infinite;
              }
            `}</style>

            {/* Ambient gradient orbs + drifting particles (decoration only) */}
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute left-[12%] top-[18%] w-1 h-1 bg-purple-400/70 rounded-full blur-[1px] animate-pulse"></span>
              <span className="absolute left-[78%] top-[26%] w-1.5 h-1.5 bg-cyan-300/60 rounded-full blur-[1px] animate-pulse [animation-delay:300ms]"></span>
              <span className="absolute left-[30%] top-[74%] w-1 h-1 bg-fuchsia-400/60 rounded-full blur-[1px] animate-pulse [animation-delay:600ms]"></span>
              <span className="absolute left-[64%] top-[82%] w-1 h-1 bg-purple-300/70 rounded-full blur-[1px] animate-pulse [animation-delay:150ms]"></span>
              <span className="absolute left-[88%] top-[62%] w-1 h-1 bg-cyan-400/50 rounded-full blur-[1px] animate-pulse [animation-delay:450ms]"></span>
            </div>

            {/* Capsule label */}
            <div className="px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-[8px] font-mono tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(139,92,246,0.35)]">
              AI-POWERED FLIGHT EXPERIENCE
            </div>

            {/* NeuroBird orb logo (crown kept, slightly unaligned) */}
            <div className="relative mt-1" id="game-logo">
              <div className="absolute -top-4 -left-2 rotate-[-15deg] z-10">
                <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 via-purple-600 to-indigo-950 border border-cyan-300/60 shadow-[0_0_24px_rgba(139,92,246,0.7),0_0_60px_rgba(34,211,238,0.25)] relative">
                <div className="absolute w-5 h-5 bg-white rounded-full top-3 right-2.5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
                <div className="absolute w-2 h-2 bg-white rounded-full top-2 right-8 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                </div>
                <Zap className="absolute -left-1.5 bottom-2 w-5 h-5 text-cyan-300 fill-cyan-300 rotate-[-20deg] drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              </div>
            </div>

            <div className="text-[8px] font-mono text-cyan-300/80 tracking-widest uppercase">
              Flappy Something™ · BirdOS v9.4.1
            </div>

            {/* Giant meaningless hero title */}
            <h1 className="font-black text-3xl leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-300 drop-shadow">
              FLAP INTO<br />THE FUTURE.
            </h1>
            <p className="text-[10px] text-[#777777] max-w-[250px] leading-snug">
              The next generation of bird-based intelligence. Redefining the way you flap.
            </p>

            {/* Hero metric + satellite chips */}
            <div className="flex items-center gap-2 mt-1">
              <div className="rounded-3xl border-2 border-purple-500/60 bg-white/5 backdrop-blur-md px-3 py-1.5 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                <div className="text-xl font-black text-white leading-none">98.7<span className="text-cyan-300">%</span></div>
                <div className="text-[7px] text-[#8a8a8a] uppercase tracking-wider mt-0.5">Flight Optimization</div>
              </div>
              <div className="flex flex-col gap-1 text-[7px] font-mono text-left">
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-emerald-300">+24% Accuracy</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-cyan-300">12ms Latency</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-purple-300">AI Enhanced</span>
              </div>
            </div>

            {/* CTA row: verbose primary + ghost secondary */}
            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={() => { audio.play('ad.playNow'); resetGame(); }}
                className="animate-float-button px-4 py-2.5 rounded-[24px] bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-400 text-white text-[10px] font-black tracking-wide uppercase shadow-[0_0_20px_rgba(139,92,246,0.5),0_0_60px_rgba(34,211,238,0.2)] border border-white/20 flex items-center gap-1.5"
                id="start-button"
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                Begin Your Intelligent Flight Experience
              </button>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="px-3 py-2.5 rounded-2xl border border-yellow-300/35 bg-gradient-to-b from-yellow-300 to-amber-500 text-[#301400] text-[9px] font-black uppercase tracking-wider shadow-[0_3px_0_#8a4b00,0_0_14px_rgba(251,191,36,0.28)] flex items-center gap-1"
                id="premium-unlock-button"
                aria-label="Unlock premium edition"
              >
                <Zap className="h-3 w-3 fill-current" /> Unlock
              </button>
            </div>

            {/* Cheap emoji leaderboard entry point */}
            <button
              onClick={openLeaderboard}
              className="px-4 py-1.5 rounded-xl bg-[#1a1a2e] border border-purple-500/40 text-purple-200 text-[10px] font-black tracking-wide hover:bg-[#232345] transition-colors"
              id="home-leaderboard-button"
            >
              🏆 GLOBAL LEADERBOARD
            </button>

            {/* Fake store credibility badges */}
            <div className="flex items-center gap-1.5 text-[8px] font-black mt-0.5">
              <span className="bg-black/40 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/40">★★★★★ 4.9</span>
              <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-full">500M+ DOWNLOADS!!</span>
              <span className="bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">⏳ BONUS ENDS 00:59</span>
            </div>

            {/* Three-column startup feature cards (radii intentionally inconsistent) */}
            <div className="grid grid-cols-3 gap-1.5 w-full max-w-[400px] mt-1">
              {([
                { Icon: Rocket, radius: 'rounded-xl', glow: 'shadow-[0_0_14px_rgba(139,92,246,0.6)]', title: 'Smart Flapping', text: 'AI-powered motion control' },
                { Icon: Brain, radius: 'rounded-3xl', glow: 'shadow-[0_0_14px_rgba(34,211,238,0.6)]', title: 'Adaptive Pipes', text: 'Obstacles that evolve with you' },
                { Icon: Activity, radius: 'rounded-2xl', glow: 'shadow-[0_0_14px_rgba(217,70,239,0.6)]', title: 'Real-time Insights', text: 'Understand every flap' },
              ]).map(({ Icon, radius, glow, title, text }) => (
                <div key={title} className={`${radius} bg-white/5 backdrop-blur border border-white/10 p-2`}>
                  <div className={`w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center ${glow} mb-1`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[8px] font-bold text-white">{title}</div>
                  <div className="text-[7px] text-[#777777] leading-tight">{text}</div>
                </div>
              ))}
            </div>

            {/* Simulated Spammy Ads Banner */}
            <div className="absolute bottom-2 left-2 right-2 bg-yellow-400 text-black text-[9px] font-bold py-1 px-2 rounded-md flex items-center justify-between shadow-md border border-yellow-500" id="spam-ad">
              <span>🔥 MAKE $5000/DAY FLAPPING FROM HOME! CLICK HERE 🔥</span>
              <span className="bg-black text-white px-1 py-0.5 rounded text-[7px]">AD</span>
            </div>
          </div>
        )}

        {/* Cheap emoji results screen after death: score first, everything else second */}
        {showResults && !showLeaderboard && (
          <div className="absolute inset-0 bg-[#0a0a12] flex flex-col items-center justify-center gap-1.5 p-4 text-center font-sans" id="game-results-panel">
            <div className="text-2xl leading-none">💥🐦💥</div>
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-widest">
              Your flight has ended!
            </div>

            <div className="text-6xl font-black text-white leading-none my-1">{score}</div>
            <div className="text-[9px] font-mono text-purple-300 uppercase tracking-[0.3em]">
              🪽 Flaps Completed
            </div>

            <div className="text-[9px] text-emerald-400 font-bold mt-1">📈 +18.6% vs previous flight!</div>
            <div className="text-[8px] text-[#777777]">🤖 AI Tip: tap with a steadier rhythm!</div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={restartRun}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-xs font-black tracking-wide"
                id="results-retry"
              >
                🔁 TRY AGAIN!!
              </button>
              <button
                onClick={openLeaderboard}
                className="px-5 py-2 rounded-xl bg-[#1a1a2e] border border-purple-500/40 text-purple-200 text-xs font-black tracking-wide hover:bg-[#232345] transition-colors"
                id="results-leaderboard"
              >
                🏆 LEADERBOARD
              </button>
            </div>

            <div className="text-[7px] text-[#555555] mt-2">✨ Press SPACE to fly again ✨</div>
          </div>
        )}

        {/* The recovered 2013 guide recognizes the restored profile. It gives
            instructions without making Arcane break his Chapter 9 silence. */}
        {showChapterTenWelcome && chapterTenActive && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#101513]/84 p-6 font-mono"
            id="chapter-ten-route-welcome"
          >
            <div className="relative w-full max-w-[350px] border-2 border-[#d6d0a8] bg-[#26352f] p-1 text-center shadow-[6px_6px_0_#080c0a]">
              <div className="border border-[#71806a] bg-[#18231f] px-6 py-5 shadow-[inset_0_0_0_1px_#0b100e]">
                <div className="mb-3 text-[8px] font-bold uppercase tracking-[0.24em] text-[#87957f]">
                  Route Guide // Legacy Profile
                </div>
                <div className="text-[16px] font-black tracking-[0.08em] text-[#fff2a6]">
                  {CHAPTER_TEN_WELCOME_LABEL}
                </div>
                <div className="mx-auto mt-3 max-w-[260px] text-[10px] leading-[1.65] text-[#c4cec0]">
                  {CHAPTER_TEN_WELCOME_NOTE}
                </div>
                <div className="mx-auto my-4 flex max-w-[230px] items-center gap-2" aria-hidden="true">
                  <span className="h-px flex-1 bg-[#657168]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fff2a6] shadow-[0_0_8px_rgba(255,242,166,.8)]" />
                  <span className="h-px flex-1 bg-[#657168]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fff2a6] shadow-[0_0_8px_rgba(255,242,166,.8)]" />
                  <span className="h-px flex-1 bg-[#657168]" />
                </div>
                <button
                  type="button"
                  onClick={beginChapterTenTrace}
                  id="chapter-ten-begin-trace"
                  className="w-full border-2 border-[#e5d875] bg-[#6e7847] px-4 py-2.5 text-[10px] font-black tracking-[0.15em] text-[#fff6bd] shadow-[3px_3px_0_#080c0a] hover:bg-[#7f8952] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#080c0a]"
                >
                  BEGIN TRACE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chapter 10 route-point assist offer, after a five-run losing streak.
            It belongs to Arcane's old game, so it uses a restrained 2013-era
            cartridge prompt instead of the surrounding phone OS language. */}
        {assistOffered && chapterTenActive && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#101513]/80 p-6 font-mono"
            id="chapter-ten-assist-offer"
          >
            <div className="relative w-full max-w-[330px] border-2 border-[#d6d0a8] bg-[#26352f] px-1 py-1 text-center shadow-[5px_5px_0_#0a0e0c]">
              <div className="border border-[#71806a] bg-[#18231f] px-5 py-4 shadow-[inset_0_0_0_1px_#0b100e]">
                <div className="mb-3 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.24em] text-[#87957f]">
                  <span className="h-1.5 w-1.5 bg-[#c6b85d]" />
                  Flight Assist
                  <span className="h-1.5 w-1.5 bg-[#c6b85d]" />
                </div>
                <div className="text-[14px] font-black tracking-[0.08em] text-[#eee8bf]">
                  {CHAPTER_TEN_ASSIST_PROMPT}
                </div>
                <div className="mx-auto mt-2 max-w-[250px] text-[9px] leading-[1.55] text-[#aeb9a4]">
                  {CHAPTER_TEN_ASSIST_NOTE}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={acceptAssist}
                  id="assist-accept"
                  className="border-2 border-[#e5d875] bg-[#6e7847] px-3 py-2 text-[10px] font-black tracking-[0.12em] text-[#fff6bd] shadow-[2px_2px_0_#080c0a] hover:bg-[#7f8952] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#080c0a]"
                >
                  ENABLE
                </button>
                <button
                  onClick={declineAssist}
                  id="assist-decline"
                  className="border-2 border-[#657168] bg-[#202c27] px-3 py-2 text-[10px] font-black tracking-[0.08em] text-[#b9c2b5] shadow-[2px_2px_0_#080c0a] hover:bg-[#2b3933] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#080c0a]"
                >
                  KEEP TRYING
                </button>
                </div>
                <div className="mt-3 text-[7px] uppercase tracking-[0.18em] text-[#657168]">
                  No score penalty
                </div>
              </div>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <LeaderboardPanel
            entries={publicLeaderboard}
            playerBestScore={playerBestScore}
            beatPercentage={beatPercentage}
            onRetry={restartRun}
            onClose={() => { audio.play('ui.close'); setShowLeaderboard(false); }}
            suspiciousRunsEnabled={progress.deathsAt40 >= 1}
            onSuspiciousRunSelected={enterMetaFromRun}
          />
        )}
      </div>

      {/* Ads footer bar when in slop mode — also hidden under the leaderboard/
          title intro so nothing pokes out below the black backdrop. */}
      {!hackedMode && !showLeaderboard && (
        <div className="bg-amber-400 text-black text-[9px] py-1 text-center font-bold tracking-wider animate-pulse flex items-center justify-center gap-2 border-t border-yellow-500" id="ad-banner">
          <span>⚠️ LOSE WEIGHT FAST BY FLAPPING YOUR ARMS! CLOCK TICKING! ⚠️</span>
        </div>
      )}
    </div>
  );
};
