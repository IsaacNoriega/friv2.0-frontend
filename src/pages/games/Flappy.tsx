import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

export default function Flappy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() =>
    Number(localStorage.getItem("flappy_best") || 0)
  );
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { submitScore } = useGameScore('flappy');

  useEffect(() => {
    if (!running) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const DPR = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Constantes del juego
    const W = 480;
    const H = 360;
    const gravity = 0.45;
    const jump = -8;
    const pipeSpeed = 2.6;
    const gap = 100;

    // Estado del juego
    let birdY = H / 2;
    const birdX = 80;
    let vy = 0;
    type Pipe = { x: number; gapY: number; scored?: boolean };
    let pipes: Pipe[] = [];
    let tick = 0;
    let alive = true;
    let internalScore = 0;

    function spawnPipe() {
      const gapY = 80 + Math.random() * (H - 240);
      pipes.push({ x: W + 20, gapY });
    }

    function reset() {
      birdY = H / 2;
      vy = 0;
      pipes = [];
      tick = 0;
      internalScore = 0;
      alive = true;
      spawnPipe();
      setScore(0);
      setGameOver(false);
    }

    function flap() {
      if (!alive) return;
      vy = jump;
    }

    function step() {
      tick += 1;
      if (tick % 100 === 0) spawnPipe();

      vy += gravity;
      birdY += vy;

      // Mover tubos
      pipes = pipes.map((p) => ({ ...p, x: p.x - pipeSpeed }));
      if (pipes.length && pipes[0].x < -60) pipes.shift();

      // Puntuar al pasar un tubo
      pipes.forEach((p) => {
        if (!p.scored && p.x + 20 < birdX) {
          p.scored = true;
          internalScore++;
          setScore(internalScore);
        }
      });

      // Colisiones
      for (const p of pipes) {
        const pipeW = 52;
        if (birdX + 12 > p.x && birdX - 12 < p.x + pipeW) {
          if (birdY - 12 < p.gapY - gap / 2 || birdY + 12 > p.gapY + gap / 2) {
            alive = false;
          }
        }
      }

      // Suelo / techo
      if (birdY > H - 10 || birdY < 0) alive = false;

      // Si muere, detener y mostrar "Game Over"
      if (!alive) {
        setBest((b) => {
          const nb = Math.max(b, internalScore);
          localStorage.setItem("flappy_best", String(nb));
          return nb;
        });
        setGameOver(true);
        // enviar puntuación final
        submitScore(internalScore).catch(() => {});
        setRunning(false);
      }
    }

    function draw() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Sky gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, '#4facfe');
      gradient.addColorStop(1, '#00f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Bird (yellow with gradient)
      const birdGradient = ctx.createRadialGradient(birdX, birdY, 3, birdX, birdY, 12);
      birdGradient.addColorStop(0, '#ffeb3b');
      birdGradient.addColorStop(1, '#ff9800');
      ctx.fillStyle = birdGradient;
      ctx.beginPath();
      ctx.arc(birdX, birdY, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Bird eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(birdX + 4, birdY - 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Pipes (green gradient)
      pipes.forEach((p) => {
        const pipeW = 52;
        const pipeGradient = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
        pipeGradient.addColorStop(0, '#4caf50');
        pipeGradient.addColorStop(1, '#2e7d32');
        ctx.fillStyle = pipeGradient;
        
        // Top pipe
        ctx.fillRect(p.x, 0, pipeW, p.gapY - gap / 2);
        // Bottom pipe
        ctx.fillRect(
          p.x,
          p.gapY + gap / 2,
          pipeW,
          rect.height - (p.gapY + gap / 2)
        );
        
        // Pipe borders
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, pipeW, p.gapY - gap / 2);
        ctx.strokeRect(p.x, p.gapY + gap / 2, pipeW, rect.height - (p.gapY + gap / 2));
      });
    }

    function loop() {
      step();
      draw();
      if (alive) raf = requestAnimationFrame(loop);
    }

    // Controles
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") flap();
    }
    function onClick() {
      flap();
    }

    reset();
    raf = requestAnimationFrame(loop);
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("click", onClick);
    };
  }, [running, best, submitScore]);

  return (
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-5xl">🐤</div>
            <h1 className="text-5xl font-black bg-linear-to-r from-yellow-400 via-orange-300 to-yellow-500 bg-clip-text text-transparent">
              Flappy Bird
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-16">Vuela entre los tubos sin chocar</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">
              
              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-yellow-500/10 to-orange-600/5 rounded-lg border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-yellow-300">Puntuación</span>
                  <FireIcon className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-5xl font-black bg-linear-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">
                  {score}
                </div>
              </div>

              {/* Best Score */}
              <div className="p-4 bg-linear-to-br from-orange-500/10 to-amber-600/5 rounded-lg border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-orange-300">Récord</span>
                  <TrophyIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-4xl font-black text-orange-300">
                  {best}
                </div>
              </div>

              {/* Game Status */}
              <AnimatePresence mode="wait">
                {gameOver && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💀</span>
                      <div>
                        <div className="text-lg font-bold text-red-400">Game Over</div>
                        <div className="text-sm text-red-300">Puntuación final: {score}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="text-sm text-slate-400 mb-2">Controles</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">␣ Espacio</kbd>
                    <span className="text-slate-300">Aletear</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">🖘 Clic</kbd>
                    <span className="text-slate-300">Aletear</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!running && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setRunning(true)}
                  className="w-full py-3 rounded-lg bg-linear-to-r from-yellow-500 to-orange-600 text-white font-bold hover:from-yellow-600 hover:to-orange-700 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  {gameOver ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5" />
                      Reintentar
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5" />
                      Empezar
                    </>
                  )}
                </motion.button>
              )}

              <EndGameButton onEnd={() => submitScore(score)} />
            </div>
          </motion.section>

          {/* RIGHT: Game Canvas */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full flex items-center justify-center">
              <div className="w-full relative" style={{ maxWidth: 480 }}>
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-xl shadow-2xl shadow-yellow-500/20 border-4 border-yellow-500/20"
                  style={{
                    height: 360,
                    display: "block",
                  }}
                />
                <AnimatePresence>
                  {!running && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl"
                    >
                      {gameOver ? (
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center"
                        >
                          <div className="text-6xl mb-4">💀</div>
                          <div className="text-3xl font-black mb-2 text-red-400">Game Over</div>
                          <div className="text-xl text-slate-300 mb-6">
                            Puntuación final: <span className="font-bold text-yellow-400">{score}</span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center"
                        >
                          <div className="text-7xl mb-4">🐤</div>
                          <div className="text-3xl font-black mb-2 text-yellow-400">Flappy Bird</div>
                          <div className="text-lg text-slate-300 mb-6">
                            Haz clic o presiona Espacio para volar
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>

        </div>

        {/* BOTTOM ROW: Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GameInstructions 
            title="Cómo Jugar Flappy Bird"
            description="Haz clic o presiona Espacio para que el pájaro aletee y suba. Pasa entre los tubos sin chocar. Cada tubo superado suma 1 punto. ¡La gravedad te empuja hacia abajo constantemente!"
            controls={[
              { key: 'Espacio', action: 'Aletear / Saltar' },
              { key: 'Clic', action: 'Aletear / Saltar' }
            ]}
            note="El tiempo de reacción es clave. Mantén un ritmo constante de clics para volar suavemente."
          />
        </motion.div>

      </div>
    </main>
  );
}
