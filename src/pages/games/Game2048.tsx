import React, { useEffect, useState, useCallback } from 'react'

type Tile = number | null

const SIZE = 4

function emptyGrid(): Tile[][]{
  return Array.from({length: SIZE}, () => Array.from({length: SIZE}, () => null))
}

function randSpot(grid: Tile[][]){
  const empties: [number,number][] = []
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (!grid[r][c]) empties.push([r,c])
  if (!empties.length) return null
  return empties[Math.floor(Math.random()*empties.length)]
}

function spawnTile(grid: Tile[][]){
  const spot = randSpot(grid)
  if (!spot) return grid
  const [r,c] = spot
  const copy = grid.map(row => row.slice())
  copy[r][c] = Math.random() < 0.9 ? 2 : 4
  return copy
}

function rotate(grid: Tile[][]){ // transpose
  const out = emptyGrid()
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) out[r][c] = grid[c][r]
  return out
}

function moveLeft(grid: Tile[][]){
  let moved = false
  let scoreGain = 0
  const out = grid.map(row => {
    const vals = row.filter(Boolean) as number[]
    for (let i=0;i<vals.length-1;i++){
      if (vals[i] === vals[i+1]){ vals[i] = vals[i]*2; scoreGain += vals[i]; vals.splice(i+1,1) }
    }
    while (vals.length < SIZE) vals.push(null as unknown as number)
    const rowOut = vals.map(v => v===null ? null : v)
    if (rowOut.some((v,i)=> v !== row[i])) moved = true
    return rowOut
  })
  return { grid: out, moved, scoreGain }
}

export default function Game2048(){
  const [grid, setGrid] = useState<Tile[][]>(()=>{
    let g = emptyGrid()
    g = spawnTile(g)
    g = spawnTile(g)
    return g
  })
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)

  const handleMove = useCallback((key: string)=>{
    let g = grid.map(r=>r.slice())
    let result: {grid: Tile[][], moved: boolean, scoreGain?: number}
    if (key === 'ArrowLeft'){
      result = moveLeft(g)
    } else if (key === 'ArrowRight'){
      // reverse rows
      g = g.map(row => row.slice().reverse())
      result = moveLeft(g)
      result.grid = result.grid.map(row => row.slice().reverse())
    } else if (key === 'ArrowUp'){
      // transpose, move left, transpose back
      g = rotate(g)
      result = moveLeft(g)
      result.grid = rotate(result.grid)
    } else { // down
      g = rotate(g).map(row => row.slice().reverse())
      result = moveLeft(g)
      result.grid = rotate(result.grid.map(row => row.slice().reverse()))
    }
    if (result.moved){
      const withSpawn = spawnTile(result.grid)
      setGrid(withSpawn)
      setScore(s => s + (result.scoreGain ?? 0))
      // check game over
      const canMove = hasMoves(withSpawn)
      if (!canMove) setOver(true)
    }
  },[grid])

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if (over) return
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        e.preventDefault()
        handleMove(e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[handleMove, over])

  function hasMoves(g: Tile[][]){
    // empty exists
    for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (!g[r][c]) return true
    // merges exist
    for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE-1;c++) if (g[r][c] === g[r][c+1]) return true
    for (let c=0;c<SIZE;c++) for (let r=0;r<SIZE-1;r++) if (g[r][c] === g[r+1][c]) return true
    return false
  }

  function restart(){
    let g = emptyGrid()
    g = spawnTile(g)
    g = spawnTile(g)
    setGrid(g)
    setScore(0)
    setOver(false)
  }

  function tileColor(val: number | null){
    if (!val) return 'bg-[#0b1220] text-slate-300'
    const colors: Record<number,string> = {
      2: 'bg-[#f0e6da] text-[#776e65]',
      4: 'bg-[#f3e0c6] text-[#776e65]',
      8: 'bg-[#f39c6b] text-white',
      16: 'bg-[#f57c5f] text-white',
      32: 'bg-[#f65e3b] text-white',
      64: 'bg-[#f65e3b] text-white',
      128: 'bg-[#edcf72] text-white',
      256: 'bg-[#edcc61] text-white',
      512: 'bg-[#edc850] text-white',
      1024: 'bg-[#edc53f] text-white',
      2048: 'bg-[#edc22e] text-white'
    }
    return colors[val] || 'bg-[#3c3a32] text-white'
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">2048</h1>
            <p className="text-slate-400 text-sm">Usa las flechas para mover. Junta las fichas iguales.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Score: <span className="font-semibold text-white">{score}</span></div>
            <button onClick={restart} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Restart</button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
            {grid.flat().map((v, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-center text-xl font-semibold rounded ${tileColor(v as number | null)} border border-slate-800`}
                style={{ aspectRatio: '1 / 1', minHeight: 64 }}
              >
                {v ?? ''}
              </div>
            ))}
          </div>
          {over && (
            <div className="mt-4 text-center text-white">
              <div className="text-lg font-semibold">Game Over</div>
              <div className="text-sm text-slate-300">No quedan movimientos.</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

