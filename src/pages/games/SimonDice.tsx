import { useEffect, useRef, useState } from 'react'

const COLORS = ['green','red','yellow','blue'] as const

function randIdx(max:number){ return Math.floor(Math.random()*max) }

export default function SimonDice(){
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState('Pulsa START para jugar')
  const [active, setActive] = useState<number | null>(null)
  const [level, setLevel] = useState(0)
  const timeoutRef = useRef<number | null>(null)
  const bestRef = useRef<number>(Number(localStorage.getItem('simon-best') || '0'))

  useEffect(()=> { return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current) } }, [])

  function playSequence(seq: number[], i = 0){
    setPlaying(true)
    if (i >= seq.length){
      setPlaying(false)
      setPlayerIndex(0)
      setMessage('Repite la secuencia')
      return
    }
    setActive(seq[i])
    timeoutRef.current = window.setTimeout(()=>{
      setActive(null)
      timeoutRef.current = window.setTimeout(()=> playSequence(seq, i+1), 350)
    }, 600)
  }

  function start(){
    const nxt = [...sequence, randIdx(COLORS.length)]
    setSequence(nxt)
    setLevel(nxt.length)
    setMessage('Observa')
    // play after a short delay
    timeoutRef.current = window.setTimeout(()=> playSequence(nxt), 400)
  }

  function handleClick(idx:number){
    if (playing) return
    if (sequence.length === 0) return
    if (idx !== sequence[playerIndex]){
      setMessage('¡Incorrecto! Fin del juego')
      setSequence([])
      setPlayerIndex(0)
      setLevel(0)
      // store best
      if (bestRef.current < level) { bestRef.current = level; localStorage.setItem('simon-best', String(bestRef.current)) }
      return
    }
    const nextIdx = playerIndex + 1
    if (nextIdx === sequence.length){
      // success this round
      setMessage('¡Bien! Nuevo nivel')
      setPlayerIndex(0)
      const nxt = [...sequence, randIdx(COLORS.length)]
      setSequence(nxt)
      setLevel(nxt.length)
      // play next sequence after short delay
      timeoutRef.current = window.setTimeout(()=> playSequence(nxt), 700)
      return
    }
    setPlayerIndex(nextIdx)
    setMessage('Sigue...')
  }

  function reset(){
    setSequence([]); setPlayerIndex(0); setPlaying(false); setMessage('Pulsa START para jugar'); setLevel(0)
  }

  return (
    <main className="p-6 min-h-screen text-slate-100">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Simón Dice</h1>
        <div className="bg-[#071726] rounded-xl p-6 border border-slate-800 text-center">
          <p className="mb-3">Nivel: {level} — Mejor: {bestRef.current}</p>
          <p className="mb-3">{message}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {COLORS.map((col, i) => (
              <button key={col}
                onClick={() => handleClick(i)}
                disabled={playing}
                className={`h-24 rounded-lg shadow-md ${active===i ? 'ring-4 ring-white/40 transform scale-105' : ''}`}
                style={{ background: col }}
              />
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={start} className="px-4 py-2 bg-sky-500 rounded text-black">START</button>
            <button onClick={reset} className="px-4 py-2 bg-amber-500 rounded text-black">RESET</button>
          </div>
        </div>
      </div>
    </main>
  )
}


