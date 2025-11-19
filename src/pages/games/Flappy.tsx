import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, PlayIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

export default function Flappy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Estados de React (UI)
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Hooks personalizados
  const { submitScore, bestScore } = useGameScore('flappy');
  const { isMuted, toggleMute } = useBackgroundMusic();

  // --- CORRECCIÓN CRÍTICA: REFS ---
  // Usamos referencias para 'bestScore' y 'submitScore'.
  // Esto permite acceder al valor más reciente DENTRO del loop del juego
  // SIN tener que añadir estas variables a las dependencias del useEffect.
  // Si las ponemos en dependencias, el juego se reinicia cada vez que cambia el score.
  const submitScoreRef = useRef(submitScore);
  const bestScoreRef = useRef(bestScore);

  // Mantenemos las referencias actualizadas
  useEffect(() => {
    submitScoreRef.current = submitScore;
    bestScoreRef.current = bestScore;
  }, [submitScore, bestScore]);

  // --- FUNCIÓN DE REINICIO ---
  const handleReset = () => {
    setRunning(false);
    setGameOver(false);
    setScore(0);
    // Pequeño delay para asegurar limpieza del canvas anterior
    setTimeout(() => {
      setRunning(true);
    }, 50);
  };

  // --- LÓGICA DEL JUEGO ---
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

    // Variables mutables del juego (No usar useState aquí para rendimiento)
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

    // Inicialización interna
    function initGameLoop() {
      birdY = H / 2;
      vy = 0;
      pipes = [];
      tick = 0;
      internalScore = 0;
      alive = true;
      spawnPipe();
    }

    function flap() {
      if (!alive) return;
      vy = jump;
    }

    function step() {
      if (!alive) return;
      
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
          // Actualizamos la UI, pero esto NO reinicia el efecto gracias a las deps vacías
          setScore(internalScore); 
        }
      });

      // Colisiones
      for (const p of pipes) {
        const pipeW = 52;
        // Hitbox reducida (10px en vez de 12) para ser más justo
        if (birdX + 10 > p.x && birdX - 10 < p.x + pipeW) {
          if (birdY - 10 < p.gapY - gap / 2 || birdY + 10 > p.gapY + gap / 2) {
            alive = false;
            break;
          }
        }
      }

      // Suelo / techo
      if (birdY > H - 10 || birdY < 0) alive = false;

      // Si muere
      if (!alive) {
        setGameOver(true);
        
        // Usamos las REFS para checar el score sin reiniciar el hook
        const currentBest = bestScoreRef.current;
        const submitFn = submitScoreRef.current;

        if (currentBest === null || internalScore > currentBest) {
          submitFn(internalScore).catch(() => {});
        }
      }
    }

    function draw() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Fondo Cielo
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, '#4facfe');
      gradient.addColorStop(1, '#00f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Pájaro
      const birdGradient = ctx.createRadialGradient(birdX, birdY, 3, birdX, birdY, 12);
      birdGradient.addColorStop(0, '#ffeb3b');
      birdGradient.addColorStop(1, '#ff9800');
      ctx.fillStyle = birdGradient;
      ctx.beginPath();
      ctx.arc(birdX, birdY, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Ojo Pájaro
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(birdX + 4, birdY - 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tubos
      pipes.forEach((p) => {
        const pipeW = 52;
        const pipeGradient = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
        pipeGradient.addColorStop(0, '#4caf50');
        pipeGradient.addColorStop(1, '#2e7d32');
        ctx.fillStyle = pipeGradient;
        
        // Tubo Arriba
        ctx.fillRect(p.x, 0, pipeW, p.gapY - gap / 2);
        // Tubo Abajo
        ctx.fillRect(p.x, p.gapY + gap / 2, pipeW, rect.height - (p.gapY + gap / 2));
        
        // Bordes
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, pipeW, p.gapY - gap / 2);
        ctx.strokeRect(p.x, p.gapY + gap / 2, pipeW, rect.height - (p.gapY + gap / 2));
      });
    }

    function loop() {
      step();
      draw();
    }

    // Controles
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") flap();
    }
    function onClick() {
      flap();
    }

    initGameLoop();
    
    // Loop limitado a 60 FPS
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    
    function limitedLoop(currentTime: number) {
      if (!alive) return;
      
      raf = requestAnimationFrame(limitedLoop);
      
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        loop();
      }
    }
    
    raf = requestAnimationFrame(limitedLoop);
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      if (canvas) canvas.removeEventListener("click", onClick);
    };
  
  // IMPORTANTE: La única dependencia es 'running'.
  // Al no poner 'score' ni hooks aquí, evitamos el reinicio al puntuar.
  }, [running]);

  return (
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🐤</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-yellow-400 via-orange-300 to-yellow-500 bg-clip-text text-transparent">
                Flappy Bird
              </h1>
            </div>
            <button
              onClick={toggleMute}
              className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
              title={isMuted ? "Activar música" : "Silenciar música"}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6 text-slate-400" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6 text-yellow-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Vuela entre los tubos sin chocar</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* IZQUIERDA: Stats & Controls */}
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
                  {bestScore || 0}
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

              {/* Controls Info */}
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

              {/* Botones de Acción */}
              {!running && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={gameOver ? handleReset : () => setRunning(true)}
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

          {/* DERECHA: Game Canvas */}
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
                          <button
                            onClick={handleReset}
                            className="px-8 py-3 rounded-xl bg-linear-to-r from-yellow-500 to-orange-600 text-white font-black hover:from-yellow-600 hover:to-orange-700 transition-all shadow-2xl shadow-yellow-500/30"
                          >
                            🔄 Jugar de Nuevo
                          </button>
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

        {/* Instrucciones */}
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