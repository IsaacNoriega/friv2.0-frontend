import React, { useEffect, useState } from "react";
import GameInstructions from "../../components/GameInstructions";
import { EndGameButton } from "../../components/EndGameButton";
import { useGameScore } from "../../hooks/useGameScore";
import { motion, AnimatePresence } from "framer-motion";
import { TrophyIcon, FireIcon, FlagIcon, ClockIcon } from '@heroicons/react/24/solid';

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adj: number;
};

// --- Lógica del juego ---
function makeBoard(rows: number, cols: number, mines: number) {
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adj: 0,
    }))
  );

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  const dirs = [-1, 0, 1];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) {
        board[r][c].adj = -1;
        continue;
      }
      let count = 0;
      for (const dr of dirs)
        for (const dc of dirs) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr,
            nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            board[nr][nc].mine
          )
            count++;
        }
      board[r][c].adj = count;
    }

  return board;
}

// Esta función muta el tablero que se le pasa
function floodReveal(board: Cell[][], r: number, c: number) {
  const rows = board.length,
    cols = board[0].length;
  const stack = [[r, c]] as [number, number][];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;

    // Comprobar límites (aunque la llamada inicial debe ser válida)
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;

    const cell = board[cr][cc];
    // No revelar si ya está revelada o tiene bandera
    if (cell.revealed || cell.flagged) continue;

    cell.revealed = true;

    // Si es un '0', expandir a los vecinos
    if (cell.adj === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue; // No incluirse a sí mismo
          const nr = cr + dr,
            nc = cc + dc;

          // Solo añadir a la pila si está dentro de los límites
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            stack.push([nr, nc]);
          }
        }
    }
  }
}

// --- UI helpers ---
const CELL_SIZE = 40;
const GAP_SIZE = 4;

function getNumberColor(num: number): string {
  switch (num) {
    case 1: return "text-blue-400";
    case 2: return "text-green-400";
    case 3: return "text-red-500";
    case 4: return "text-blue-700";
    case 5: return "text-red-800";
    case 6: return "text-teal-500";
    case 7: return "text-black";
    case 8: return "text-gray-500";
    default: return "text-white";
  }
}

interface CellComponentProps {
  cell: Cell;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const CellComponent = ({ cell, onClick, onContextMenu }: CellComponentProps) => {
  let content: string | number | null = null;
  let bgClass = "";
  let textClass = "text-white";

  if (cell.revealed) {
    if (cell.mine) {
      content = "💣";
      bgClass = "bg-red-600/90 shadow-lg shadow-red-500/50";
    } else {
      bgClass = "bg-slate-800/60 border border-slate-700/30";
      if (cell.adj > 0) {
        content = cell.adj;
        textClass = getNumberColor(cell.adj);
      }
    }
  } else if (cell.flagged) {
    content = "🚩";
    bgClass = "bg-violet-500/30 border border-violet-500/50";
  } else {
    bgClass = "bg-slate-700/40 hover:bg-violet-500/20 border border-slate-600/50 hover:border-violet-500/60";
  } return (
    <motion.button
      key={`${cell.revealed}-${cell.flagged}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.9 }}
      className={`flex items-center justify-center font-bold text-lg rounded-lg transition-colors duration-150 ${bgClass} ${textClass}`}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
      }}
    >
      <AnimatePresence>
        {content !== null && (
          <motion.span
            key={content}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const MemoCell = React.memo(CellComponent);

export default function MinesweeperRondas() {
  const [round, setRound] = useState(1);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [lost, setLost] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const { submitScore, error: scoreError, bestScore } = useGameScore("minesweeper");

  const [rows, cols, mines] = (() => {
    const base = 6 + round;
    const m = Math.floor((base * base) / 6);
    return [base, base, m];
  })();

  useEffect(() => {
    if (started) reset();
  }, [round]);

  // Detecta victoria
  useEffect(() => {
    if (!started || lost || won) return;
    const total = rows * cols;
    const revealed = board.flat().filter((c) => c.revealed).length;
    const minesCount = board.flat().filter((c) => c.mine).length;

    if (revealed + minesCount === total) {
      setWon(true);
    }
  }, [board, lost, started, rows, cols, won]);

  // Suma score cuando 'won' cambia a true
  useEffect(() => {
    if (!won) return;
    setScore((prevScore) => {
      const newScore = prevScore + (100 * round);
      if (newScore > (bestScore || 0)) {
        submitScore(newScore).catch(console.error);
      }
      return newScore;
    });
  }, [won]);

  function reset() {
    setBoard(makeBoard(rows, cols, mines));
    setLost(false);
    setWon(false);
  }

  // --- 🔴 MODIFICACIÓN PRINCIPAL AQUÍ 🔴 ---
  function reveal(r: number, c: number) {
    if (lost || won) return;
    const b = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = b[r][c];

    if (cell.flagged) return;

    // --- LÓGICA DE "COMPLETAR" (CHORD) ---
    if (cell.revealed && cell.adj > 0) {
      let flaggedNeighbors = 0;
      const neighborsToClear: [number, number][] = [];
      const dirs = [-1, 0, 1];

      for (const dr of dirs) {
        for (const dc of dirs) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;

          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = b[nr][nc];
            if (neighbor.flagged) {
              flaggedNeighbors++;
            } else if (!neighbor.revealed) {
              neighborsToClear.push([nr, nc]);
            }
          }
        }
      }

      // Si las banderas coinciden con el número, revela los vecinos
      if (flaggedNeighbors === cell.adj) {
        for (const [nr, nc] of neighborsToClear) {
          const neighborCell = b[nr][nc];

          // ¡Peligro! El usuario se equivocó al marcar banderas
          if (neighborCell.mine) {
            neighborCell.revealed = true;
            setBoard(b); // Muestra la mina explotada
            setLost(true);
            return;
          }

          // Es seguro revelar. Usamos floodReveal para manejar
          // automáticamente la expansión si es un '0'.
          floodReveal(b, nr, nc);
        }
        setBoard(b); // Actualiza el tablero con las celdas reveladas
      }
      return; // Termina la función, ya sea que se haya completado o no.
    }
    // --- FIN DE LA LÓGICA DE "COMPLETAR" ---

    // --- Lógica Original: Clic en celda no revelada ---
    if (cell.revealed) return; // Si no fue un "chord", no hacer nada

    if (cell.mine) {
      cell.revealed = true;
      setBoard(b);
      setLost(true);
      return;
    }

    floodReveal(b, r, c); // Revela la celda (r,c) y expande si es 0
    setBoard(b);
  }

  function toggleFlag(e: React.MouseEvent, r: number, c: number) {
    e.preventDefault();
    if (lost || won) return;
    setBoard((currentBoard) => {
      const b = currentBoard.map((row) => row.map((cell) => ({ ...cell })));
      const cell = b[r][c];
      if (cell.revealed) return currentBoard;
      cell.flagged = !cell.flagged;
      return b;
    });
  }

  // ---- Pantalla de inicio ----
  if (!started) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">💣</div>
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
            Buscaminas Arcade
          </h1>
          <p className="text-slate-400 mb-6">Supera rondas con más minas y gana puntos</p>
          <button
            onClick={() => {
              setStarted(true);
              reset();
            }}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-violet-500 to-purple-600 text-white text-lg font-black hover:from-violet-600 hover:to-purple-700 transition-all shadow-2xl shadow-violet-500/30"
          >
            ▶ Empezar Juego
          </button>
        </motion.div>
      </main>
    );
  }  // ---- Pantalla de victoria ----
  if (won) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-4xl font-black mb-3 bg-linear-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
            ¡Ronda {round} Superada!
          </h2>
          <p className="text-slate-300 mb-6">Puntaje total: <span className="text-2xl font-bold text-violet-400">{score}</span></p>
          <button
            onClick={() => setRound((r) => r + 1)}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-violet-500 to-purple-600 text-white text-lg font-black hover:from-violet-600 hover:to-purple-700 transition-all shadow-2xl shadow-violet-500/30"
          >
            ➜ Siguiente Ronda
          </button>
        </motion.div>
      </main>
    );
  }  // ---- Pantalla de derrota ----
  if (lost) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#1a0505] via-[#0f0303] to-[#050d1a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-red-500/30 max-w-md"
        >
          <div className="text-7xl mb-4">💥</div>
          <h2 className="text-4xl font-black mb-3 bg-linear-to-r from-red-400 to-orange-300 bg-clip-text text-transparent">
            ¡Explosión!
          </h2>
          <p className="text-slate-300 mb-2">Perdiste en la ronda <span className="font-bold text-white">{round}</span></p>
          <p className="text-slate-400 mb-6">Puntaje: <span className="text-2xl font-bold text-red-400">{score}</span></p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                reset();
              }}
              className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-black hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={() => {
                setStarted(false);
                setRound(1);
                setScore(0);
              }}
              className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-violet-500 to-purple-600 text-white font-black hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg"
            >
              ↻ Reiniciar
            </button>
          </div>
        </motion.div>
      </main>
    );
  }  // ---- Juego activo ----
  const flaggedCount = board.flat().filter(c => c.flagged).length;

  return (
    <main className="min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.h1
          className="text-4xl md:text-5xl font-black text-center mb-8 bg-linear-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          💣 Buscaminas
        </motion.h1>

        {/* Main Game Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LEFT: Stats Panel */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Round */}
                <div className="p-4 bg-linear-to-br from-violet-500/10 to-purple-600/5 rounded-lg border border-violet-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-violet-300">Ronda</span>
                    <TrophyIcon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="text-3xl font-black bg-linear-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                    {round}
                  </div>
                </div>

                {/* Score */}
                <div className="p-4 bg-linear-to-br from-amber-500/10 to-orange-600/5 rounded-lg border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-300">Puntos</span>
                    <FireIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black bg-linear-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                    {score}
                  </div>
                </div>

                {/* Grid Size */}
                <div className="p-4 bg-linear-to-br from-cyan-500/10 to-blue-600/5 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-300">Tamaño</span>
                    <ClockIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black bg-linear-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    {rows}×{cols}
                  </div>
                </div>

                {/* Mines */}
                <div className="p-4 bg-linear-to-br from-red-500/10 to-rose-600/5 rounded-lg border border-red-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-red-300">Minas</span>
                    <span className="text-xl">💣</span>
                  </div>
                  <div className="text-3xl font-black bg-linear-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
                    {mines}
                  </div>
                </div>
              </div>

              {/* Flags Count */}
              <div className="p-4 bg-linear-to-br from-emerald-500/10 to-green-600/5 rounded-lg border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-emerald-300">Banderas</span>
                  <FlagIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-black bg-linear-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                  {flaggedCount} / {mines}
                </div>
              </div>

              {/* Best Score */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Récord Personal</span>
                  <div className="text-xl font-bold bg-linear-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                    {bestScore ?? 0}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {scoreError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{scoreError}</p>
                </div>
              )}

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
                  gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
                  gap: GAP_SIZE,
                  justifyContent: "center",
                }}
              >
                {board.flat().map((cell, i) => {
                  const r = Math.floor(i / cols);
                  const c = i % cols;
                  return (
                    <MemoCell
                      key={i}
                      cell={cell}
                      onClick={() => reveal(r, c)}
                      onContextMenu={(e) => toggleFlag(e, r, c)}
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
            title="Cómo Jugar Buscaminas"
            description="Descubre todas las casillas que no tienen minas. Los números indican cuántas minas hay en las casillas adyacentes. Usa esta información para deducir dónde están las minas y márcalas con banderas."
            controls={[
              { key: 'Clic Izq.', action: 'Revelar casilla' },
              { key: 'Clic Der.', action: 'Marcar bandera' },
              { key: 'Clic Izq. (en N°)', action: 'Completar vecinos' }
            ]}
            note="Si haces clic en un número que ya tiene el mismo número de banderas alrededor, se revelarán automáticamente las casillas seguras restantes. ¡Cuidado! Si tus banderas son incorrectas, perderás."
          />
        </motion.div>

      </div>
    </main>
  );
}