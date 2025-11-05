import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'ready' | 'draw' | 'result'

export default function Showdown(){
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('Presiona START para comenzar')
  const [playerTime, setPlayerTime] = useState<number | null>(null)
  const [cpuTime, setCpuTime] = useState<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const drawAtRef = useRef<number | null>(null)

  useEffect(()=> {
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current) }
  }, [])

  function start(){
    // Prepare: choose random delay then go to draw
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setPhase('ready')
    setMessage('Prepárate...')
    setPlayerTime(null); setCpuTime(null)

    const delay = 1200 + Math.floor(Math.random() * 2400) // 1.2s - 3.6s
    const cpuReaction = 120 + Math.floor(Math.random() * 400) // 120ms - 520ms

    timeoutRef.current = window.setTimeout(()=>{
      drawAtRef.current = Date.now()
      setPhase('draw')
      setMessage('¡DRAW! — pulsa lo más rápido posible')
      // CPU will react after cpuReaction ms
      window.setTimeout(()=>{
        const cpuR = Date.now() - (drawAtRef.current || Date.now())
        setCpuTime(cpuR)
        // If player hasn't clicked yet, decide outcome
        if (playerTime === null){
          setPhase('result')
          setMessage(cpuR === 0 ? 'Empate' : `CPU ganó en ${cpuR}ms`)
        }
      }, cpuReaction)
    }, delay)
  }

  function playerShoot(){
    const now = Date.now()
    if (phase === 'idle' || phase === 'result') return
    if (phase === 'ready'){
      // foul: clicked too early
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      setPhase('result')
      setPlayerTime(0)
      setMessage('Disparo anticipado — ¡faltal! CPU gana')
      return
    }
    // phase === 'draw'
    const p = (now - (drawAtRef.current || now))
    setPlayerTime(p)
    setPhase('result')
    // determine winner
    if (cpuTime === null){
      // CPU might not have reacted yet; set winner comparing with a small random
      const cpuSim = 120 + Math.floor(Math.random() * 400)
      setCpuTime(cpuSim)
      if (p <= cpuSim) setMessage(`¡Ganaste! Tu tiempo ${p}ms — CPU ${cpuSim}ms`)
      else setMessage(`Perdiste. Tu tiempo ${p}ms — CPU ${cpuSim}ms`)
    } else {
      if (playerTime !== null){
        // already set, leave
      } else {
        if (p <= cpuTime) setMessage(`¡Ganaste! Tu tiempo ${p}ms — CPU ${cpuTime}ms`)
        else setMessage(`Perdiste. Tu tiempo ${p}ms — CPU ${cpuTime}ms`)
      }
    }
  }

  function reset(){
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    drawAtRef.current = null
    setPhase('idle')
    setMessage('Presiona START para comenzar')
    setPlayerTime(null); setCpuTime(null)
  }

  return (
    <main className="p-6 min-h-screen text-slate-100">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">ShowDown — Duelo de reflejos</h1>
        <div className="bg-[#071726] rounded-xl p-6 border border-slate-800 text-center">
          <p className="mb-4">{message}</p>

          <div className="flex justify-center gap-4 mb-4">
            <button onClick={start} className="px-4 py-2 bg-sky-500 rounded font-medium text-black">START</button>
            <button onClick={playerShoot} className="px-4 py-2 bg-rose-500 rounded font-medium text-black">SHOOT</button>
            <button onClick={reset} className="px-4 py-2 bg-amber-500 rounded font-medium text-black">RESET</button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-[#061220] rounded">Jugador: {playerTime === null ? '—' : playerTime === 0 ? 'Falta' : `${playerTime} ms`}</div>
            <div className="p-3 bg-[#061220] rounded">CPU: {cpuTime === null ? '—' : `${cpuTime} ms`}</div>
          </div>

          {phase === 'result' && (
            <div className="mt-4 text-slate-300">Resultado: {message}</div>
          )}
        </div>
      </div>
    </main>
  )
}

