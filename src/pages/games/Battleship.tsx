import { useMemo, useState } from 'react'

type Cell = { ship: number | null, hit: boolean }

function makeBoard(size: number){
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ({ ship: null, hit: false } as Cell)))
}

function placeShips(size: number, ships: number[]){
  const board = makeBoard(size)
  let id = 1
  for (const len of ships){
    let placed = false
    for (let attempt = 0; attempt < 200 && !placed; attempt++){
      const horiz = Math.random() < 0.5
      const r = Math.floor(Math.random() * size)
      const c = Math.floor(Math.random() * size)
      const coords = [] as [number,number][]
      for (let k = 0; k < len; k++) coords.push(horiz ? [r, c + k] : [r + k, c])
      if (coords.some(([rr,cc]) => rr < 0 || rr >= size || cc < 0 || cc >= size)) continue
      if (coords.some(([rr,cc]) => board[rr][cc].ship !== null)) continue
      for (const [rr,cc] of coords) board[rr][cc].ship = id
      placed = true
      id++
    }
  }
  return board
}

export default function Battleship(){
  const SIZE = 8
  const SHIPS = [4,3,3,2,2]

  const [board, setBoard] = useState<Cell[][]>(() => placeShips(SIZE, SHIPS))
  const [shots, setShots] = useState(0)
  const sunk = useMemo(()=>{
    const shipsAlive = new Map<number, boolean>()
    for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
      const s = board[r][c].ship
      if (s !== null){ if (!shipsAlive.has(s)) shipsAlive.set(s, false); if (!board[r][c].hit) shipsAlive.set(s, true) }
    }
    // ship is sunk if shipsAlive.get(id) === false (no unhit cells)
    let sunkCount = 0
    for (const [id, hasUnhit] of shipsAlive) if (!hasUnhit) sunkCount++
    return sunkCount
  },[board])

  function shoot(r:number, c:number){
    setBoard(prev => {
      const copy = prev.map(row => row.map(cell => ({ ...cell })))
      if (copy[r][c].hit) return prev
      copy[r][c].hit = true
      return copy
    })
    setShots(s => s + 1)
  }

  function restart(){ setBoard(placeShips(SIZE, SHIPS)); setShots(0) }

  const totalShips = SHIPS.length
  const allSunk = sunk === totalShips

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Battleship</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Shots: <span className="font-semibold text-white">{shots}</span></div>
            <button onClick={restart} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Restart</button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 inline-block">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 36px)`, gap: 6 }}>
            {board.flat().map((cell, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE
              const show = cell.hit
              const isShip = cell.ship !== null
              const bg = show ? (isShip ? '#ef4444' : '#1f2937') : '#0b1220'
              const content = show ? (isShip ? '💥' : '·') : ''
              return (
                <button key={i} onClick={() => shoot(r,c)} style={{ width:36, height:36, background: bg, borderRadius:6 }} className="flex items-center justify-center font-semibold text-white">
                  {content}
                </button>
              )
            })}
          </div>
          <div className="mt-3 text-white">Ships sunk: {sunk}/{totalShips} {allSunk && <span>— You won! 🎉</span>}</div>
        </div>
      </div>
    </main>
  )
}

