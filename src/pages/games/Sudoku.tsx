import { useState, useEffect } from 'react'
import GameInstructions from '../../components/GameInstructions'

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
  ]
]

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
  ]
]

function cloneGrid(g: number[][]) {
  return g.map(r => r.slice())
}

function findConflicts(grid: number[][]) {
  const conflicts = new Set<string>()

  // rows
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

  // cols
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

  // boxes
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
  const [best, setBest] = useState<number>(Number(localStorage.getItem('sudoku-best') || '0'))
  const [level, setLevel] = useState(1)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (won && score > best) {
      setBest(score)
      localStorage.setItem('sudoku-best', String(score))
    }
  }, [won])

  function onChange(r: number, c: number, v: string) {
    const n = Number(v) || 0
    if (n < 0 || n > 9) return
    const g = cloneGrid(grid)
    g[r][c] = n
    setGrid(g)
  }

  function check() {
    const conf = findConflicts(grid)
    setConflicts(conf)
    const allFilled = grid.flat().every(v => v > 0)
    if (conf.size === 0 && allFilled) {
      setWon(true)
      setScore(prev => prev + 100)
    }
  }

  function solve() {
    setGrid(cloneGrid(SOLUTIONS[level - 1]))
    setConflicts(new Set())
  }

  function restart() {
    setGrid(cloneGrid(PUZZLES[0]))
    setConflicts(new Set())
    setScore(0)
    setWon(false)
    setStarted(false)
    setLevel(1)
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[#0b1120] flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-[#111c2e] rounded-2xl p-6 border border-slate-700 shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
          🧩 Sudoku
        </h1>

        <GameInstructions />

        <p className="mb-2">Nivel: {level}</p>
        <p className="mb-2">Puntaje: {score}</p>
        <p className="mb-4">Mejor: {best}</p>

        {!started && !won && (
          <button
            onClick={() => setStarted(true)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-black rounded-md font-semibold transition mb-4"
          >
            Iniciar Juego
          </button>
        )}

        {started && !won && (
          <>
            <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 inline-block mb-4">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9,40px)', gap: 6 }}>
                {grid.flat().map((v, i) => {
                  const r = Math.floor(i / 9)
                  const c = i % 9
                  const fixed = PUZZLES[level - 1][r][c] !== 0
                  const key = `${r},${c}`
                  const isConf = conflicts.has(key)
                  return (
                    <input
                      key={key}
                      value={v === 0 ? '' : String(v)}
                      onChange={e => onChange(r, c, e.target.value)}
                      disabled={fixed}
                      className={`w-10 h-10 text-center font-semibold rounded transition-all ${
                        fixed ? 'bg-slate-700' : 'bg-[#071f2f]'
                      } ${isConf ? 'ring-2 ring-red-500' : ''}`}
                    />
                  )
                })}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={check} className="px-4 py-2 bg-sky-500 text-black rounded-md font-semibold">
                Verificar
              </button>
              <button onClick={solve} className="px-4 py-2 bg-green-500 text-black rounded-md font-semibold">
                Resolver
              </button>
              <button onClick={restart} className="px-4 py-2 bg-orange-500 text-black rounded-md font-semibold">
                Reiniciar
              </button>
            </div>
          </>
        )}

        {won && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 ¡Ganaste!</h2>
            <p className="mb-4">Has completado el Sudoku correctamente.</p>
            <button
              onClick={restart}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-black rounded-md font-semibold transition"
            >
              Jugar de nuevo
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
