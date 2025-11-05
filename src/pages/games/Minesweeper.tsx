import React, { useEffect, useState } from "react";

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adj: number;
};

function makeBoard(rows: number, cols: number, mines: number) {
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adj: 0,
    }))
  );

  // Colocar minas
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // Calcular adyacentes
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
    const b = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = b[r][c];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    setBoard(b);
  }

  // ---- Pantalla de inicio ----
  if (!started) {
    return (
      <main className="p-6 min-h-screen bg-[linear-gradient(180deg,#0a1120_0%,#071726_100%)] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">💣 Buscaminas por Rondas</h1>
        <p className="text-slate-400 mb-6">Supera rondas con más minas y gana puntos.</p>
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
        <p className="mb-4 text-slate-300">Perdiste en la ronda {round}. Puntaje: {score}</p>
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
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Buscaminas — Ronda {round}</h1>
            <p className="text-slate-400 text-sm">Haz clic para revelar, clic derecho para marcar bandera.</p>
          </div>
          <div className="text-sm text-slate-300">
            Puntos: <span className="font-semibold text-white">{score}</span>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 overflow-auto">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 32px)`,
              gap: 6,
            }}
          >
            {board.flat().map((cell, i) => {
              const r = Math.floor(i / cols),
                c = i % cols;
              let content = null;
              let bg = "#0b1220";

              if (cell.revealed) {
                bg = cell.mine ? "#ef4444" : "#10232b";
                content = cell.mine ? "💣" : cell.adj > 0 ? cell.adj : "";
              } else if (cell.flagged) {
                content = "🚩";
                bg = "#1a2b3a";
              }

              return (
                <button
                  key={i}
                  onClick={() => reveal(r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  className="flex items-center justify-center font-semibold text-lg rounded hover:scale-110 transition-transform duration-150"
                  style={{
                    width: 32,
                    height: 32,
                    background: bg,
                    color: cell.revealed ? "#fff" : "#cbd5e1",
                    borderRadius: 6,
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
