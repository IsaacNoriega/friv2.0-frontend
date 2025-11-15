import React, { useEffect, useRef, useState } from 'react'
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton'
import { useGameScore } from '../../hooks/useGameScore';

const COLS = 20
const ROWS = 12
const INITIAL_SNAKE = [
  { x: 4, y: 8 },
  { x: 3, y: 8 },
  { x: 2, y: 8 }
]

function randomFood(snake: { x: number; y: number }[]) {
  while (true) {
    const x = Math.floor(Math.random() * COLS)
    const y = Math.floor(Math.random() * ROWS)
    if (!snake.some(p => p.x === x && p.y === y)) return { x, y }
  }
}

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 })
  const dirRef = useRef(dir)

  const [food, setFood] = useState(() => randomFood(INITIAL_SNAKE))
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)

  const speedRef = useRef(140)
  const { submitScore, error: scoreError, bestScore: serverBestScore } =
    useGameScore('snake')

  const gameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (gameRef.current) gameRef.current.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = e.key.toLowerCase()
      const code = e.code

      const isArrow =
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'

      if (isArrow) {
        e.preventDefault()
      }

      const up = key === 'arrowup' || key === 'w' || code === 'KeyW'
      const down = key === 'arrowdown' || key === 's' || code === 'KeyS'
      const left = key === 'arrowleft' || key === 'a' || code === 'KeyA'
      const right = key === 'arrowright' || key === 'd' || code === 'KeyD'

      if (up && dirRef.current.y !== 1) {
        const newDir = { x: 0, y: -1 }
        setDir(newDir)
        dirRef.current = newDir
      } else if (down && dirRef.current.y !== -1) {
        const newDir = { x: 0, y: 1 }
        setDir(newDir)
        dirRef.current = newDir
      } else if (left && dirRef.current.x !== 1) {
        const newDir = { x: -1, y: 0 }
        setDir(newDir)
        dirRef.current = newDir
      } else if (right && dirRef.current.x !== -1) {
        const newDir = { x: 1, y: 0 }
        setDir(newDir)
        dirRef.current = newDir
      }

      if (key === ' ') {
        setRunning(r => !r)
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!running) return

    dirRef.current = dir

    const id = setInterval(() => {
      setSnake(prev => {
        const head = prev[0]
        const nx = (head.x + dirRef.current.x + COLS) % COLS
        const ny = (head.y + dirRef.current.y + ROWS) % ROWS

        if (prev.some(p => p.x === nx && p.y === ny)) {
          setRunning(false)

          if (score > (serverBestScore || 0)) {
            submitScore(score).catch(console.error)
          }

          return prev
        }

        const ate = nx === food.x && ny === food.y
        const newSnake = [{ x: nx, y: ny }, ...prev]

        if (!ate) newSnake.pop()
        else {
          setScore(s => s + 1)
          setFood(randomFood(newSnake))
        }

        return newSnake
      })
    }, speedRef.current)

    return () => clearInterval(id)
  }, [running, food, score, submitScore, serverBestScore, dir])

  function reset() {
    setSnake(INITIAL_SNAKE)
    setDir({ x: 1, y: 0 })
    dirRef.current = { x: 1, y: 0 }
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
            <p className="text-slate-400 text-sm">
              Usa las flechas o WASD para mover. Barra espaciadora: pausar / reanudar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm mb-1">
                🐍 Puntos: <span className="font-bold">{score}</span>
              </div>
              <div className="text-xs text-slate-400">
                Récord: <span className="font-bold">{serverBestScore ?? 0}</span>
              </div>
              {scoreError && (
                <div className="text-red-500 text-xs">{scoreError}</div>
              )}
            </div>

            <button
              onClick={reset}
              className="py-1 px-3 rounded-md bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white text-sm"
            >
              Reiniciar
            </button>

            <EndGameButton
              onEnd={() => {
                if (score > (serverBestScore || 0)) {
                  submitScore(score).catch(console.error)
                }
              }}
            />
          </div>
        </header>

        <GameInstructions
          title="Cómo Jugar Snake"
          description="Controla la serpiente para comer la comida roja. Cada vez que comes, la serpiente crece y ganas puntos. ¡Evita chocar contigo mismo!"
          controls={[
            { key: '↑ / W', action: 'Mover arriba' },
            { key: '↓ / S', action: 'Mover abajo' },
            { key: '← / A', action: 'Mover izquierda' },
            { key: '→ / D', action: 'Mover derecha' }
          ]}
          note="La serpiente nunca se detiene. Planea tu camino."
        />

        <section
          ref={gameRef}
          tabIndex={0}
          className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4"
        >
          <div
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            className="grid gap-0 w-full border border-green-950"
          >
            {Array.from({ length: ROWS }).map((_, r) =>
              Array.from({ length: COLS }).map((__, c) => {
                const isSnake = snake.some(s => s.x === c && s.y === r)
                const isHead = snake[0].x === c && snake[0].y === r
                const isFood = food.x === c && food.y === r

                const baseColor =
                  (r + c) % 2 === 0 ? 'bg-green-800' : 'bg-green-900'

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`
                      w-full h-6 sm:h-8 md:h-10 border border-green-950 flex items-center justify-center
                      ${
                        isFood
                          ? 'bg-amber-400 text-black'
                          : isHead
                          ? 'bg-purple-400 text-black'
                          : isSnake
                          ? 'bg-purple-600'
                          : baseColor
                      }
                    `}
                  >
                    {isFood ? '🍎' : ''}
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
