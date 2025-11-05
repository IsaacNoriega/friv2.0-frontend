import React, { useEffect, useMemo, useState } from 'react'

type Card = {
  id: number
  symbol: string
  matched: boolean
}

const SYMBOLS = ['🍎','🍌','🍇','🍓','🍊','🍍','🥝','🍑']

function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Memorama(){
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([]) // indices
  const [moves, setMoves] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [time, setTime] = useState(0)

  useEffect(()=>{
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    let t: ReturnType<typeof setInterval> | null = null
    if (startedAt !== null) {
      t = setInterval(()=> setTime(Math.floor((Date.now() - startedAt)/1000)), 1000)
    }
    return ()=> { if (t) clearInterval(t) }
  },[startedAt])

  function buildDeck(){
    const pick = SYMBOLS.slice(0,6) // 6 pairs = 12 cards (adjust for difficulty)
    const deck = pick.flatMap((s, idx) => [ { id: idx*2, symbol: s, matched: false }, { id: idx*2+1, symbol: s, matched: false } ])
    return shuffle(deck)
  }

  function reset(){
    const d = buildDeck()
    setCards(d)
    setFlipped([])
    setMoves(0)
    setStartedAt(Date.now())
    setTime(0)
  }

  useEffect(()=>{
    if (flipped.length === 2){
      const [a,b] = flipped
      if (cards[a].symbol === cards[b].symbol){
        // mark matched
        setCards(prev => prev.map((c, i) => i===a || i===b ? { ...c, matched: true } : c))
        setFlipped([])
      } else {
        // flip back after delay
        const t = setTimeout(()=> setFlipped([]), 800)
        return ()=> clearTimeout(t)
      }
    }
  },[flipped, cards])

  useEffect(()=>{
    if (cards.length > 0 && cards.every(c => c.matched)){
      // finished
      setStartedAt(null)
    }
  },[cards])

  function onCardClick(index: number){
    if (flipped.includes(index)) return
    if (cards[index].matched) return
    if (flipped.length === 2) return
    if (startedAt === null) setStartedAt(Date.now())
    setFlipped(prev => [...prev, index])
    if (flipped.length === 1) setMoves(m => m+1)
  }

  const cols = useMemo(()=>({ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }),[])

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Memorama</h1>
            <p className="text-slate-400 text-sm">Encuentra las parejas lo más rápido posible.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Movimientos: <span className="font-semibold text-white">{moves}</span></div>
            <div className="text-sm text-slate-300">Tiempo: <span className="font-semibold text-white">{time}s</span></div>
            <button onClick={reset} className="ml-2 py-1 px-3 rounded-md bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white text-sm">Reiniciar</button>
          </div>
        </header>

        <section className="bg-[#0e1b26] rounded-xl border border-slate-800 p-6">
          <div className="mb-4 text-slate-400 text-sm">Toca una carta para voltearla. Buen juego.</div>

          <div className="grid gap-4" style={cols as React.CSSProperties}>
            {cards.map((c, i) => {
              const isFlipped = flipped.includes(i) || c.matched
              return (
                <button
                  key={c.id}
                  onClick={() => onCardClick(i)}
                  className={`h-20 rounded-lg flex items-center justify-center text-3xl ${isFlipped ? 'bg-white/5 text-white' : 'bg-[#071826] text-transparent'} border border-slate-700`}
                >
                  <span className={`${isFlipped ? '' : 'opacity-0'}`}>{c.symbol}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
