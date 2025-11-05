import { useState, useEffect } from "react";

const ROWS = 6;
const COLS = 7;

function emptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 0)
  );
}

function checkWin(grid: number[][], lastR: number, lastC: number) {
  const player = grid[lastR][lastC];
  if (!player) return false;
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let k = 1; k < 4; k++) {
      const r = lastR + dr * k,
        c = lastC + dc * k;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || grid[r][c] !== player)
        break;
      count++;
    }
    for (let k = 1; k < 4; k++) {
      const r = lastR - dr * k,
        c = lastC - dc * k;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || grid[r][c] !== player)
        break;
      count++;
    }
    if (count >= 4) return true;
  }
  return false;
}

function getValidMoves(grid: number[][]) {
  return Array.from({ length: COLS }, (_, c) =>
    grid[0][c] === 0 ? c : null
  ).filter((v) => v !== null) as number[];
}

// CPU move generator by difficulty
function getCpuMove(grid: number[][], difficulty: "easy" | "medium" | "hard") {
  const validMoves = getValidMoves(grid);
  if (validMoves.length === 0) return null;

  // Easy: random
  if (difficulty === "easy") {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  // Medium: try to win or block
  for (const move of validMoves) {
    const sim = grid.map((r) => [...r]);
    for (let r = ROWS - 1; r >= 0; r--) {
      if (sim[r][move] === 0) {
        sim[r][move] = 2;
        if (checkWin(sim, r, move)) return move; // win
        sim[r][move] = 1;
        if (checkWin(sim, r, move)) return move; // block
        break;
      }
    }
  }

  // Hard: same as medium but prefers center
  if (difficulty === "hard") {
    const center = 3;
    const centerMove = validMoves.includes(center) ? center : null;
    if (centerMove && Math.random() < 0.6) return centerMove;
  }

  // fallback random
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

export default function Connect4() {
  const [grid, setGrid] = useState<number[][]>(() => emptyBoard());
  const [player, setPlayer] = useState(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [cpuThinking, setCpuThinking] = useState(false);

  function drop(col: number, p = player) {
    if (winner || cpuThinking) return;
    const g = grid.map((r) => r.slice());
    for (let r = ROWS - 1; r >= 0; r--) {
      if (g[r][col] === 0) {
        g[r][col] = p;
        setGrid(g);
        if (checkWin(g, r, col)) {
          setWinner(p);
        } else if (g.every((row) => row.every((c) => c !== 0))) {
          setWinner(0); // tie
        } else {
          setPlayer(p === 1 ? 2 : 1);
        }
        return;
      }
    }
  }

  useEffect(() => {
    if (player === 2 && !winner) {
      setCpuThinking(true);
      const delay = difficulty === "hard" ? 700 : 500;
      setTimeout(() => {
        const move = getCpuMove(grid, difficulty);
        if (move !== null) drop(move, 2);
        setCpuThinking(false);
      }, delay);
    }
  }, [player, winner]);

  useEffect(() => {
    if (winner !== null) {
      if (winner === 1) {
        setScore((s) => s + 100);
      } else if (winner === 0) {
        setScore((s) => s + 50);
      }

      // Auto next round (unless lost)
      if (winner !== 2) {
        setTimeout(() => nextRound(), 1500);
      }
    }
  }, [winner]);

  function nextRound() {
    if (winner === 2) {
      alert("Perdiste 😢 Juego terminado. Puntuación final: " + score);
      setGrid(emptyBoard());
      setScore(0);
      setRound(1);
      setWinner(null);
      setPlayer(1);
      return;
    }
    setGrid(emptyBoard());
    setWinner(null);
    setPlayer(1);
    setRound((r) => r + 1);
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Conecta 4 vs CPU 🤖</h1>
            <p className="text-slate-400 text-sm">
              Ronda {round} • Dificultad:{" "}
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "easy" | "medium" | "hard")
                }
                className="bg-[#0e1b26] border border-slate-700 rounded p-1 text-slate-100"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-sm">
              🏆 Puntuación: <span className="font-bold">{score}</span>
            </div>
            <button
              onClick={() => {
                setGrid(emptyBoard());
                setWinner(null);
                setPlayer(1);
                setRound(1);
                setScore(0);
              }}
              className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm"
            >
              Reiniciar
            </button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 inline-block">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 52px)`,
              gap: 6,
            }}
          >
            {grid.flat().map((cell, i) => {
              const c = i % COLS;
              const color =
                cell === 1
                  ? "#ffcc00"
                  : cell === 2
                  ? "#60a5fa"
                  : "#0b1220";
              return (
                <div
                  key={i}
                  onClick={() => (player === 1 ? drop(c) : null)}
                  style={{
                    width: 52,
                    height: 52,
                    background: color,
                    borderRadius: 9999,
                    cursor: player === 1 && !winner ? "pointer" : "default",
                    transition: "background 0.2s",
                  }}
                />
              );
            })}
          </div>
          {winner !== null && (
            <div className="mt-3 text-white text-center">
              {winner === 0
                ? "Empate 🤝"
                : winner === 1
                ? "¡Ganaste la ronda! 🎉"
                : "CPU gana 😔"}
            </div>
          )}
          {cpuThinking && (
            <div className="mt-3 text-slate-400 text-sm text-center animate-pulse">
              CPU pensando...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
