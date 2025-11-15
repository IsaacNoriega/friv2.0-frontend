import React, { useEffect, useState } from "react";
import GameInstructions from "../../components/GameInstructions";
import { EndGameButton } from "../../components/EndGameButton";
import { useGameScore } from "../../hooks/useGameScore";
import { motion, AnimatePresence } from "framer-motion";

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
const CELL_SIZE = 36;
const GAP_SIZE = 6;

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
      bgClass = "bg-red-600";
    } else {
      bgClass = "bg-[#10232b]";
      if (cell.adj > 0) {
        content = cell.adj;
        textClass = getNumberColor(cell.adj);
      }
    }
  } else if (cell.flagged) {
    content = "🚩";
    bgClass = "bg-[#1a2b3a]";
  } else {
    bgClass = "bg-[#0b1220] hover:bg-[#1a2b3a]";
  }

  return (
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
            <div className="text-right">
              <div className="text-sm mb-1">
                🎯 Puntos: <span className="font-bold">{score}</span>
              </div>
              <div className="text-xs text-slate-400">
                Récord: <span className="font-bold">{bestScore ?? 0}</span>
              </div>
              {scoreError && (
                <div className="text-red-500 text-xs">{scoreError}</div>
              )}
            </div>
            <EndGameButton />
          </div>
        </header>

        {/* --- 🔴 MODIFICACIÓN EN INSTRUCCIONES --- */}
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

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-6 overflow-auto">
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
      </div>
    </main>
  );
}