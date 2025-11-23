import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrophyIcon, FireIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid'
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton'
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

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
    // Asegurar que las coordenadas estén dentro del rango válido
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS && !snake.some(p => p.x === x && p.y === y)) {
      return { x, y }
    }
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
  const { isMuted, toggleMute } = useBackgroundMusic()

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
    }

    document.addEventListener('keydown', onKey, { passive: false })
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
          if (serverBestScore === null || score > serverBestScore) {
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
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🐍</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-lime-400 via-green-300 to-lime-500 bg-clip-text text-transparent">
                Snake
              </h1>
            </div>
            <button
              onClick={toggleMute}
              className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
              title={isMuted ? "Activar música" : "Silenciar música"}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6 text-slate-400" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6 text-lime-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Come la manzana y crece sin chocarte contigo mismo</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">
              
              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-lime-500/10 to-green-600/5 rounded-lg border border-lime-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-lime-300">Puntos</span>
                  <FireIcon className="w-5 h-5 text-lime-400" />
                </div>
                <div className="text-4xl font-black bg-linear-to-r from-lime-400 to-green-300 bg-clip-text text-transparent">
                  {score}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Récord: {serverBestScore ?? 0}
                </div>
                {scoreError && <div className="text-red-400 text-xs mt-1">{scoreError}</div>}
              </div>

              {/* Length */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Longitud de la serpiente</span>
                  <TrophyIcon className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-300">
                  {snake.length}
                </div>
              </div>

              {/* Controls */}
              <button
                onClick={reset}
                className="w-full py-3 rounded-lg bg-linear-to-r from-lime-500 to-green-600 text-white font-bold hover:from-lime-600 hover:to-green-700 transition-all shadow-lg shadow-lime-500/20"
              >
                🔄 Reiniciar
              </button>

              {/* Action Button */}
              <EndGameButton onEnd={() => {
                if (serverBestScore === null || score > serverBestScore) {
                  submitScore(score);
                }
              }} />
            </div>
          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              ref={gameRef}
              tabIndex={0}
              className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-lime-500/50"
            >
              <div
                className="w-full max-w-[480px] aspect-[20/12] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] flex items-center justify-center"
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    width: '100%',
                    height: '100%',
                  }}
                  className="w-full h-full gap-0.5 border-2 border-lime-600/30 rounded-lg overflow-hidden shadow-2xl shadow-lime-500/20 bg-black"
                >
                  {Array.from({ length: ROWS }).map((_, r) =>
                    Array.from({ length: COLS }).map((__, c) => {
                      const isSnake = snake.some(s => s.x === c && s.y === r)
                      const isHead = snake[0].x === c && snake[0].y === r
                      const isFood = food.x === c && food.y === r
                      const baseColor = (r + c) % 2 === 0 ? 'bg-slate-800/60' : 'bg-slate-800/40'
                      return (
                        <motion.div
                          key={`${r}-${c}`}
                          initial={isFood ? { scale: 0 } : undefined}
                          animate={isFood ? { scale: 1 } : undefined}
                          className={`w-full h-full aspect-square flex items-center justify-center text-lg
                            ${
                              isFood
                                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                                : isHead
                                ? 'bg-linear-to-br from-lime-400 to-green-500 shadow-lg shadow-lime-500/50'
                                : isSnake
                                ? 'bg-linear-to-br from-lime-500 to-green-600'
                                : baseColor
                            }
                          `}
                        >
                          {isFood ? '🍎' : ''}
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.section>

        </div>

        {/* BOTTOM ROW: Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GameInstructions
            title="Cómo Jugar Snake"
            description="Controla la serpiente para comer la manzana roja. Cada vez que comes, la serpiente crece y ganas puntos. ¡Evita chocar contigo mismo!"
            controls={[
              { key: '↑ / W', action: 'Mover arriba' },
              { key: '↓ / S', action: 'Mover abajo' },
              { key: '← / A', action: 'Mover izquierda' },
              { key: '→ / D', action: 'Mover derecha' }
            ]}
            note="La serpiente nunca se detiene. Planea tu camino con cuidado."
          />
        </motion.div>

      </div>
    </main>
  )
}
