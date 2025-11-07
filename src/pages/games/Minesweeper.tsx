import React, { useEffect, useState } from "react";
import GameInstructions from "../../components/GameInstructions";
import { EndGameButton } from "../../components/EndGameButton";
// 1. Importa motion y AnimatePresence
import { motion, AnimatePresence } from "framer-motion";

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adj: number;
};

// --- Lógica del juego (sin cambios) ---
function makeBoard(rows: number, cols: number, mines: number) {
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adj: 0,
    })),
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

function floodReveal(board: Cell[][], r: number, c: number) {
  const rows = board.length,
    cols = board[0].length;
  const stack = [[r, c]] as [number, number][];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = board[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adj === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cr + dr,
            nc = cc + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            !board[nr][nc].revealed
          )
            stack.push([nr, nc]);
        }
    }
  }
}
// --- Fin de la lógica del juego ---

// 2. Constantes para el tamaño del tablero
const CELL_SIZE = 36; // px - ¡Más grande!
const GAP_SIZE = 6; // px

// 3. Helper para los colores de los números
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

// 4. Componente de Celda individual (con animaciones y memo)
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
      bgClass = "bg-red-600";
    } else {
      bgClass = "bg-[#10232b]"; // Revelada
      if (cell.adj > 0) {
        content = cell.adj;
        textClass = getNumberColor(cell.adj);
      }
    }
  } else if (cell.flagged) {
    content = "🚩";
    bgClass = "bg-[#1a2b3a]"; // Con bandera
  } else {
    bgClass = "bg-[#0b1220] hover:bg-[#1a2b3a]"; // Oculta
  }

  return (
    <motion.button
      key={`${cell.revealed}-${cell.flagged}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      // Animaciones de hover y tap
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.9 }}
      // Estilos con Tailwind y tamaño de celda
      className={`flex items-center justify-center font-bold text-lg rounded-lg transition-colors duration-150 ${bgClass} ${textClass}`}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
      }}
    >
      {/* AnimatePresence permite animar la entrada/salida del contenido */}
      <AnimatePresence>
        {content !== null && (
          <motion.span
            // Usamos el contenido como "key" para que sepa cuándo cambiar
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

// 5. Usamos React.memo para optimizar.
// Solo se re-renderiza la celda si sus props (cell, onClick) cambian.
const MemoCell = React.memo(CellComponent);

// 6. Componente principal del juego
export default function MinesweeperRondas() {
  const [round, setRound] = useState(1);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [lost, setLost] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);

  const [rows, cols, mines] = (() => {
    const base = 6 + round;
    const m = Math.floor((base * base) / 6);
    return [base, base, m];
  })();

  useEffect(() => {
    if (started) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    if (!started) return;
    const total = rows * cols;
    const revealed = board.flat().filter((c) => c.revealed).length;
    const minesCount = board.flat().filter((c) => c.mine).length;
    if (!lost && revealed + minesCount === total) {
      setWon(true);
      setScore((s) => s + 100);
    }
  }, [board, lost, started, rows, cols]);

  function reset() {
    setBoard(makeBoard(rows, cols, mines));
    setLost(false);
    setWon(false);
  }

  function reveal(r: number, c: number) {
    if (lost || won) return;
    const b = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = b[r][c];
    if (cell.flagged || cell.revealed) return;
    if (cell.mine) {
      cell.revealed = true;
      setBoard(b);
      setLost(true);
      setScore((s) => Math.max(0, s - 50));
      return;
    }
    floodReveal(b, r, c);
    setBoard(b);
  }

function toggleFlag(e: React.MouseEvent, r: number, c: number) {
  e.preventDefault();
  if (lost || won) return;
  // Usamos un "updater function" para garantizar el estado más reciente
  setBoard((currentBoard) => {
    const b = currentBoard.map((row) => row.map((cell) => ({ ...cell })));
    const cell = b[r][c];
    if (cell.revealed) return currentBoard; // No hacer nada si ya está revelada
    cell.flagged = !cell.flagged;
    return b;
  });
}


  // ---- Pantalla de inicio ----
  if (!started) {
    return (
      <main className="p-6 min-h-screen bg-[linear-gradient(180deg,#0a1120_0%,#071726_100%)] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">💣 Buscaminas por Rondas</h1>
        <p className="text-slate-400 mb-6">
          Supera rondas con más minas y gana puntos.
        </p>
        <button
          onClick={() => {
            setStarted(true);
            reset();
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] font-semibold text-white"
        >
          Empezar
        </button>
      </main>
    );
  }

  // ---- Pantalla de victoria ----
  if (won) {
    return (
      <main className="p-6 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)] flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-bold mb-3">🎉 ¡Ronda {round} superada!</h2>
        <p className="mb-4 text-slate-300">Puntaje total: {score}</p>
        <button
          onClick={() => setRound((r) => r + 1)}
          className="px-5 py-2 bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] rounded-lg font-semibold"
        >
          Siguiente ronda
        </button>
      </main>
    );
  }

  // ---- Pantalla de derrota ----
  if (lost) {
    return (
      <main className="p-6 min-h-screen bg-[linear-gradient(180deg,#240b0b_0%,#180808_100%)] flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-bold mb-3">💥 ¡Explosión!</h2>
        <p className="mb-4 text-slate-300">
          Perdiste en la ronda {round}. Puntaje: {score}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              reset();
            }}
            className="px-5 py-2 bg-[#0ea5e9] rounded-lg text-black font-semibold"
          >
            Reintentar
          </button>
          <button
            onClick={() => {
              setStarted(false);
              setRound(1);
              setScore(0);
            }}
            className="px-5 py-2 bg-[#9333ea] rounded-lg font-semibold"
          >
            Reiniciar juego
          </button>
        </div>
      </main>
    );
  }

  // ---- Juego activo ----
  return (
    <main className="p-6 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)] text-white">
      {/* 7. Contenedor más grande */}
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Buscaminas — Ronda {round}
            </h1>
            <p className="text-slate-400 text-sm">
              Haz clic para revelar, clic derecho para marcar bandera.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              Puntos: <span className="font-semibold text-white">{score}</span>
            </div>
            <EndGameButton />
          </div>
        </header>

        <GameInstructions />

        {/* 8. Tablero con padding y estilos actualizados */}
        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-6 overflow-auto">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
              gap: GAP_SIZE,
              // Centramos el grid si no ocupa todo el ancho
              justifyContent: "center",
            }}
          >
            {/* 9. Usamos el nuevo MemoCell */}
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
      </div>
    </main>
  );
}