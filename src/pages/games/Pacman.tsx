import { useEffect, useState, useRef } from 'react'

const MAP = [`
#################
#...............#
#.###.#####.###.#
#.#.#.#...#.#.#.#
#.#.#.#.#.#.#.#.#
#...............#
#.#.#.#.#.#.#.#.#
#.#.#.#...#.#.#.#
#.###.#####.###.#
#...............#
#################
`.trim()]

type Cell = '#' | '.' | ' '

function parseMap(): Cell[][]{
  const rows = MAP[0].split('\n')
  return rows.map(r => r.split('') as Cell[])
}

export default function Pacman(){
  const [grid, setGrid] = useState<Cell[][]>(()=> parseMap())
  const [pos, setPos] = useState({ r:1, c:1 })
  const [dots, setDots] = useState(0)
  const ghostRef = useRef({ r:9, c:15 })
  const [tick, setTick] = useState(0)
  const [win, setWin] = useState(false)

  useEffect(()=>{
    // count dots
    let n = 0
    for (const row of grid) for (const cell of row) if (cell === '.') n++
    setDots(n)
  },[grid])

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if (win) return
      const moves: Record<string, [number,number]> = { ArrowLeft:[0,-1], ArrowRight:[0,1], ArrowUp:[-1,0], ArrowDown:[1,0] }
      const dir = moves[e.key]
      if (!dir) return
      e.preventDefault()
      const nr = pos.r + dir[0], nc = pos.c + dir[1]
      if (grid[nr] && grid[nr][nc] !== '#'){
        setPos({ r:nr, c:nc })
        setGrid(g=>{
          const copy = g.map(row=>row.slice()) as Cell[][]
          if (copy[nr][nc] === '.') copy[nr][nc] = ' '
          return copy
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[pos, grid, win])

  // ghost simple AI
  useEffect(()=>{
    const id = setInterval(()=>{
      setTick(t=>t+1)
      const g = ghostRef.current
      // random move
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]]
      const cand = dirs.map(d=>({r:g.r+d[0], c:g.c+d[1]})).filter(p=>grid[p.r] && grid[p.r][p.c] !== '#')
      if (cand.length){
        const pick = cand[Math.floor(Math.random()*cand.length)]
        ghostRef.current = pick
      }
    }, 400)
    return ()=> clearInterval(id)
  },[grid])

  useEffect(()=>{
    // collision check
    if (ghostRef.current.r === pos.r && ghostRef.current.c === pos.c){
      // lose: reset pacman to start
      setPos({ r:1, c:1 })
    }
    // win check
    if (dots === 0) setWin(true)
  },[tick, pos, dots])

  function restart(){ setGrid(parseMap()); setPos({ r:1, c:1 }); setWin(false) }

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Pacman</h1>
            <p className="text-slate-400 text-sm">Flechas para mover. Evita al fantasma.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Dots: <span className="font-semibold text-white">{dots}</span></div>
            <button onClick={restart} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Restart</button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 overflow-auto">
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${grid[0].length}, 22px)`, gap:4 }}>
            {grid.flat().map((cell, i)=>{
              const r = Math.floor(i / grid[0].length)
              const c = i % grid[0].length
              const isPac = pos.r === r && pos.c === c
              const ghost = ghostRef.current && ghostRef.current.r === r && ghostRef.current.c === c
              const bg = cell === '#' ? '#0b1220' : '#071f2f'
              return (
                <div key={i} style={{ width:22, height:22, background: bg, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {isPac ? <div style={{width:16,height:16,background:'#ffcc00',borderRadius:8}} /> : ghost ? <div style={{width:16,height:16,background:'#ef4444',borderRadius:8}} /> : (cell === '.' ? <div style={{width:6,height:6,background:'#fff',borderRadius:3}} /> : null)}
                </div>
              )
            })}
          </div>
          {win && <div className="mt-4 text-center text-white">You Win! 🎉</div>}
        </div>
      </div>
    </main>
  )
}

