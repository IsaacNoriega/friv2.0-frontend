import { useEffect, useRef, useState } from 'react'

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
    <main className="p-6 min-h-screen bg-[#0b1120] text-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-[#162033] rounded-2xl p-6 border border-slate-700 text-center shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          🎵 Simón Dice
        </h1>

        <p className="mb-2">Nivel: {level}</p>
        <p className="mb-2">Puntaje: {score}</p>
        <p className="mb-4">Mejor: {bestRef.current}</p>

        <p className="text-sm text-slate-400 mb-4 italic">{message}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {COLORS.map((col, i) => (
            <button
              key={col}
              onClick={() => handleClick(i)}
              disabled={!started || playing}
              className={`h-24 rounded-xl transition-transform duration-200 ${
                active === i ? 'ring-4 ring-white/60 scale-105' : ''
              }`}
              style={{ background: col }}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {!started ? (
            <button
              onClick={start}
              className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black rounded-md font-semibold transition"
            >
              INICIAR
            </button>
          ) : (
            <button
              onClick={reset}
              className="px-6 py-2 bg-red-500 hover:bg-red-400 text-black rounded-md font-semibold transition"
            >
              REINICIAR
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
