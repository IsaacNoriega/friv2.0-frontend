import React, { useEffect, useState } from 'react'

type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adj: number
}

function makeBoard(rows: number, cols: number, mines: number){
  const board: Cell[][] = Array.from({length: rows}, ()=>Array.from({length: cols}, ()=>({ mine:false, revealed:false, flagged:false, adj:0 })))
  // place mines
  let placed = 0
  while (placed < mines){
    const r = Math.floor(Math.random()*rows)
    const c = Math.floor(Math.random()*cols)
    if (!board[r][c].mine){ board[r][c].mine = true; placed++ }
  }
  // compute adjacents
  const dirs = [-1,0,1]
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){
    if (board[r][c].mine) { board[r][c].adj = -1; continue }
    let count = 0
    for (const dr of dirs) for (const dc of dirs){ if (dr===0 && dc===0) continue; const nr=r+dr, nc=c+dc; if (nr>=0 && nr<rows && nc>=0 && nc<cols && board[nr][nc].mine) count++ }
    board[r][c].adj = count
  }
  return board
}

function floodReveal(board: Cell[][], r:number, c:number){
  const rows = board.length, cols = board[0].length
  const stack = [[r,c]] as [number,number][]
  while (stack.length){
    const [cr,cc] = stack.pop()!
    const cell = board[cr][cc]
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.adj === 0){
      for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++){
        const nr = cr+dr, nc = cc+dc
        if (nr>=0 && nr<rows && nc>=0 && nc<cols && !board[nr][nc].revealed) stack.push([nr,nc])
      }
    }
  }
}

export default function Minesweeper(){
  const ROWS = 9, COLS = 9, MINES = 10
  const [board, setBoard] = useState<Cell[][]>(()=> makeBoard(ROWS, COLS, MINES))
  const [lost, setLost] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(()=>{
    // check win
    const total = ROWS*COLS
    const revealed = board.flat().filter(c=>c.revealed).length
    const mines = board.flat().filter(c=>c.mine).length
    if (!lost && revealed + mines === total) setWon(true)
  },[board, lost])

  function restart(){ setBoard(makeBoard(ROWS,COLS,MINES)); setLost(false); setWon(false) }

  function reveal(r:number,c:number){
    if (lost || won) return
    const b = board.map(row => row.map(cell => ({...cell})))
    const cell = b[r][c]
    if (cell.flagged || cell.revealed) return
    if (cell.mine){ cell.revealed = true; setBoard(b); setLost(true); return }
    floodReveal(b,r,c)
    setBoard(b)
  }

  function toggleFlag(e: React.MouseEvent, r:number, c:number){
    e.preventDefault()
    if (lost || won) return
    const b = board.map(row => row.map(cell => ({...cell})))
    const cell = b[r][c]
    if (cell.revealed) return
    cell.flagged = !cell.flagged
    setBoard(b)
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Buscaminas</h1>
            <p className="text-slate-400 text-sm">Haz click para revelar, clic derecho para marcar bandera.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Mines: <span className="font-semibold text-white">{MINES}</span></div>
            <button onClick={restart} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Restart</button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 overflow-auto">
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${COLS}, 32px)`, gap:6 }}>
            {board.flat().map((cell, i)=>{
              const r = Math.floor(i/COLS), c = i % COLS
              let content = null
              let bg = '#0b1220'
              if (cell.revealed){
                bg = cell.mine ? '#ef4444' : '#10232b'
                content = cell.mine ? '💣' : (cell.adj>0 ? cell.adj : '')
              } else if (cell.flagged) { content = '🚩' }
              return (
                <button
                  key={i}
                  onClick={()=>reveal(r,c)}
                  onContextMenu={(e)=>toggleFlag(e,r,c)}
                  className="flex items-center justify-center font-semibold text-lg rounded"
                  style={{ width:32, height:32, background: bg, color: cell.revealed ? '#fff' : '#cbd5e1', borderRadius:6 }}
                >
                  {content}
                </button>
              )
            })}
          </div>
          {lost && <div className="mt-4 text-center text-white">Perdiste — las minas se revelaron. <button onClick={restart} className="ml-2 px-2 py-1 bg-[#0ea5e9] rounded text-black">Jugar otra</button></div>}
          {won && <div className="mt-4 text-center text-white">¡Ganaste! 🎉</div>}
        </div>
      </div>
    </main>
  )
}

