import React, { useEffect, useRef, useState } from 'react';
import { GameProgress, ActiveApp } from '../types';
import audio from '../lib/audio';
import { EASY_FLAPPY_SETTINGS, FlappyDeathCause, getFlappyNightMix, getGateHeights, getGateSpawnX, getGateVisualStyle, nextGate37DeathCount, resolvePipeCollision } from '../lib/flappyPhysics';
import { RefreshCw, Play, Volume2, VolumeX, ShieldAlert, CheckCircle, Zap, Flame, Crown } from 'lucide-react';

interface FlappyGameProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onHome: () => void;
  onLeaderboardOpened: () => void;
}

// Sequence of target altitudes near pipe 37
const ALTITUDE_SEQUENCE = [184, 172, 149, 133, 121, 118, 126, 143];

// Easier pacing: slower horizontal motion, wider openings, and more breathing
// room between gates. Scoring and gate spawning remain in lockstep.
const PACE_INTERVAL_FRAMES = EASY_FLAPPY_SETTINGS.spawnIntervalFrames;

export const FlappyGame: React.FC<FlappyGameProps> = ({ progress, updateProgress, onHome, onLeaderboardOpened }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(audio.getMuted());
  const [highScore, setHighScore] = useState(37);
  
  // Real-time debug metrics to display to user
  const [currentAlt, setCurrentAlt] = useState(0);
  const [seqIndex, setSeqIndex] = useState(0); // index in altitude matching
  const [seqMatched, setSeqMatched] = useState<boolean[]>(new Array(8).fill(false));
  const [hackedMode, setHackedMode] = useState(false);

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
        { x: 1200, y: 120, text: 'PIPE_A_037 · COLLIDER: TRUE', opacity: 0.5 },
        { x: 1500, y: 260, text: 'LEGACY_ASSET_MISSING', opacity: 0.6 },
      ],
      trail: [],
    };
    setScore(0);
    setSeqIndex(0);
    setSeqMatched(new Array(8).fill(false));
    setHackedMode(false);
    setIsPlaying(true);
    setShowLeaderboard(false);
    audio.playUnlock();
  };

  const handleJump = (e: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
    if (e.type === 'keydown' && (e as KeyboardEvent).code !== 'Space') return;
    if (e.cancelable) e.preventDefault();
    
    if (!isPlaying) {
      if (showLeaderboard) {
        setShowLeaderboard(false);
      } else {
        resetGame();
      }
      return;
    }

    if (stateRef.current.gameOver) {
      resetGame();
      return;
    }

    stateRef.current.birdVelocity = stateRef.current.birdJump;
    audio.playJump();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleJump(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, showLeaderboard]);

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
      if (!hackedMode) {
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
        state.frameCount++;
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
        // spawning below so the displayed score and gate index stay in sync.
        if (state.frameCount % PACE_INTERVAL_FRAMES === 0) {
          state.score++;
          setScore(state.score);
        }

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

        // Delete Offscreen Pipes
        state.pipes = state.pipes.filter((p) => p.x > -60);

        // --- Collision Check & Core Sequence Logic ---
        state.pipes.forEach((pipe) => {
          const birdX = 80;
          const birdSize = 12;

          // Check passing midpoint
          if (!pipe.passed && pipe.x < birdX) {
            pipe.passed = true;

            // Trigger terminal/hacked graphics once we are inside sequence 37-44
            if (pipe.index >= 37 && state.bypassActive) {
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
          // or bump the underside of an upper pipe without dying. Gate 37 keeps
          // its story-critical barrier until the route has been unlocked.
          const safeHorizontalContact = collision.kind === 'land' || collision.kind === 'ceiling';
          if (safeHorizontalContact && (pipe.index !== 37 || state.bypassActive)) {
            state.birdY = collision.y;
            state.birdVelocity = collision.velocityY;
            return;
          }

          const overlapsPipeX = pipe.x <= birdX + birdSize && pipe.x + 50 >= birdX - birdSize;
          if (overlapsPipeX) {
            // Gate 37 is a visible physical seal. The secret route is only
            // evaluated when the bird actually hits its rendered pipe body.
            if (pipe.index === 37 && !state.bypassActive && collision.fatal) {
              if (progress.unlockedCodeRoute) {
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
                  audio.playTick();
                  // spawn developer logs instantly
                  state.devNotes.push({ x: width, y: 100, text: 'COLLIDER_BYPASS_STAGE_01: INITIATED', opacity: 1 });
                } else {
                  handleDeath('Level 2 Seal #37', 'gate37');
                }
              } else {
                handleDeath('Level 2 Seal #37', 'gate37');
              }
            } else if (pipe.index > 37 && state.bypassActive) {
              // We are active in the bypass mode!
              // For each pipe index from 38 to 44, check if the player matches the sequence target.
              const seqOffset = pipe.index - 37;
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
                    audio.playTick();
                    
                    state.devNotes.push({ 
                      x: width, 
                      y: pipe.topHeight + 20, 
                      text: `BYPASS_LINK [${seqOffset}] MATCHED: OK`, 
                      opacity: 1 
                    });

                    // At stage 5 (Altitude 118), complete the full structural collapse!
                    if (seqOffset === 5) {
                      state.terminalGlitchActive = true;
                      audio.playGlitch();
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

      // --- Draw Pipes ---
      state.pipes.forEach((pipe) => {
        if (!hackedMode) {
          // Level 1 keeps the cheap gold style. Gate 37 quietly previews a
          // darker Level 2 material instead of announcing itself with red light.
          const gateStyle = getGateVisualStyle(pipe.index);
          const isLevel2Preview = gateStyle.variant === 'level2-preview';
          const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + 50, 0);
          if (isLevel2Preview) {
            pipeGrad.addColorStop(0, '#0f172a');
            pipeGrad.addColorStop(0.5, '#0f766e');
            pipeGrad.addColorStop(1, '#166534');
          } else {
            pipeGrad.addColorStop(0, '#ffe066');
            pipeGrad.addColorStop(0.3, '#ffb300');
            pipeGrad.addColorStop(0.7, '#e69500');
            pipeGrad.addColorStop(1, '#995c00');
          }
          ctx.fillStyle = pipeGrad;
          ctx.strokeStyle = isLevel2Preview ? '#2dd4bf' : '#3d2500';
          ctx.lineWidth = 3;

          // Top pipe
          ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
          ctx.strokeRect(pipe.x, -5, 50, pipe.topHeight + 5);
          ctx.fillStyle = isLevel2Preview ? '#115e59' : '#ffcc00';
          ctx.fillRect(pipe.x - 4, pipe.topHeight - 15, 58, 15);
          ctx.strokeRect(pipe.x - 4, pipe.topHeight - 15, 58, 15);

          // Bottom pipe
          const bottomY = height - pipe.bottomHeight;
          ctx.fillStyle = pipeGrad;
          ctx.fillRect(pipe.x, bottomY, 50, pipe.bottomHeight);
          ctx.strokeRect(pipe.x, bottomY, 50, pipe.bottomHeight + 5);
          ctx.fillStyle = isLevel2Preview ? '#115e59' : '#ffcc00';
          ctx.fillRect(pipe.x - 4, bottomY, 58, 15);
          ctx.strokeRect(pipe.x - 4, bottomY, 58, 15);

          // A few small teeth and a locked label promise another ruleset while
          // preserving the fixed, impossible Gate 36 → Gate 37 geometry.
          if (isLevel2Preview) {
            ctx.save();
            ctx.fillStyle = '#4ade80';
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
            ctx.fillStyle = 'rgba(167, 243, 208, 0.9)';
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

      // --- Draw Bird ---
      const birdX = 80;
      const birdY = state.birdY;
      const angle = Math.min(Math.PI / 6, Math.max(-Math.PI / 7, state.birdVelocity * 0.06));

      if (hackedMode) {
        // Sampled-path residue: the bird leaves its recent coordinates behind
        ctx.save();
        state.trail.forEach((ty, i) => {
          const a = ((i + 1) / state.trail.length) * 0.4;
          ctx.fillStyle = `rgba(34, 197, 94, ${a.toFixed(2)})`;
          ctx.fillRect(birdX - (state.trail.length - i) * 7, ty - 1.5, 3, 3);
        });
        ctx.restore();
      }

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(angle);

      if (!hackedMode) {
        // AI-generated unaligned looking cartoon slop bird with weird proportions
        ctx.fillStyle = '#ff5722'; // bright messy orange body
        ctx.beginPath();
        // Slightly squashed/distorted ellipse body
        ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Messy unaligned beak - unnaturally long or offset
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.moveTo(12, -4);
        ctx.lineTo(25, 7);
        ctx.lineTo(6, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Extremely asymmetric eyes (looks highly unaligned like bad AI outputs)
        // Main eye - too big and high
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(6, -6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(7, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Secondary eye - tiny, floated to a weird back position
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-2, -8, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-2, -8, 1, 0, Math.PI * 2);
        ctx.fill();

        // Flapping glitched wing (offset, too high or stubby)
        ctx.fillStyle = '#e91e63';
        const wingFlap = Math.sin(state.frameCount * 0.4) * 6;
        ctx.beginPath();
        ctx.ellipse(-7, -1, 5, 9 + wingFlap, Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
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

      // --- Draw Score HUD ---
      if (!hackedMode) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.font = 'bold 32px "Space Grotesk"';
        const scoreText = state.score.toString();
        ctx.strokeText(scoreText, width / 2 - 10, 50);
        ctx.fillText(scoreText, width / 2 - 10, 50);
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 28px "Space Grotesk"';
        ctx.fillText('GAME OVER', width / 2 - 80, height / 2 - 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Inter"';
        ctx.fillText(`Score: ${state.score}`, width / 2 - 30, height / 2 + 10);
        ctx.fillText('Press SPACE or TAP to Restart', width / 2 - 90, height / 2 + 40);
      } else {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const handleDeath = (reason: string, cause: FlappyDeathCause) => {
      const state = stateRef.current;
      if (state.gameOver) return;
      state.gameOver = true;
      setIsPlaying(false);
      audio.playExplode();
      
      // Update global context progress
      updateProgress((prev) => {
        const nextDeaths = nextGate37DeathCount(prev.deathsAt37, cause);
        
        // If they died at score 37 or reached high coordinates
        const reachedMax = Math.max(prev.deathsAt37, nextDeaths);

        return {
          ...prev,
          deathsAt37: nextDeaths,
          phase: prev.phase === 'intro_game' && nextDeaths >= 3 ? 'os_unlocked' : prev.phase
        };
      });
    };

    const triggerCompletion = () => {
      const state = stateRef.current;
      state.gameOver = true;
      setIsPlaying(false);
      audio.playSuccess();
      
      // Update progress to completion!
      updateProgress((prev) => ({
        ...prev,
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
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Space Grotesk"';
      ctx.fillText('FLAPPY SOMETHING', width / 2 - 100, height / 2 - 20);
      ctx.font = '12px "Inter"';
      ctx.fillText('Tap to Start App', width / 2 - 45, height / 2 + 10);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, hackedMode]);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans select-none overflow-hidden" id="flappy-root">
      
      {/* Top App Header bar */}
      <div className="bg-purple-900/60 border-b border-purple-800/50 px-3 py-1.5 flex items-center justify-between text-xs" id="game-header">
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

        {/* Debug panel: Shown when player has unlocked the code route */}
        {progress.unlockedCodeRoute && isPlaying && !showLeaderboard && (
          <div className="absolute left-3 top-3 bottom-3 w-40 bg-slate-950/90 border border-emerald-500/30 rounded p-2 text-[10px] font-mono text-emerald-400 flex flex-col justify-between pointer-events-none z-10 crt-effect" id="altitude-sensor-panel">
            <div>
              <div className="flex items-center gap-1 text-emerald-300 font-bold border-b border-emerald-500/20 pb-1 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>LUMEN ALT_SENSOR</span>
              </div>
              <div className="text-xs font-bold text-center py-1 bg-emerald-950/50 rounded border border-emerald-500/20 mb-2">
                ALT: {currentAlt}m
              </div>

              {/* Target Sequence Checklist */}
              <div className="space-y-1">
                <div className="text-[9px] text-emerald-500 font-bold mb-0.5">GATE 37 SEQUENCER:</div>
                {ALTITUDE_SEQUENCE.map((alt, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between px-1.5 py-0.5 rounded ${
                      seqIndex === idx 
                        ? 'bg-emerald-500/20 text-white border border-emerald-500/40 font-bold' 
                        : seqIndex > idx 
                          ? 'text-emerald-600 line-through' 
                          : 'text-emerald-500/40'
                    }`}
                  >
                    <span>P{37 + idx} Alt Target:</span>
                    <span>{alt}m</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-emerald-500/20 pt-1 mt-1 text-[8px] text-emerald-500/60 leading-tight">
              {seqIndex >= 6 ? (
                <span className="text-red-400 font-bold animate-pulse">!! BOUNDING COLLIDER DISRUPTED !!</span>
              ) : (
                <span>Fly matching target heights strictly as you pass each gate section starting at 37!</span>
              )}
            </div>
          </div>
        )}

        {/* Over-saturated Slop Flashing overlay when NOT playing */}
        {!isPlaying && !showLeaderboard && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#24106B] via-[#3B18B8] to-[#7048E8] flex flex-col items-center justify-center p-4 text-center overflow-hidden" id="game-start-panel">
            {/* Embedded styles for CSS animations */}
            <style>{`
              @keyframes floatBtn {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-5px) scale(1.03); }
              }
              @keyframes flashZap {
                0%, 100% { opacity: 0.4; transform: rotate(-15deg) scale(0.95); }
                50% { opacity: 1; transform: rotate(-10deg) scale(1.15); filter: drop-shadow(0 0 10px #21C7FF); }
              }
              @keyframes swayFlame {
                0%, 100% { transform: rotate(15deg) scale(1); }
                50% { transform: rotate(20deg) scale(1.1); filter: drop-shadow(0 0 8px #FF9800); }
              }
              .animate-float-button {
                animation: floatBtn 2.8s ease-in-out infinite;
              }
              .animate-flash-zap {
                animation: flashZap 1.4s ease-in-out infinite;
              }
              .animate-sway-flame {
                animation: swayFlame 2.2s ease-in-out infinite;
              }
            `}</style>

            {/* AI Ad Fake Decoration Elements */}
            <div className="absolute left-8 top-12 rotate-[15deg] animate-sway-flame pointer-events-none select-none" style={{ width: '48px', height: '48px' }}>
              <Flame className="w-12 h-12 text-orange-500 fill-orange-500 filter drop-shadow-[0_4px_8px_rgba(249,115,22,0.6)]" />
            </div>

            <div className="absolute right-8 top-16 rotate-[-15deg] animate-flash-zap pointer-events-none select-none" style={{ width: '44px', height: '44px' }}>
              <Zap className="w-11 h-11 text-[#21C7FF] fill-[#21C7FF] filter drop-shadow-[0_4px_8px_rgba(33,199,255,0.5)]" />
            </div>

            <div className="animate-bounce mb-3 relative" id="game-logo">
              {/* Crown slightly unaligned on top of the bird */}
              <div className="absolute -top-5 -left-2.5 rotate-[-15deg] z-10" style={{ width: '28px', height: '28px' }}>
                <Crown className="w-7 h-7 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Weirdly proportioned bird logo */}
              <div className="w-20 h-14 bg-amber-400 border-4 border-black rounded-[40%_60%_50%_50%] flex items-center justify-center relative shadow-lg">
                <div className="absolute w-7 h-7 bg-white border-2 border-black rounded-full top-1 right-2.5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
                <div className="absolute w-3.5 h-3.5 bg-white border-2 border-black rounded-full top-0 right-9 flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
                <div className="w-11 h-6 bg-pink-500 border-3 border-black rounded-ellipse absolute -left-3 bottom-1"></div>
                <div className="w-7 h-4 bg-yellow-300 border-2 border-black rounded-ellipse absolute bottom-2 right-1 rotate-12"></div>
              </div>
            </div>

            <div className="text-emerald-400 text-[10px] font-black tracking-wider uppercase mb-1 drop-shadow animate-pulse">
              🔥 BECOME THE WORLD'S BEST FLYER 🔥
            </div>

            <h1 className="font-display font-black text-3.5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow mb-1 animate-pulse">
              FLAPPY SOMETHING™
            </h1>
            
            <p className="text-cyan-200 text-[11px] font-bold tracking-wide mb-4 bg-[#24106B]/50 px-3 py-1 rounded-md border border-[#3B18B8]/40">
              ★ REVOLUTIONARY SKY PHYSICS ★
            </p>

            <div className="text-yellow-300 text-xs font-black tracking-widest uppercase mb-2">
              ⚡ 9999 LEVELS OF ADVENTURE ⚡
            </div>

            {/* Fake store credibility badges */}
            <div className="flex items-center gap-1.5 mb-3 text-[8px] font-black">
              <span className="bg-black/40 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/40">★★★★★ 4.9</span>
              <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-full">500M+ DOWNLOADS!!</span>
              <span className="bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">⏳ BONUS ENDS 00:59</span>
            </div>

            <button
              onClick={resetGame}
              className="animate-float-button px-10 py-3.5 bg-gradient-to-b from-[#FFE066] to-[#F59E0B] hover:from-[#FFF099] hover:to-[#FBBF24] text-black font-display font-black text-2xl tracking-wide uppercase border-b-8 border-[#B45309] active:border-b-2 active:translate-y-[6px] transition-all duration-75 flex items-center gap-2"
              style={{
                borderRadius: '16px',
                boxShadow: '0 12px 24px rgba(245, 158, 11, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.6)'
              }}
              id="start-button"
            >
              <Play className="w-6 h-6 fill-black stroke-black" />
              PLAY NOW!!!
            </button>

            <button
              onClick={() => {
                audio.playTick();
                setShowLeaderboard(true);
                updateProgress((prev) => ({ ...prev, seenLeaderboard: true }));
                if (progress.deathsAt37 >= 2) onLeaderboardOpened();
              }}
              className="mt-2 px-5 py-1.5 rounded-xl bg-[#1a1a2e] border border-purple-500/40 text-purple-200 text-[10px] font-black tracking-wide hover:bg-[#232345] transition-colors"
              id="home-leaderboard-button"
            >
              GLOBAL LEADERBOARD
            </button>

            <p className="text-purple-200 text-[9px] font-bold tracking-wider uppercase mt-4 opacity-75">
              THE MOST LEGENDARY FLY EXPERIENCE
            </p>

            {/* Simulated Spammy Ads Banner */}
            <div className="absolute bottom-2 left-2 right-2 bg-yellow-400 text-black text-[9px] font-bold py-1 px-2 rounded-md flex items-center justify-between shadow-md border border-yellow-500" id="spam-ad">
              <span>🔥 MAKE $5000/DAY FLAPPING FROM HOME! CLICK HERE 🔥</span>
              <span className="bg-black text-white px-1 py-0.5 rounded text-[7px]">AD</span>
            </div>
          </div>
        )}

        {/* Global Leaderboard Panel (Triggered on death) */}
        {showLeaderboard && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col p-4 font-mono crt-effect" id="leaderboard-panel">
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-2 mb-3">
              <span className="text-yellow-400 font-display font-bold text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>LEADERBOARD - SCORE DISCREPANCY</span>
              </span>
              <button 
                onClick={resetGame}
                className="flex items-center gap-1 text-[10px] bg-purple-900/50 border border-purple-700 hover:bg-purple-800 px-2 py-0.5 rounded text-purple-200"
                id="retry-button"
              >
                <RefreshCw className="w-3 h-3" />
                RETRY
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-xs pr-1">
              {/* Leaderboard entries */}
              <div className="flex justify-between text-yellow-400/80 font-bold border-b border-purple-900/30 pb-1 text-[10px]">
                <span>RANK & USERNAME</span>
                <span>SCORE</span>
              </div>

              {/* ARC_184 */}
              <div className="flex justify-between items-center bg-yellow-950/20 border border-yellow-500/30 p-1.5 rounded">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">#01</span>
                  <span className="text-white font-bold">ARC_184</span>
                  <span className="bg-yellow-500/20 text-yellow-300 text-[8px] px-1 rounded border border-yellow-500/30">RECORD HOLDER</span>
                </div>
                <span className="text-yellow-400 font-bold">184</span>
              </div>

              {/* Fake cheater discussion comments context */}
              <div className="flex justify-between items-center bg-slate-900/30 p-1.5 rounded border border-purple-900/20">
                <div className="flex items-center gap-1 text-purple-300">
                  <span>#02</span>
                  <span>Modded_Flap</span>
                </div>
                <span className="text-white font-bold">38</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/30 p-1.5 rounded border border-purple-900/20">
                <div className="flex items-center gap-1 text-purple-300">
                  <span>#03</span>
                  <span>LumenHacker</span>
                </div>
                <span className="text-white font-bold">38</span>
              </div>

              {/* The major userbase barrier: Score 37! */}
              <div className="py-1 text-center bg-red-950/10 border border-red-500/20 text-[9px] text-red-400 rounded my-1.5">
                ⚠️ [CRITICAL] 65,535 ENTRIES HIDDEN: RANK #4 TO #65,539 PRECISELY TIED AT 37 ⚠️
              </div>

              <div className="flex justify-between items-center bg-red-950/20 p-1.5 rounded border border-red-500/30">
                <div className="flex items-center gap-1 text-red-400">
                  <span>#65540</span>
                  <span>Your_Score_Current</span>
                </div>
                <span className="text-red-400 font-bold">{score}</span>
              </div>

              {/* Purged legacy player records: the database quietly forgot them */}
              <div className="mt-2 space-y-1 opacity-70">
                <div className="text-[8px] text-slate-600 font-bold tracking-wider">LEGACY RECORDS · SYNC FAILED</div>
                {([
                  ['USER_00291', '2014-02-11'],
                  ['USER_01847', '2014-03-02'],
                  ['USER_00033', '2014-03-27'],
                ] as const).map(([uid, lastActive]) => (
                  <div key={uid} className="flex justify-between items-center bg-slate-900/20 p-1.5 rounded border border-slate-900/60 text-slate-600 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 shrink-0"></span>
                      <span className="line-through decoration-slate-700">{uid}</span>
                      <span className="text-[7px] border border-slate-800 px-1 rounded">PROFILE: UNAVAILABLE</span>
                    </div>
                    <span className="text-[8px]">LAST ACTIVE: {lastActive}</span>
                  </div>
                ))}
              </div>

              {/* Hidden overflow negative score Noah Kade */}
              <div className="mt-4 border-t border-dashed border-emerald-500/20 pt-2">
                <pre className="text-[8px] text-emerald-500/70 crt-text leading-snug mb-1.5">{`SCORE_TABLE v1.04
ENTRY COUNT: 65536
SORT MODE: UNSIGNED
WARNING: SIGNED VALUE DETECTED`}</pre>
                <div className="flex justify-between items-center bg-emerald-950/10 p-1.5 rounded border border-emerald-500/30">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">SYSTEM OVERFLOW</span>
                    <span>NOAH_KADE</span>
                  </div>
                  <span className="text-emerald-400 font-bold crt-text">-65535</span>
                </div>
                <div className="text-[8px] text-emerald-500/60 mt-1 text-right">
                  * 16-bit Signed Integer Overflow parsed on complete.
                </div>
              </div>
            </div>

            {/* Protagonist Inner Dialogue / Clue trigger */}
            <div className="mt-3 bg-black border border-purple-900 p-2 rounded text-xs text-purple-200 flex flex-col gap-1.5" id="protagonist-monologue">
              <p className="italic">
                "Wait... almost every regular player is completely locked at score 37. But ARC_184 has 184 points. How did he break the unbeatable barrier?"
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-purple-400">
                <span>Check ViewTube for his video.</span>
                <button
                  onClick={onHome}
                  className="px-2 py-0.5 bg-purple-950 rounded border border-purple-700 hover:text-white"
                  id="go-investigate"
                >
                  Go Investigate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ads footer bar when in slop mode */}
      {!hackedMode && (
        <div className="bg-amber-400 text-black text-[9px] py-1 text-center font-bold tracking-wider animate-pulse flex items-center justify-center gap-2 border-t border-yellow-500" id="ad-banner">
          <span>⚠️ LOSE WEIGHT FAST BY FLAPPING YOUR ARMS! CLOCK TICKING! ⚠️</span>
        </div>
      )}
    </div>
  );
};
