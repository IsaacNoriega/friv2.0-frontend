import { useState } from 'react'

const SOLUTION: number[][] = [
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

const PUZZLE: number[][] = [
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

function cloneGrid(g: number[][]){ return g.map(r=>r.slice()) }

function findConflicts(grid: number[][]){
  const conflicts = new Set<string>()
  // rows
  for (let r=0;r<9;r++){
    const seen = new Map<number, number[]>()
    for (let c=0;c<9;c++){
      const v = grid[r][c]
      if (!v) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push(c)
    }
  for (const [, cols] of seen) if (cols.length > 1) for (const c of cols) conflicts.add(`${r},${c}`)
  }
  // cols
  for (let c=0;c<9;c++){
    const seen = new Map<number, number[]>()
    for (let r=0;r<9;r++){
      const v = grid[r][c]
      if (!v) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push(r)
    }
  for (const [, rows] of seen) if (rows.length > 1) for (const r of rows) conflicts.add(`${r},${c}`)
  }
  // boxes
  for (let br=0;br<3;br++) for (let bc=0;bc<3;bc++){
    const seen = new Map<number, [number,number][]>()
    for (let r=0;r<3;r++) for (let c=0;c<3;c++){
      const rr = br*3 + r, cc = bc*3 + c
      const v = grid[rr][cc]
      if (!v) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push([rr,cc])
    }
  for (const [, coords] of seen) if (coords.length > 1) for (const [rr,cc] of coords) conflicts.add(`${rr},${cc}`)
  }
  return conflicts
}

export default function Sudoku(){
  const [grid, setGrid] = useState<number[][]>(()=> cloneGrid(PUZZLE))
  const [conflicts, setConflicts] = useState<Set<string>>(new Set())

  function onChange(r:number, c:number, v:string){
    const n = Number(v) || 0
    if (n < 0 || n > 9) return
    const g = cloneGrid(grid)
    g[r][c] = n
    setGrid(g)
  }

  function check(){
    const conf = findConflicts(grid)
    setConflicts(conf)
    if (conf.size === 0 && grid.flat().every(v=>v>0)) alert('¡Correcto! 🎉')
  }

  function solve(){ setGrid(cloneGrid(SOLUTION)); setConflicts(new Set()) }
  function restart(){ setGrid(cloneGrid(PUZZLE)); setConflicts(new Set()) }

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Sudoku</h1>
          <div className="flex items-center gap-3">
            <button onClick={check} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Check</button>
            <button onClick={solve} className="px-3 py-1 bg-[#10b981] rounded text-black text-sm">Solve</button>
            <button onClick={restart} className="px-3 py-1 bg-[#f97316] rounded text-black text-sm">Restart</button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 inline-block">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(9,40px)', gap:6 }}>
            {grid.flat().map((v, i) => {
              const r = Math.floor(i / 9), c = i % 9
              const fixed = PUZZLE[r][c] !== 0
              const key = `${r},${c}`
              const isConf = conflicts.has(key)
              return (
                <input
                  key={key}
                  value={v === 0 ? '' : String(v)}
                  onChange={(e) => onChange(r,c,e.target.value)}
                  disabled={fixed}
                  className={`w-10 h-10 text-center font-semibold rounded ${fixed ? 'bg-slate-700' : 'bg-[#071f2f]'} ${isConf ? 'ring-2 ring-red-500' : ''}`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

