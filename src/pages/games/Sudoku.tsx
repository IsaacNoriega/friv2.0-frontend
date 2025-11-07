import { useState, useEffect } from 'react'
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

// ✅ Lista de puzzles por ronda (PUEDES AGREGAR MÁS)
const PUZZLES: number[][][] = [
  [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,3,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ],
  // 👉 RONDA 2 (ejemplo, puedes editarlo)
  [
    [0,0,4,0,0,0,1,0,0],
    [0,0,0,4,1,0,0,0,0],
    [9,0,0,0,0,0,0,6,0],
    [0,7,0,0,6,0,0,0,3],
    [0,0,0,0,0,3,0,0,8],
    [5,0,0,0,0,0,0,0,0],
    [0,9,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,7],
    [0,0,6,3,0,0,0,5,0]
  ],
]

// ✅ Soluciones correspondientes a los puzzles
const SOLUTIONS: number[][][] = [
  [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ],

  // 👉 SOLUCIÓN DE RONDA 2 (ejemplo)
  [
    [3,6,4,2,9,8,1,7,5],
    [8,5,9,4,1,6,3,2,0],
    [9,1,7,5,3,0,8,6,4],
    [2,7,8,1,6,5,9,4,3],
    [6,4,1,9,2,3,5,0,8],
    [5,3,0,8,0,7,6,1,2],
    [7,9,3,6,5,1,4,8,0],
    [4,8,2,0,1,9,0,3,7],
    [1,0,6,3,8,2,7,5,9]
  ],
]

// ----- utils -----
function cloneGrid(g: number[][]) {
  return g.map(r => r.slice())
}

function findConflicts(grid: number[][]) {
  const conflicts = new Set<string>()

  // filas
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>()
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c]
      if (!v) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push(c)
    }
    for (const [, cols] of seen)
      if (cols.length > 1)
        for (const c of cols) conflicts.add(`${r},${c}`)
  }

  // columnas
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>()
    for (let r = 0; r < 9; r++) {
      const v = grid[r][c]
      if (!v) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push(r)
    }
    for (const [, rows] of seen)
      if (rows.length > 1)
        for (const r of rows) conflicts.add(`${r},${c}`)
  }

  // cajas
  for (let br = 0; br < 3; br++)
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Map<number, [number, number][]>()
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
          const rr = br * 3 + r,
            cc = bc * 3 + c
          const v = grid[rr][cc]
          if (!v) continue
          if (!seen.has(v)) seen.set(v, [])
          seen.get(v)!.push([rr, cc])
        }
      for (const [, coords] of seen)
        if (coords.length > 1)
          for (const [rr, cc] of coords) conflicts.add(`${rr},${cc}`)
    }

  return conflicts
}

export default function Sudoku() {
  const [grid, setGrid] = useState<number[][]>(() => cloneGrid(PUZZLES[0]))
  const [conflicts, setConflicts] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)
  const { submitScore, error: scoreError, bestScore } = useGameScore('sudoku')

  // ✅ Cambios en el grid
  function onChange(r: number, c: number, v: string) {
    const n = Number(v) || 0
    if (n < 0 || n > 9) return
    const g = cloneGrid(grid)
    g[r][c] = n
    setGrid(g)
  }

  // ✅ Revisar sudoku
  function check() {
    const conf = findConflicts(grid)
    setConflicts(conf)

    const allFilled = grid.flat().every(v => v > 0)

    if (conf.size === 0 && allFilled) {
      setWon(true)

      const bonus = level * 100
      setScore(prev => prev + bonus)

      // si es récord, guardar
      if (score + bonus > (bestScore || 0)) {
        submitScore(score + bonus).catch(console.error)
      }

      // esperar y pasar de ronda
      setTimeout(nextRound, 1200)
    }
  }

  // ✅ Pasar al siguiente puzzle
  function nextRound() {
    if (level >= PUZZLES.length) {
      alert("🎉 Completaste todos los niveles!")
      return restart()
    }

    const next = level + 1
    setLevel(next)
    setGrid(cloneGrid(PUZZLES[next - 1]))
    setConflicts(new Set())
    setWon(false)
  }

  function solve() {
    setGrid(cloneGrid(SOLUTIONS[level - 1]))
    setConflicts(new Set())
  }

  function restart() {
    setLevel(1)
    setGrid(cloneGrid(PUZZLES[0]))
    setConflicts(new Set())
    setScore(0)
    setWon(false)
    setStarted(false)
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[#0b1120] flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-[#111c2e] rounded-2xl p-6 border border-slate-700 shadow-lg text-center">

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">🧩 Sudoku por rondas</h1>
          <EndGameButton />
        </div>

        <GameInstructions />

        <div className="flex justify-center gap-6 mb-4">
          <p className="text-xl">Ronda: <b>{level}</b></p>
          <p className="text-xl">Puntos: <b>{score}</b></p>
          <p className="text-xl">Récord: <b>{bestScore ?? 0}</b></p>
        </div>

        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="px-6 py-2 bg-blue-500 rounded font-semibold"
          >
            Iniciar juego
          </button>
        )}

        {started && (
          <>
            <div className="bg-[#0e1b26] rounded-xl p-4 inline-block mb-4">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 48px)" }}>
                {grid.flat().map((v, i) => {
                  const r = Math.floor(i / 9)
                  const c = i % 9
                  const isConf = conflicts.has(`${r},${c}`)
                  const fixed = PUZZLES[level - 1][r][c] !== 0

                  return (
                    <input
                      key={`${r},${c}`}
                      value={v === 0 ? "" : String(v)}
                      onChange={(e) => onChange(r, c, e.target.value)}
                      disabled={fixed}
                      className={`w-12 h-12 text-center text-lg font-bold rounded
                        ${fixed ? "bg-slate-700" : "bg-[#071f2f]"}
                        ${isConf ? "ring-2 ring-red-500" : ""}
                      `}
                    />
                  )
                })}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={check} className="px-4 py-2 bg-sky-500 rounded font-semibold">Verificar</button>
              <button onClick={solve} className="px-4 py-2 bg-green-500 rounded font-semibold">Resolver</button>
              <button onClick={restart} className="px-4 py-2 bg-orange-500 rounded font-semibold">Reiniciar</button>
            </div>
          </>
        )}

        {scoreError && <p className="text-red-500 text-sm mt-2">{scoreError}</p>}

      </div>
    </main>
  )
}
