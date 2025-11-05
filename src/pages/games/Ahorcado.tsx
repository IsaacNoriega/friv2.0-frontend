import React, { useEffect, useState } from 'react'

const WORDS = ['REACT','JAVASCRIPT','PROGRAMAR','FRIV','JUEGO','ARQUITECTURA','TAILWIND','VITE']

function pickWord(){ return WORDS[Math.floor(Math.random()*WORDS.length)] }

export default function Ahorcado(){
  const [word, setWord] = useState(()=> pickWord())
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState(0)
  const MAX_WRONG = 6
  const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

  const guess = React.useCallback((l: string)=>{
    setGuessed(s => {
      if (s.has(l)) return s
      const next = new Set(Array.from(s))
      next.add(l)
      return next
    })
    if (!word.includes(l)) setWrong(w=>w+1)
  },[word])

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      const k = e.key.toUpperCase()
      if (/^[A-ZÑ]$/.test(k)) guess(k)
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[guess])

  function restart(){ setWord(pickWord()); setGuessed(new Set()); setWrong(0) }

  const revealed = word.split('').map(ch => guessed.has(ch) ? ch : '_').join(' ')
  const won = word.split('').every(ch => guessed.has(ch))
  const lost = wrong >= MAX_WRONG

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Ahorcado</h1>
            <p className="text-slate-400 text-sm">Adivina la palabra letra a letra.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Errores: <span className="font-semibold text-white">{wrong}/{MAX_WRONG}</span></div>
            <button onClick={restart} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Restart</button>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4">
          <div className="text-2xl font-mono tracking-widest text-center mb-4">{revealed}</div>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {letters.map(l => {
              const used = guessed.has(l)
              return (
                <button key={l} onClick={()=> guess(l)} disabled={used || won || lost}
                  className={`px-2 py-1 rounded ${used ? 'bg-slate-600 text-slate-300' : 'bg-slate-800 text-white'}`}>
                  {l}
                </button>
              )
            })}
          </div>
          {won && <div className="text-center text-white">¡Ganaste! 🎉 La palabra era <span className="font-semibold">{word}</span></div>}
          {lost && <div className="text-center text-white">Perdiste. La palabra era <span className="font-semibold">{word}</span></div>}
        </div>
      </div>
    </main>
  )
}

