import { useState, useEffect, useCallback } from "react";
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

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
      const r = lastR + dr * k, c = lastC + dc * k;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || grid[r][c] !== player)
        break;
      count++;
    }
    for (let k = 1; k < 4; k++) {
      const r = lastR - dr * k, c = lastC - dc * k;
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

function getCpuMove(grid: number[][], difficulty: "easy" | "medium" | "hard") {
  const validMoves = getValidMoves(grid);
  if (validMoves.length === 0) return null;

  if (difficulty === "easy") {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

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

  if (difficulty === "hard") {
    const center = 3;
    const centerMove = validMoves.includes(center) ? center : null;
    if (centerMove && Math.random() < 0.6) return centerMove;
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

export default function Connect4() {
  const [grid, setGrid] = useState<number[][]>(() => emptyBoard());
  const [player, setPlayer] = useState(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [cpuThinking, setCpuThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // pre-pantalla
  const { submitScore, error: scoreError, bestScore } = useGameScore('connect4');

  function drop(col: number, p = player) {
    if (winner || cpuThinking) return;
    const g = grid.map((r) => r.slice());
    for (let r = ROWS - 1; r >= 0; r--) {
      if (g[r][col] === 0) {
        g[r][col] = p;
        setGrid(g);
        if (checkWin(g, r, col)) setWinner(p);
        else if (g.every((row) => row.every((c) => c !== 0))) setWinner(0); // empate
        else setPlayer(p === 1 ? 2 : 1);
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

  const nextRound = useCallback(() => {
    setGrid(emptyBoard());
    setWinner(null);
    setPlayer(1);
    setRound((r) => r + 1);
  }, []);

  useEffect(() => {
    if (winner === null) return;

    let points = 0;
    if (winner === 1) points = difficulty === 'hard' ? 150 : difficulty === 'medium' ? 100 : 50;
    else if (winner === 0) points = difficulty === 'hard' ? 75 : difficulty === 'medium' ? 50 : 25;

    if (winner === 1 || winner === 0) {
      setScore(prev => {
        const newScore = prev + points;
        if (newScore > (bestScore || 0)) submitScore(newScore).catch(console.error);
        return newScore;
      });

      const timeout = setTimeout(() => nextRound(), 1500);
      return () => clearTimeout(timeout);
    } else if (winner === 2) {
      if (score > (bestScore || 0)) submitScore(score).catch(console.error);
    }
  }, [winner]);

  if (!gameStarted) {
    return (
      <main className="p-6 text-slate-100 min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
        <h1 className="text-4xl font-bold mb-4">Conecta 4 vs CPU 🤖</h1>
        <p className="text-slate-400 mb-6 text-center max-w-md">
          Selecciona la dificultad y compite contra la CPU. Cada victoria suma puntos y aumenta tu récord.
        </p>
        <button
          onClick={() => setGameStarted(true)}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold hover:scale-105 transition"
        >
          Empezar Juego
        </button>
      </main>
    );
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
            <EndGameButton />
            <div className="text-right">
              <div className="text-sm mb-1">
                🏆 Puntuación: <span className="font-bold">{score}</span>
              </div>
              <div className="text-xs text-slate-400">
                Récord: <span className="font-bold">{bestScore ?? 0}</span>
              </div>
              {scoreError && <div className="text-red-500 text-xs">{scoreError}</div>}
            </div>
            <button
              onClick={() => {
                setGrid(emptyBoard());
                setWinner(null);
                setPlayer(1);
                setRound(1);
                setScore(0);
                setGameStarted(false);
              }}
              className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm"
            >
              Reiniciar
            </button>
          </div>
        </header>

        <GameInstructions 
          title="Cómo Jugar Conecta 4"
          description="Conecta 4 fichas de tu color en línea (horizontal, vertical o diagonal) antes que tu oponente. Las fichas caen por gravedad hasta la posición más baja disponible en cada columna. ¡Piensa estratégicamente para bloquear a tu rival!"
          controls={[
            { key: 'Clic', action: 'Soltar ficha en columna' }
          ]}
          note="Controla el centro del tablero para tener más opciones de conexión. Siempre busca crear amenazas dobles."
        />

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
                cell === 1 ? "#ffcc00" : cell === 2 ? "#60a5fa" : "#0b1220";
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
