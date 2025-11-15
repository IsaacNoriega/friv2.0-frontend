import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, PlayIcon, ArrowPathIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

const COLORS = ['green', 'red', 'yellow', 'blue'] as const

function randIdx(max: number) {
  return Math.floor(Math.random() * max)
}

export default function SimonDice() {
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState('Pulsa INICIAR para comenzar')
  const [active, setActive] = useState<number | null>(null)
  const [level, setLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const bestRef = useRef<number>(Number(localStorage.getItem('simon-best') || '0'))
  const { submitScore } = useGameScore('simon')

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  function playSequence(seq: number[], i = 0) {
    setPlaying(true)
    if (i >= seq.length) {
      setPlaying(false)
      setPlayerIndex(0)
      setMessage('Repite la secuencia...')
      return
    }
    setActive(seq[i])
    timeoutRef.current = window.setTimeout(() => {
      setActive(null)
      timeoutRef.current = window.setTimeout(() => playSequence(seq, i + 1), 350)
    }, 600)
  }

  function start() {
    setStarted(true)
    const first = [randIdx(COLORS.length)]
    setSequence(first)
    setLevel(1)
    setScore(0)
    setMessage('Observa la secuencia...')
    timeoutRef.current = window.setTimeout(() => playSequence(first), 500)
  }

  function handleClick(idx: number) {
    if (playing || sequence.length === 0) return

    if (idx !== sequence[playerIndex]) {
      setMessage('❌ Incorrecto, juego terminado.')
      setStarted(false)
      if (score > bestRef.current) {
        bestRef.current = score
        localStorage.setItem('simon-best', String(score))
      }
      // enviar puntuación
      submitScore(score).catch(() => {})
      return
    }

    const nextIdx = playerIndex + 1

    if (nextIdx === sequence.length) {
      // Pasó la ronda
      const newScore = score + 100
      setScore(newScore)
      setMessage(`✅ Correcto! Pasas a la ronda ${level + 1}`)
      setPlayerIndex(0)
      const nxt = [...sequence, randIdx(COLORS.length)]
      setSequence(nxt)
      setLevel(nxt.length)
      timeoutRef.current = window.setTimeout(() => playSequence(nxt), 900)
      return
    }

    setPlayerIndex(nextIdx)
    setMessage('Sigue la secuencia...')
  }

  function reset() {
    setSequence([])
    setPlayerIndex(0)
    setPlaying(false)
    setMessage('Pulsa INICIAR para comenzar')
    setLevel(0)
    setScore(0)
    setStarted(false)
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
          <div className="flex items-center gap-3 mb-2">
            <div className="text-5xl">🎵</div>
            <h1 className="text-5xl font-black bg-linear-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Simón Dice
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-16">Memoriza y repite la secuencia de colores</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">
              
              {/* Level Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-green-400" />
                  <span className="text-sm text-slate-400">Nivel</span>
                </div>
                <div className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg">
                  <span className="text-2xl font-black text-green-300">{level}</span>
                </div>
              </div>

              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-green-500/10 to-blue-600/5 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-300">Puntos</span>
                  <FireIcon className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-4xl font-black bg-linear-to-r from-green-400 to-blue-300 bg-clip-text text-transparent">
                  {score}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Récord: {bestRef.current}
                </div>
              </div>

              {/* Message Card */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={message}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 bg-linear-to-br from-purple-500/10 to-pink-600/5 rounded-lg border border-purple-500/30"
                >
                  <div className="flex items-center gap-2">
                    <MusicalNoteIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-purple-200 italic">{message}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Sequence Progress */}
              {started && (
                <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Progreso</span>
                    <span className="text-xs text-slate-500">{playerIndex}/{sequence.length}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <motion.div 
                      className="bg-linear-to-r from-green-400 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(playerIndex / sequence.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                {!started ? (
                  <button
                    onClick={start}
                    className="flex-1 py-3 rounded-lg bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    INICIAR
                  </button>
                ) : (
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-lg bg-linear-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    REINICIAR
                  </button>
                )}
              </div>

              {/* Action Button */}
              <EndGameButton onEnd={() => submitScore(score)} />
            </div>
          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 h-full flex items-center justify-center">
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {COLORS.map((col, i) => {
                  const colorStyles = {
                    green: 'bg-linear-to-br from-green-400 to-emerald-600 shadow-green-500/50',
                    red: 'bg-linear-to-br from-red-400 to-rose-600 shadow-red-500/50',
                    yellow: 'bg-linear-to-br from-yellow-400 to-amber-600 shadow-yellow-500/50',
                    blue: 'bg-linear-to-br from-blue-400 to-indigo-600 shadow-blue-500/50',
                  }[col];

                  return (
                    <motion.button
                      key={col}
                      onClick={() => handleClick(i)}
                      disabled={!started || playing}
                      whileHover={started && !playing ? { scale: 1.05, filter: 'brightness(1.2)' } : {}}
                      whileTap={started && !playing ? { 
                        scale: 0.9,
                        filter: 'brightness(1.5)',
                        transition: { duration: 0.1 }
                      } : {}}
                      animate={{
                        scale: active === i ? 1.15 : 1,
                        opacity: active === i ? 1 : started && playing ? 0.6 : 0.8,
                        filter: active === i ? 'brightness(1.5)' : 'brightness(1)',
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20
                      }}
                      className={`
                        h-32 rounded-2xl transition-all duration-200
                        ${colorStyles}
                        ${
                          active === i 
                            ? 'shadow-2xl ring-4 ring-white/80' 
                            : 'shadow-lg'
                        }
                        ${
                          !started || playing 
                            ? 'cursor-not-allowed' 
                            : 'cursor-pointer hover:shadow-2xl'
                        }
                      `}
                    />
                  );
                })}
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
            title="Cómo Jugar Simón Dice"
            description="Memoriza y repite la secuencia de colores que se iluminan. Cada ronda añade un nuevo color a la secuencia. Haz clic en los colores en el orden correcto. ¡Concéntrate y llega lo más lejos posible!"
            controls={[
              { key: 'Clic', action: 'Seleccionar color' }
            ]}
            note="Toma tu tiempo para memorizar. No hay límite de tiempo para repetir la secuencia."
          />
        </motion.div>

      </div>
    </main>
  )
}
