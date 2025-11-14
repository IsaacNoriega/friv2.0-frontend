import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
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
      if (isMoving) return; // Prevent spam by blocking during animation
      
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
        
        // Track merged tiles indices for animation highlighting
        const newMerged = new Set<number>();
        result.grid.flat().forEach((v, idx) => {
          const oldV = grid.flat()[idx];
          if (v && oldV && v > oldV && v !== 2) {
            newMerged.add(idx);
          }
        });
        
        // record move direction to drive entrance/exit animations
        setLastMoveDir(key);
        setRenderVersion(v => v + 1);
        setMergedIndices(newMerged);
        setTimeout(() => setMergedIndices(new Set()), 450);
        setGrid(withSpawn);
        
        // Release cooldown after animation completes
        setTimeout(() => setIsMoving(false), 250);
        
        const gain = result.scoreGain ?? 0;
        setScore((s) => {
          const newScore = s + gain;
          if (newScore > best) {
            setBest(newScore);
            localStorage.setItem("best2048", String(newScore));
          }
          if (!hasMoves(withSpawn)) {
            setOver(true);
            submitScore(newScore).catch(() => {});
          }
          return newScore;
        });
      }
    },
    [grid, best, submitScore, isMoving]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (over) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        handleMove(e.key);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleMove, over]);

  // Soporte para móvil (swipes)
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
    <main className="p-6 text-slate-100 min-h-screen bg-[#071123]">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">2048 🎮</h1>
            <p className="text-slate-400 text-sm">
              Usa las flechas o desliza para mover las fichas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              Score: <span className="font-semibold text-white">{score}</span>
            </div>
            <div className="text-sm text-slate-300">
              Best: <span className="font-semibold text-white">{best}</span>
            </div>
            <EndGameButton />
            <button
              onClick={restart}
              className="px-3 py-1 bg-[#0ea5e9] hover:bg-[#38bdf8] rounded text-black text-sm font-semibold transition"
            >
              Nuevo Juego
            </button>
          </div>
  </header>

  <GameInstructions />

  <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 shadow-lg">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {grid.flat().map((v, i) => {
                // compute entrance offset based on lastMoveDir
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
                        ? { x: 0, y: 0, opacity: 1, scale: [1, 1.08, 1] }
                        : { x: 0, y: 0, opacity: 1, scale: 1 }
                    }
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{
                      duration: isMerged ? 0.35 : 0.2,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className={`flex items-center justify-center text-2xl font-bold rounded-md ${tileColor(
                      v
                    )} ${
                      isMerged
                        ? "border-2 border-amber-400 shadow-lg shadow-amber-500/50"
                        : "border border-slate-800"
                    }`}
                    style={{
                      aspectRatio: "1 / 1",
                      minHeight: 70,
                    }}
                  >
                    {v ?? ""}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">
              <div className="text-2xl font-bold mb-2">💀 Game Over 💀</div>
              <p className="text-slate-300 mb-4">
                No quedan movimientos disponibles.
              </p>
              <button
                onClick={restart}
                className="px-4 py-2 bg-[#5b34ff] hover:bg-[#7c5bff] text-white rounded-md font-semibold"
              >
                Reiniciar
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
