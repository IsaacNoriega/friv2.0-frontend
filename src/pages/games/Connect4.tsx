import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, CpuChipIcon, UserIcon } from '@heroicons/react/24/solid';
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
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());
  const { submitScore, error: scoreError, bestScore } = useGameScore('connect4');

  function drop(col: number, p = player) {
    if (winner || cpuThinking) return;
    const g = grid.map((r) => r.slice());
    for (let r = ROWS - 1; r >= 0; r--) {
      if (g[r][col] === 0) {
        g[r][col] = p;
        
        // Añadir animación de caída
        const cellKey = `${r}-${col}`;
        setAnimatingCells(prev => new Set(prev).add(cellKey));
        setTimeout(() => {
          setAnimatingCells(prev => {
            const next = new Set(prev);
            next.delete(cellKey);
            return next;
          });
        }, 600);
        
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
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">🔵</div>
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Conecta 4
          </h1>
          <p className="text-slate-400 mb-6">Compite contra la CPU y conecta 4 fichas en línea</p>
          <button
            onClick={() => setGameStarted(true)}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white text-lg font-black hover:from-blue-600 hover:to-indigo-700 transition-all shadow-2xl shadow-blue-500/30"
          >
            ▶ Empezar Juego
          </button>
        </motion.div>
      </main>
    );
  }

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
            <div className="text-5xl">🔵🔴</div>
            <h1 className="text-5xl font-black bg-linear-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
              Conecta 4
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-16">Conecta 4 fichas en línea antes que la CPU</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">
              
              {/* Round Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-sm text-slate-400">Ronda</span>
                </div>
                <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                  <span className="text-2xl font-black text-blue-300">{round}</span>
                </div>
              </div>

              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-blue-500/10 to-indigo-600/5 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-300">Puntos</span>
                  <FireIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-4xl font-black bg-linear-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  {score}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Récord: {bestScore ?? 0}
                </div>
                {scoreError && <div className="text-red-400 text-xs mt-1">{scoreError}</div>}
              </div>

              {/* Difficulty */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Dificultad</span>
                  <CpuChipIcon className="w-5 h-5 text-purple-400" />
                </div>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as "easy" | "medium" | "hard")
                  }
                  className="w-full bg-slate-700/60 border border-slate-600 rounded-lg p-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="easy">🟢 Fácil (+50)</option>
                  <option value="medium">🟡 Medio (+100)</option>
                  <option value="hard">🔴 Difícil (+150)</option>
                </select>
              </div>

              {/* Turn Indicator */}
              <div className="p-4 bg-linear-to-br from-cyan-500/10 to-blue-600/5 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-300">Turno actual</span>
                  {player === 1 ? (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-bold">Tu turno</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CpuChipIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300 font-bold">CPU {cpuThinking ? '...' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Winner Display */}
              <AnimatePresence>
                {winner !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-lg border ${
                      winner === 1 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : winner === 2
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {winner === 1 ? '🎉' : winner === 2 ? '🤖' : '🤝'}
                      </span>
                      <span className={`text-lg font-bold ${
                        winner === 1 
                          ? 'text-green-400' 
                          : winner === 2
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}>
                        {winner === 1 ? '¡Ganaste!' : winner === 2 ? 'CPU gana' : 'Empate'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setGrid(emptyBoard());
                    setWinner(null);
                    setPlayer(1);
                    setRound(1);
                    setScore(0);
                    setGameStarted(false);
                  }}
                  className="flex-1 py-3 rounded-lg bg-linear-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  🔄 Reiniciar
                </button>
              </div>

              {/* Action Button */}
              <EndGameButton onEnd={() => submitScore(score)} />
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
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${COLS}, 60px)`,
                  gap: 8,
                }}
                className="p-6 bg-blue-900/20 rounded-2xl border-4 border-blue-600/30 shadow-2xl shadow-blue-500/20"
              >
                {grid.flat().map((cell, i) => {
                  const r = Math.floor(i / COLS);
                  const c = i % COLS;
                  const isYellow = cell === 1;
                  const isBlue = cell === 2;
                  const isEmpty = cell === 0;
                  const cellKey = `${r}-${c}`;
                  const isAnimating = animatingCells.has(cellKey);

                  return (
                    <motion.div
                      key={i}
                      onClick={() => (player === 1 && !winner ? drop(c) : null)}
                      whileHover={player === 1 && !winner && isEmpty ? { scale: 1.1 } : {}}
                      whileTap={player === 1 && !winner && isEmpty ? { scale: 0.95 } : {}}
                      initial={!isEmpty && isAnimating ? { y: -400, opacity: 0 } : undefined}
                      animate={!isEmpty && isAnimating ? { 
                        y: 0, 
                        opacity: 1,
                        transition: {
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          mass: 0.8
                        }
                      } : !isEmpty ? { scale: 1 } : undefined}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 9999,
                        cursor: player === 1 && !winner && isEmpty ? "pointer" : "default",
                      }}
                      className={`
                        ${
                          isYellow
                            ? 'bg-linear-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/50'
                            : isBlue
                            ? 'bg-linear-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800/60 border-2 border-slate-700/40'
                        }
                      `}
                    />
                  );
                })}
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
            title="Cómo Jugar Conecta 4"
            description="Conecta 4 fichas de tu color en línea (horizontal, vertical o diagonal) antes que tu oponente. Las fichas caen por gravedad hasta la posición más baja disponible en cada columna. ¡Piensa estratégicamente para bloquear a tu rival!"
            controls={[
              { key: 'Clic', action: 'Soltar ficha en columna' }
            ]}
            note="Controla el centro del tablero para tener más opciones de conexión. Siempre busca crear amenazas dobles."
          />
        </motion.div>

      </div>
    </main>
  );
}
