import React, { useEffect, useRef, useState } from 'react'
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton'
import { useGameScore } from '../../hooks/useGameScore';

const COLS = 20
const ROWS = 16
const INITIAL_SNAKE = [{ x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }]

function randomFood(snake: { x: number; y: number }[]) {
  while (true) {
    const x = Math.floor(Math.random() * COLS)
    const y = Math.floor(Math.random() * ROWS)
    if (!snake.some(p => p.x === x && p.y === y)) return { x, y }
  }
}

export default function Snake(){
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 })
  const dirRef = useRef(dir)
  dirRef.current = dir
  const [food, setFood] = useState(() => randomFood(INITIAL_SNAKE))
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const speedRef = useRef(140) // ms
  const { submitScore, isSubmitting } = useGameScore({ gameName: 'snake' });

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if (e.key === 'ArrowUp' && dirRef.current.y !== 1) setDir({ x:0, y:-1 })
      if (e.key === 'ArrowDown' && dirRef.current.y !== -1) setDir({ x:0, y:1 })
      if (e.key === 'ArrowLeft' && dirRef.current.x !== 1) setDir({ x:-1, y:0 })
      if (e.key === 'ArrowRight' && dirRef.current.x !== -1) setDir({ x:1, y:0 })
      if (e.key === ' '){
        setRunning(r => !r)
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[])

  useEffect(()=>{
    if (!running) return
    const id = setInterval(()=>{
      setSnake(prev => {
        const head = prev[0]
        const nx = (head.x + dirRef.current.x + COLS) % COLS
        const ny = (head.y + dirRef.current.y + ROWS) % ROWS
        // collision with self
        if (prev.some(p => p.x === nx && p.y === ny)){
          setRunning(false);
          // Guardar puntuación al perder
          if (score > 0) {
            submitScore(score).then(result => {
              setBestScore(result.best);
            }).catch(console.error);
          }
          return prev;
        }
        const ate = (nx === food.x && ny === food.y)
        const newHead = { x: nx, y: ny }
        const newSnake = [newHead, ...prev]
        if (!ate) newSnake.pop()
        else {
          setScore(s => s+1)
          setFood(randomFood(newSnake))
        }
        return newSnake
      })
    }, speedRef.current)
    return ()=> clearInterval(id)
  }, [running, food, score, submitScore])

  function reset(){
    setSnake(INITIAL_SNAKE)
    setDir({ x:1, y:0 })
    dirRef.current = { x:1, y:0 }
    setFood(randomFood(INITIAL_SNAKE))
    setRunning(true)
    setScore(0)
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Snake</h1>
            <p className="text-slate-400 text-sm">Usa las flechas para mover. Barra espaciadora: pausar / reanudar.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Puntos: <span className="font-semibold text-white">{score}</span></div>
            {bestScore !== null && (
              <div className="text-sm text-slate-300">Mejor: <span className="font-semibold text-white">{bestScore}</span></div>
            )}
            <button onClick={reset} className="py-1 px-3 rounded-md bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white text-sm">Reiniciar</button>
            <EndGameButton onEnd={async () => {
              if (score > 0) {
                try {
                  const result = await submitScore(score);
                  setBestScore(result.best);
                } catch (error) {
                  console.error('Error guardando puntuación:', error);
                }
              }
            }} isSubmitting={isSubmitting} />
          </div>
  </header>

  <GameInstructions />

  <section className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4">
          <div style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }} className="grid gap-0 w-full border border-slate-800 bg-[#071826]">
            {Array.from({ length: ROWS }).map((_, r) => (
              Array.from({ length: COLS }).map((__, c) => {
                const isSnake = snake.some(s => s.x === c && s.y === r)
                const isHead = snake[0].x === c && snake[0].y === r
                const isFood = food.x === c && food.y === r
                return (
                  <div key={`${r}-${c}`} className={`w-full h-6 sm:h-8 md:h-10 border border-[#071826] flex items-center justify-center ${isFood ? 'bg-amber-400 text-black' : isHead ? 'bg-emerald-400 text-black' : isSnake ? 'bg-emerald-600' : 'bg-[#071826]'}`}>
                    {isFood ? '🍎' : ''}
                  </div>
                )
              })
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
