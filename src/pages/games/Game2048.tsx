import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

type Tile = number | null;
const SIZE = 4;

function emptyGrid(): Tile[][] {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null)
  );
}

function randSpot(grid: Tile[][]) {
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (!grid[r][c]) empties.push([r, c]);
  if (!empties.length) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

function spawnTile(grid: Tile[][]) {
  const spot = randSpot(grid);
  if (!spot) return grid;
  const [r, c] = spot;
  const copy = grid.map((row) => row.slice());
  copy[r][c] = Math.random() < 0.9 ? 2 : 4;
  return copy;
}

function rotate(grid: Tile[][]) {
  const out = emptyGrid();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) out[r][c] = grid[c][r];
  return out;
}

function moveLeft(grid: Tile[][]) {
  let moved = false;
  let scoreGain = 0;
  const out = grid.map((row) => {
    const vals = row.filter(Boolean) as number[];
    for (let i = 0; i < vals.length - 1; i++) {
      if (vals[i] === vals[i + 1]) {
        vals[i] *= 2;
        scoreGain += vals[i];
        vals.splice(i + 1, 1);
      }
    }
    while (vals.length < SIZE) vals.push(null as unknown as number);
    const rowOut = vals.map((v) => (v === null ? null : v));
    if (rowOut.some((v, i) => v !== row[i])) moved = true;
    return rowOut;
  });
  return { grid: out, moved, scoreGain };
}

function hasMoves(g: Tile[][]) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (!g[r][c]) return true;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE - 1; c++) if (g[r][c] === g[r][c + 1]) return true;
  for (let c = 0; c < SIZE; c++)
    for (let r = 0; r < SIZE - 1; r++) if (g[r][c] === g[r + 1][c]) return true;
  return false;
}

export default function Game2048() {
  const [grid, setGrid] = useState<Tile[][]>(() => {
    const g = spawnTile(spawnTile(emptyGrid()));
    return g;
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(
    () => Number(localStorage.getItem("best2048")) || 0
  );
  const [over, setOver] = useState(false);
  const { submitScore } = useGameScore('2048');
  const [lastMoveDir, setLastMoveDir] = useState<string | null>(null);
  const [renderVersion, setRenderVersion] = useState(0);
  const [mergedIndices, setMergedIndices] = useState<Set<number>>(new Set());
  const [isMoving, setIsMoving] = useState(false);

  const handleMove = useCallback(
    (key: string) => {
      if (isMoving) return;

      let g = grid.map((r) => r.slice());
      let result: { grid: Tile[][]; moved: boolean; scoreGain?: number };

      if (key === "ArrowLeft") result = moveLeft(g);
      else if (key === "ArrowRight") {
        g = g.map((r) => r.slice().reverse());
        result = moveLeft(g);
        result.grid = result.grid.map((r) => r.slice().reverse());
      } else if (key === "ArrowUp") {
        g = rotate(g);
        result = moveLeft(g);
        result.grid = rotate(result.grid);
      } else if (key === "ArrowDown") {
        g = rotate(g).map((r) => r.slice().reverse());
        result = moveLeft(g);
        result.grid = rotate(result.grid.map((r) => r.slice().reverse()));
      } else return;

      if (result.moved) {
        setIsMoving(true);
        const withSpawn = spawnTile(result.grid);

        const newMerged = new Set<number>();
        result.grid.flat().forEach((v, idx) => {
          const oldV = grid.flat()[idx];
          if (v && oldV && v > oldV && v !== 2) {
            newMerged.add(idx);
          }
        });

        setLastMoveDir(key);
        setRenderVersion(v => v + 1);
        setMergedIndices(newMerged);
        setTimeout(() => setMergedIndices(new Set()), 450);
        setGrid(withSpawn);

        setTimeout(() => setIsMoving(false), 250);

        const gain = result.scoreGain ?? 0;
        setScore((s) => {
          const newScore = s + gain;
          if (newScore > best) {
            setBest(newScore);
            localStorage.setItem("best2048", String(newScore));
            submitScore(newScore).catch(() => { });
          }
          if (!hasMoves(withSpawn)) {
            setOver(true);
            if (newScore <= best) {
              submitScore(newScore).catch(() => { });
            }
          }
          return newScore;
        });
      }
    },
    [grid, best, submitScore, isMoving]
  );

  useEffect(() => {
    const keyMap: { [key: string]: string } = {
      'a': "ArrowLeft",
      'w': "ArrowUp",
      's': "ArrowDown",
      'd': "ArrowRight",
      'arrowleft': "ArrowLeft",
      'arrowup': "ArrowUp",
      'arrowdown': "ArrowDown",
      'arrowright': "ArrowRight",
    };

    function onKey(e: KeyboardEvent) {
      if (over) return;

      const moveKey = keyMap[e.key.toLowerCase()];

      if (moveKey) {
        e.preventDefault();
        handleMove(moveKey);
      }
    }
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [handleMove, over]);

  useEffect(() => {
    let startX = 0,
      startY = 0;
    function touchStart(e: TouchEvent) {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    }
    function touchEnd(e: TouchEvent) {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(dx > 0 ? "ArrowRight" : "ArrowLeft");
      } else {
        handleMove(dy > 0 ? "ArrowDown" : "ArrowUp");
      }
    }
    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchend", touchEnd);
    return () => {
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
    };
  }, [handleMove]);

  function restart() {
    const g = spawnTile(spawnTile(emptyGrid()));
    setGrid(g);
    setScore(0);
    setOver(false);
  }

  function tileColor(val: number | null) {
    if (!val) return "bg-[#0b1220] text-slate-400";
    const colors: Record<number, string> = {
      2: "bg-[#eee4da] text-[#776e65]",
      4: "bg-[#ede0c8] text-[#776e65]",
      8: "bg-[#f2b179] text-white",
      16: "bg-[#f59563] text-white",
      32: "bg-[#f67c5f] text-white",
      64: "bg-[#f65e3b] text-white",
      128: "bg-[#edcf72] text-white",
      256: "bg-[#edcc61] text-white",
      512: "bg-[#edc850] text-white",
      1024: "bg-[#edc53f] text-white",
      2048: "bg-[#edc22e] text-white",
    };
    return colors[val] || "bg-[#3c3a32] text-white";
  }

  return (
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="text-5xl">🎯</div>
            <h1 className="text-5xl font-black bg-linear-to-r from-amber-400 via-orange-300 to-amber-500 bg-clip-text text-transparent">
              2048
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-16">Combina fichas hasta llegar al 2048</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">
              
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Current Score */}
                <div className="p-4 bg-linear-to-br from-amber-500/10 to-orange-600/5 rounded-lg border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-300">Puntos</span>
                    <FireIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black bg-linear-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                    {score.toLocaleString()}
                  </div>
                </div>

                {/* Best Score */}
                <div className="p-4 bg-linear-to-br from-purple-500/10 to-pink-600/5 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-300">Récord</span>
                    <TrophyIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black bg-linear-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                    {best.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-300">Objetivo</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Combina fichas del mismo número para crear la ficha 2048. 
                  Cada movimiento añade una nueva ficha al tablero.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={restart} 
                  className="flex-1 py-3 rounded-lg bg-linear-to-r from-amber-500 to-orange-600 text-black font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20"
                >
                  🔄 Nuevo Juego
                </button>
                <EndGameButton onEnd={() => submitScore(score)} />
              </div>

              {/* Game Status */}
              {over && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💀</span>
                    <span className="text-lg font-bold text-red-400">Game Over</span>
                  </div>
                  <p className="text-slate-300 text-sm">No quedan movimientos disponibles</p>
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
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full flex items-center justify-center">
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {grid.flat().map((v, i) => {
                    let enterX = 0;
                    let enterY = 0;
                    if (lastMoveDir === 'ArrowLeft') enterX = 24;
                    if (lastMoveDir === 'ArrowRight') enterX = -24;
                    if (lastMoveDir === 'ArrowUp') enterY = 24;
                    if (lastMoveDir === 'ArrowDown') enterY = -24;

                    const key = `tile-${renderVersion}-${i}-${v}`;
                    const isMerged = mergedIndices.has(i);

                    return (
                      <motion.div
                        layout
                        key={key}
                        initial={{ x: enterX, y: enterY, opacity: 0, scale: 0.88 }}
                        animate={
                          isMerged
                            ? { x: 0, y: 0, opacity: 1, scale: [1, 1.12, 1] }
                            : { x: 0, y: 0, opacity: 1, scale: 1 }
                        }
                        exit={{ opacity: 0, scale: 0.88 }}
                        transition={{
                          duration: isMerged ? 0.35 : 0.2,
                          ease: [0.4, 0.0, 0.2, 1],
                        }}
                        className={`flex items-center justify-center text-3xl font-black rounded-xl ${tileColor(
                          v
                        )} ${isMerged
                            ? "ring-2 ring-amber-400 shadow-2xl shadow-amber-500/50"
                            : "shadow-lg"
                          }`}
                        style={{
                          aspectRatio: "1 / 1",
                          minHeight: 90,
                        }}
                      >
                        {v ?? ""}
                      </motion.div>
                    );
                  })}
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
            title="Cómo Jugar 2048"
            description="Usa las teclas de flecha, las teclas W, A, S, D o desliza en la pantalla para mover las fichas. Cuando dos fichas con el mismo número se tocan, se fusionan en una sola sumando sus valores. ¡El objetivo es crear una ficha con el número 2048!"
            controls={[
              { key: '← / A', action: 'Mover izquierda' },
              { key: '→ / D', action: 'Mover derecha' },
              { key: '↑ / W', action: 'Mover arriba' },
              { key: '↓ / S', action: 'Mover abajo' }
            ]}
            note="Cada movimiento genera una nueva ficha (2 o 4). El juego termina cuando no quedan movimientos posibles."
          />
        </motion.div>

      </div>
    </main>
  );
}