import { useEffect, useState, useRef, useCallback } from "react";
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { GameScoreDisplay } from '../../components/GameScoreDisplay';

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
      submitScore(currentScore);
      return;
    }
    pieceRef.current = newPiece;
  }, [grid, canPlace, currentScore, submitScore]);

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
    window.addEventListener("keydown", onKey);
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
    <main className="p-6 text-slate-100 min-h-screen bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Tetris</h1>
          <div className="flex items-center gap-3">
            <GameScoreDisplay 
              currentScore={currentScore}
              lastScore={lastScore}
              bestScore={bestScore}
            />
            <EndGameButton />
            <button
              onClick={restart}
              className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm"
            >
              Restart
            </button>
          </div>
  </header>

        <GameInstructions 
          title="Cómo Jugar Tetris"
          description="Coloca las piezas que caen para formar líneas horizontales completas. Cuando completas una línea, desaparece y ganas puntos. El juego termina si las piezas llegan hasta arriba."
          controls={[
            { key: '←', action: 'Mover izquierda' },
            { key: '→', action: 'Mover derecha' },
            { key: '↓', action: 'Caída rápida' },
            { key: '↑ / Z', action: 'Rotar pieza' }
          ]}
          note="Completa múltiples líneas a la vez para obtener más puntos. ¡Evita dejar huecos!"
        />  <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 overflow-auto">
          <div style={{ width: COLS * 24, background: "#071123", padding: 6 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 24px)`,
                gap: 2,
              }}
            >
              {drawGrid.flat().map((cell, i) => (
                <div
                  key={i}
                  style={{
                    width: 24,
                    height: 24,
                    background: cell || "#0b1220",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                />
              ))}
            </div>
          </div>
          {gameOver && (
            <div className="mt-4 text-center text-white font-semibold">
              Game Over
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
