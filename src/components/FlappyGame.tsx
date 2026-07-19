import React, { useEffect, useRef, useState } from 'react';
import { GameProgress, ActiveApp } from '../types';
import audio from '../lib/audio';
import { RefreshCw, Play, Volume2, VolumeX, ShieldAlert, CheckCircle, Zap } from 'lucide-react';

interface FlappyGameProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onHome: () => void;
}

// Sequence of target altitudes near pipe 37
const ALTITUDE_SEQUENCE = [184, 172, 149, 133, 121, 118, 126, 143];

export const FlappyGame: React.FC<FlappyGameProps> = ({ progress, updateProgress, onHome }) => {
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
    birdGravity: 0.4,
    birdJump: -6.5,
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
  });

  const resetGame = () => {
    stateRef.current = {
      birdY: 150,
      birdVelocity: 0,
      birdGravity: 0.4,
      birdJump: -6.5,
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
      ],
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
        // Pseudo-generative oversaturated ad style gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#7843e6'); // extreme neon purple
        bgGrad.addColorStop(0.5, '#f04e9c'); // screaming hot pink
        bgGrad.addColorStop(1, '#ffc837'); // hyper-saturated yellow
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Clashing stylized clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 3; i++) {
          const cloudX = ((state.frameCount * (1 + i * 0.5)) % (width + 100)) - 50;
          ctx.beginPath();
          ctx.arc(cloudX, 50 + i * 30, 20 + i * 10, 0, Math.PI * 2);
          ctx.arc(cloudX + 15, 45 + i * 30, 25 + i * 10, 0, Math.PI * 2);
          ctx.arc(cloudX + 35, 50 + i * 30, 20 + i * 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ads watermark in early slop mode
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.font = 'bold 36px "Inter"';
        ctx.fillText('⚡ HD 4K REALISTIC BIRD FLAP ⚡', 20, height - 30);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillText('★ FREE VERSION ★', width - 280, 50);
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
        state.devNotes.forEach((note) => {
          ctx.fillText(note.text, note.x, note.y);
          note.x -= 2; // scroll with background
          if (note.x < -150) {
            note.x = width + 50 + Math.random() * 200;
            note.y = 30 + Math.random() * (height - 60);
          }
        });
        ctx.restore();
      }

      // --- Game Physics (Only update when playing) ---
      if (isPlaying && !state.gameOver) {
        state.frameCount++;
        state.birdVelocity += state.birdGravity;
        state.birdY += state.birdVelocity;

        // Altitude sensor feedback (mapped from 0 to 256 based on canvas height)
        // Canvas height is 400. 0 is bottom, 400 is top. Let's map it: 256 is top, 0 is bottom
        const computedAltitude = Math.round(((height - state.birdY) / height) * 256);
        setCurrentAlt(Math.max(0, Math.min(256, computedAltitude)));

        // Boundary deaths (except in bypass/hacked mode or diving offscreen at 256)
        if (state.birdY < 0 && !state.bypassActive) {
          state.birdY = 0;
          state.birdVelocity = 0;
        }
        if (state.birdY > height - 15) {
          // At score 255+, going to Alt 0 (bottom of screen) triggers the completion bypass!
          if (state.score >= 255) {
            triggerCompletion();
          } else {
            handleDeath('Boundaries Error');
          }
        }

        // Pipe Management
        const pipeInterval = 100; // spawn pipe every 100 frames
        if (state.frameCount % pipeInterval === 0) {
          const gapSize = 100;
          const minPipeHeight = 40;
          const maxPipeHeight = height - gapSize - minPipeHeight;
          const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight)) + minPipeHeight;
          const bottomHeight = height - gapSize - topHeight;

          state.pipes.push({
            x: width,
            topHeight,
            bottomHeight,
            passed: false,
            index: state.pipeIndexCounter++,
          });
        }

        // Move Pipes
        state.pipes.forEach((pipe) => {
          pipe.x -= 3; // speed
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
            state.score++;
            setScore(state.score);

            // Trigger terminal/hacked graphics once we are inside sequence 37-44
            if (pipe.index >= 37 && state.bypassActive) {
              setHackedMode(true);
            }
          }

          // Collisions logic
          const collisionX = pipe.x <= birdX + birdSize && pipe.x + 50 >= birdX - birdSize;
          const collisionY = state.birdY - birdSize < pipe.topHeight || state.birdY + birdSize > height - pipe.bottomHeight;

          if (collisionX) {
            // Section 37 is the critical barrier.
            // If we are on pipe index 37 without the bypass or sequence matching, we hit an INVISIBLE WALL!
            if (pipe.index === 37 && !state.bypassActive) {
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
                  handleDeath('Collider Block #37 (Ghost Barrier)');
                }
              } else {
                handleDeath('Collider Block #37 (Ghost Barrier)');
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
                    handleDeath(`Altitude Sequence Unstable at Gate ${pipe.index}`);
                  }
                }
              }
            } else {
              // Standard pipe collision
              if (!state.bypassActive) {
                handleDeath('Collision Detected');
              }
            }
          }
        });
      }

      // --- Draw Pipes ---
      state.pipes.forEach((pipe) => {
        if (!hackedMode) {
          // Cheap bright gold slop-style gradient pipes with metallic shine
          const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + 50, 0);
          pipeGrad.addColorStop(0, '#ffe066');
          pipeGrad.addColorStop(0.3, '#ffb300');
          pipeGrad.addColorStop(0.7, '#e69500');
          pipeGrad.addColorStop(1, '#995c00');
          ctx.fillStyle = pipeGrad;
          ctx.strokeStyle = '#3d2500';
          ctx.lineWidth = 3;

          // Top pipe
          ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
          ctx.strokeRect(pipe.x, -5, 50, pipe.topHeight + 5);
          // Top pipe lip
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(pipe.x - 4, pipe.topHeight - 15, 58, 15);
          ctx.strokeRect(pipe.x - 4, pipe.topHeight - 15, 58, 15);

          // Bottom pipe
          const bottomY = height - pipe.bottomHeight;
          ctx.fillStyle = pipeGrad;
          ctx.fillRect(pipe.x, bottomY, 50, pipe.bottomHeight);
          ctx.strokeRect(pipe.x, bottomY, 50, pipe.bottomHeight + 5);
          // Bottom pipe lip
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(pipe.x - 4, bottomY, 58, 15);
          ctx.strokeRect(pipe.x - 4, bottomY, 58, 15);

          // Special flashing target sign for section 37 to hint at its weirdness
          if (pipe.index === 37) {
            ctx.save();
            ctx.fillStyle = (state.frameCount % 15 < 7) ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.05)';
            ctx.fillRect(pipe.x - 10, 0, 70, height);
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

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(angle);

      if (!hackedMode) {
        // AI-generated unaligned looking cartoon slop bird
        // Asymmetric eyes
        ctx.fillStyle = '#ff5722'; // bright messy orange body
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Messy unaligned beak
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.moveTo(10, -3);
        ctx.lineTo(22, 5);
        ctx.lineTo(8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Asymmetric eyes (looks slightly creepy/slanted like AI error)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(4, -5, 5, 0, Math.PI * 2);
        ctx.arc(0, -2, 3, 0, Math.PI * 2); // secondary weird offset eye
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(5, -5, 2.5, 0, Math.PI * 2);
        ctx.arc(0, -2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Flapping glitched wing
        ctx.fillStyle = '#e91e63';
        const wingFlap = Math.sin(state.frameCount * 0.4) * 6;
        ctx.beginPath();
        ctx.ellipse(-8, 2, 7, 10 + wingFlap, Math.PI / 4, 0, Math.PI * 2);
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

    const handleDeath = (reason: string) => {
      const state = stateRef.current;
      state.gameOver = true;
      setIsPlaying(false);
      audio.playExplode();
      
      // Update global context progress
      updateProgress((prev) => {
        const nextDeaths = prev.deathsAt37 + 1;
        
        // If they died at score 37 or reached high coordinates
        const reachedMax = Math.max(prev.deathsAt37, nextDeaths);

        return {
          ...prev,
          deathsAt37: nextDeaths,
          seenLeaderboard: nextDeaths >= 2 ? true : prev.seenLeaderboard,
          phase: prev.phase === 'intro_game' && nextDeaths >= 3 ? 'os_unlocked' : prev.phase
        };
      });

      // Show leaderboard after 2nd death
      setTimeout(() => {
        setShowLeaderboard(true);
      }, 800);
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
      // Draw static screen or placeholder when idle
      ctx.fillStyle = '#1e1b4b';
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
          width={480} 
          height={380} 
          className="w-full h-full object-contain max-h-[380px]"
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-amber-900/90 flex flex-col items-center justify-center p-4 text-center" id="game-start-panel">
            <div className="animate-bounce mb-3" id="game-logo">
              <div className="w-16 h-16 bg-amber-400 border-4 border-black rounded-full flex items-center justify-center relative shadow-lg">
                <div className="absolute w-6 h-6 bg-white border-2 border-black rounded-full top-2 right-2">
                  <div className="w-2 h-2 bg-black rounded-full absolute top-1 right-1"></div>
                </div>
                <div className="w-10 h-6 bg-pink-500 border-2 border-black rounded-ellipse absolute -left-2 bottom-2"></div>
                <div className="w-8 h-4 bg-yellow-300 border-2 border-black rounded-ellipse absolute bottom-1 right-2"></div>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow mb-1 animate-pulse">
              FLAPPY SOMETHING™
            </h1>
            <p className="text-pink-200 text-xs font-mono mb-4 bg-black/30 px-3 py-1 rounded">
              ★ REVOLUTIONARY MOBILE PHYSICS SIMULATOR ★
            </p>

            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-display font-black rounded-xl border-b-4 border-orange-700 shadow-lg text-lg transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              id="start-button"
            >
              <Play className="w-5 h-5 fill-black" />
              PLAY NOW!!!
            </button>

            {/* Simulated Spammy Ads Banner */}
            <div className="absolute bottom-2 left-2 right-2 bg-yellow-400 text-black text-[9px] font-bold py-1 px-2 rounded flex items-center justify-between shadow-md" id="spam-ad">
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

              {/* Hidden overflow negative score Noah Kade */}
              <div className="mt-4 border-t border-dashed border-emerald-500/20 pt-2">
                <div className="flex justify-between items-center bg-emerald-950/10 p-1.5 rounded border border-emerald-500/30">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">SYSTEM OVERFLOW</span>
                    <span>NOAH_KADE</span>
                  </div>
                  <span className="text-emerald-400 font-bold">-65535</span>
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
