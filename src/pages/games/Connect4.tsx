import { useState } from 'react'

const ROWS = 6
const COLS = 7

function emptyBoard(){
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0))
}

function checkWin(grid: number[][], lastR: number, lastC: number){
  const player = grid[lastR][lastC]
  if (!player) return false
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  for (const [dr,dc] of dirs){
    let count = 1
    // forward
    for (let k=1;k<4;k++){
      const r = lastR + dr*k, c = lastC + dc*k
      if (r<0||r>=ROWS||c<0||c>=COLS||grid[r][c]!==player) break
      count++
    }
    // backward
    for (let k=1;k<4;k++){
      const r = lastR - dr*k, c = lastC - dc*k
      if (r<0||r>=ROWS||c<0||c>=COLS||grid[r][c]!==player) break
      count++
    }
    if (count>=4) return true
  }
  return false
}

export default function Connect4(){
  const [grid, setGrid] = useState<number[][]>(() => emptyBoard())
  const [player, setPlayer] = useState(1)
  const [winner, setWinner] = useState<number | null>(null)

  function drop(col: number){
    if (winner) return
    const g = grid.map(r=>r.slice())
    for (let r = ROWS-1; r>=0; r--){
      if (g[r][col] === 0){
        g[r][col] = player
        setGrid(g)
        if (checkWin(g, r, col)) setWinner(player)
        else setPlayer(p => (p===1?2:1))
        break
      }
    }
  }

  function restart(){ setGrid(emptyBoard()); setPlayer(1); setWinner(null) }

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Conecta 4</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Turn: <span className="font-semibold text-white">{player}</span></div>
            <button onClick={restart} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Restart</button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 inline-block">
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${COLS}, 48px)`, gap:6 }}>
            {grid.flat().map((cell, i) => {
              const c = i % COLS
              const color = cell === 1 ? '#ffcc00' : cell === 2 ? '#60a5fa' : '#0b1220'
              return (
                <div key={i} onClick={() => drop(c)} style={{ width:48, height:48, background: color, borderRadius:9999, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} />
              )
            })}
          </div>
          {winner && <div className="mt-3 text-white">Player {winner} wins! 🎉</div>}
        </div>
      </div>
    </main>
  )
}

