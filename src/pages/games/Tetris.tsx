import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, SparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

type Cell = string | null;
const ROWS = 20;
const COLS = 10;
const SPEED = 600;

type Piece = {
  shape: number[][];
  r: number;
  c: number;
  type: string;
  rot: number;
  color: string;
};

const SHAPES: Record<string, number[][][]> = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  O: [[[1, 1], [1, 1]]],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]],
  ],
};

const COLORS: Record<string, string> = {
  I: "#06b6d4",
  O: "#f59e0b",
  T: "#ef4444",
  S: "#10b981",
  Z: "#8b5cf6",
  J: "#3b82f6",
  L: "#f97316",
};

function emptyGrid(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));
}

function cloneGrid(g: Cell[][]) {
  return g.map((r) => r.slice());
}

export default function Tetris() {
  const [grid, setGrid] = useState<Cell[][]>(() => emptyGrid());
  const [gameOver, setGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const tickRef = useRef<number | null>(null);
  
  const { submitScore, lastScore, bestScore } = useGameScore('tetris');
  const { isMuted, toggleMute } = useBackgroundMusic();

  useEffect(() => {
    setCurrentScore(0);
  }, []);

  const pieceRef = useRef<{
    shape: number[][];
    r: number;
    c: number;
    type: string;
    rot: number;
    color: string;
  } | null>(null);

  // 🔹 Verifica si se puede colocar una pieza
  const canPlace = useCallback((p: Piece, g: Cell[][], rr = p.r, cc = p.c) => {
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < p.shape[y].length; x++) {
        if (!p.shape[y][x]) continue;
        const ny = rr + y;
        const nx = cc + x;
        if (ny < 0) continue;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
        if (g[ny][nx]) return false;
      }
    }
    return true;
  }, []);

  // 🔹 Spawnea una nueva pieza
  const spawn = useCallback(() => {
    const types = Object.keys(SHAPES);
    const t = types[Math.floor(Math.random() * types.length)];
    const rots = SHAPES[t];
    const rot = 0;
    const shape = rots[rot];
    const r = 0;
    const c = Math.floor((COLS - shape[0].length) / 2);
    const newPiece = { shape, r, c, type: t, rot, color: COLORS[t] };
    if (!canPlace(newPiece, grid)) {
      setGameOver(true);
      // Solo guardar si es primera vez o supera el mejor puntaje
      if (bestScore === null || currentScore > bestScore) {
        submitScore(currentScore);
      }
      return;
    }
    pieceRef.current = newPiece;
  }, [grid, canPlace, currentScore, submitScore, bestScore]);

  // 🔹 Fija la pieza al grid
  const lockPiece = useCallback(() => {
    const cur = pieceRef.current!;
    const g = cloneGrid(grid);
    for (let y = 0; y < cur.shape.length; y++) {
      for (let x = 0; x < cur.shape[y].length; x++) {
        if (cur.shape[y][x]) g[cur.r + y][cur.c + x] = cur.color;
      }
    }

    // 🔹 Limpia líneas completas
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (g[r].every((c) => c !== null)) {
        g.splice(r, 1);
        g.unshift(Array.from({ length: COLS }, () => null));
        cleared++;
        r++;
      }
    }

    if (cleared) {
      const points = cleared * 100;
      setCurrentScore((s) => s + points);
    }
    setGrid(g);
    pieceRef.current = null;
  }, [grid]);

  // 🔹 Un paso del juego (caída)
  const step = useCallback(() => {
    if (gameOver) return;
    if (!pieceRef.current) {
      spawn();
      return;
    }
    const p = pieceRef.current;
    if (canPlace(p, grid, p.r + 1, p.c)) {
      p.r += 1;
    } else {
      lockPiece();
    }
    setGrid((g) => [...g]);
  }, [gameOver, grid, spawn, lockPiece, canPlace]);

  // 🔹 Intervalo de caída
  useEffect(() => {
    tickRef.current = window.setInterval(step, SPEED);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [step]);

  // 🔹 Controles del teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameOver) return;
      const p = pieceRef.current;
      if (!p) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.code === "Space") {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        if (canPlace(p, grid, p.r, p.c - 1)) p.c -= 1;
      } else if (e.key === "ArrowRight") {
        if (canPlace(p, grid, p.r, p.c + 1)) p.c += 1;
      } else if (e.key === "ArrowDown") {
        if (canPlace(p, grid, p.r + 1, p.c)) p.r += 1;
        else lockPiece();
      } else if (e.key === "ArrowUp") {
        const rots = SHAPES[p.type];
        const nextRot = (p.rot + 1) % rots.length;
        const nextShape = rots[nextRot];
        const saved = p.shape;
        p.shape = nextShape;
        p.rot = nextRot;
        if (!canPlace(p, grid, p.r, p.c)) {
          p.shape = saved;
          p.rot = (p.rot - 1 + rots.length) % rots.length;
        }
      } else if (e.code === "Space") {
        while (canPlace(p, grid, p.r + 1, p.c)) p.r += 1;
        lockPiece();
      }
      setGrid((g) => [...g]);
    }
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [grid, gameOver, canPlace, lockPiece]);

  // 🔹 Reiniciar
  const restart = useCallback(() => {
    setGrid(emptyGrid());
    setCurrentScore(0);
    setGameOver(false);
    pieceRef.current = null;
    spawn();
  }, [spawn]);

  // 🔹 Render del grid con pieza activa
  const drawGrid = (() => {
    const g = cloneGrid(grid);
    const p = pieceRef.current;
    if (p)
      for (let y = 0; y < p.shape.length; y++)
        for (let x = 0; x < p.shape[y].length; x++)
          if (p.shape[y][x]) {
            const ny = p.r + y,
              nx = p.c + x;
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS)
              g[ny][nx] = p.color;
          }
    return g;
  })();

  // 🔹 Si no hay pieza activa al inicio
  useEffect(() => {
    if (!pieceRef.current && !gameOver) spawn();
  }, [spawn, gameOver]);

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
              <div className="text-5xl">🧱</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-cyan-400 via-blue-300 to-cyan-500 bg-clip-text text-transparent">
                Tetris
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
                <SpeakerWaveIcon className="w-6 h-6 text-cyan-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Completa líneas y alcanza el puntaje más alto</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Stats Card */}
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4">
              
              {/* Score Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* Current Score */}
                <div className="p-4 bg-linear-to-br from-cyan-500/10 to-blue-600/5 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-300">Puntos</span>
                    <FireIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-4xl font-black bg-linear-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    {currentScore.toLocaleString()}
                  </div>
                </div>

                {/* Best & Last Score */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                    <div className="flex items-center gap-1 mb-1">
                      <TrophyIcon className="w-4 h-4 text-amber-400" />
                      <div className="text-slate-500 text-xs">Récord</div>
                    </div>
                    <div className="font-semibold text-white text-lg">
                      {bestScore !== null ? bestScore.toLocaleString() : '0'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                    <div className="flex items-center gap-1 mb-1">
                      <SparklesIcon className="w-4 h-4 text-purple-400" />
                      <div className="text-slate-500 text-xs">Último</div>
                    </div>
                    <div className="font-semibold text-white text-lg">
                      {lastScore !== null ? lastScore.toLocaleString() : '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={restart} 
                  className="flex-1 py-3 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-black font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20"
                >
                  🔄 Reiniciar
                </button>
                <EndGameButton onEnd={() => submitScore(currentScore)} />
              </div>

              {/* Game Over */}
              {gameOver && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💀</span>
                    <span className="text-lg font-bold text-red-400">Game Over</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-4">Las piezas llegaron hasta arriba</p>
                  <button
                    onClick={restart}
                    className="w-full py-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    🔄 Jugar de Nuevo
                  </button>
                </motion.div>
              )}
            </div>

          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 flex items-center justify-center">
              <div 
                className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-2 border-4 border-cyan-500/20 shadow-2xl shadow-cyan-500/20 overflow-hidden"
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${COLS}, 28px)`,
                    gap: '1px',
                  }}
                >
                  <AnimatePresence>
                    {drawGrid.flat().map((cell, i) => {
                      const isEmpty = !cell;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className="rounded relative overflow-hidden"
                          style={{
                            width: 28,
                            height: 28,
                            background: isEmpty 
                              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                              : `linear-gradient(135deg, ${cell} 0%, ${cell}dd 100%)`,
                            boxShadow: isEmpty 
                              ? 'inset 0 1px 2px rgba(0,0,0,0.3)' 
                              : `0 0 15px ${cell}50, inset 0 0 8px rgba(255,255,255,0.2)`,
                          }}
                        >
                          {!isEmpty && (
                            <>
                              {/* Brillo superior */}
                              <div 
                                className="absolute top-0 left-0 right-0 h-1/2 rounded-t"
                                style={{
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)'
                                }}
                              />
                              {/* Punto de luz */}
                              <div 
                                className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: 'rgba(255,255,255,0.6)',
                                  filter: 'blur(0.5px)'
                                }}
                              />
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.section>

        </div>

        {/* Instructions at the Bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Game Info */}
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">Objetivo</span>
              </div>
              <p className="text-slate-300 text-sm">
                Completa líneas horizontales para eliminarlas y ganar puntos. 
                Cada línea vale 100 puntos. ¡Evita que las piezas lleguen arriba!
              </p>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-cyan-300">Controles</span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">←</kbd>
                  <span className="text-slate-400 text-xs">Izquierda</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">→</kbd>
                  <span className="text-slate-400 text-xs">Derecha</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">↓</kbd>
                  <span className="text-slate-400 text-xs">Caída rápida</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">↑</kbd>
                  <span className="text-slate-400 text-xs">Rotar</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Espacio</kbd>
                  <span className="text-slate-400 text-xs">Caída instantánea</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
