import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

type Entry = {
  username?: string
  score: number
  user_id?: string
}

const GAME_OPTIONS: { slug: string; label: string }[] = [
  { slug: 'flappy', label: 'Flappy' },
  { slug: '2048', label: '2048' },
  { slug: 'tetris', label: 'Tetris' },
  { slug: 'pacman', label: 'Pacman' },
  { slug: 'battleship', label: 'Battleship' },
  { slug: 'simondice', label: 'Simon' },
  { slug: 'blackjack', label: 'Blackjack' },
  { slug: 'memorama', label: 'Memorama' },
  { slug: 'snake', label: 'Snake' },
]

export default function Ranking(){
  const [selectedGame, setSelectedGame] = useState(GAME_OPTIONS[0].slug)
  const [top, setTop] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        try { const m = await api.getMe(); if (mounted) setMe(m) } catch { if (mounted) setMe(null) }
        const data = await api.getGameTop(selectedGame, 50) as unknown
        // data may be an array or object - api.getGameTop normalizes to array
        const arr = Array.isArray(data) ? data as any[] : []
        if (!mounted) return
        setTop(arr.map((x) => ({ username: x.username ?? x.user?.username ?? x.user?.name, score: x.score, user_id: x.user_id ?? x.user?._id ?? x.user?.id })))
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Error cargando leaderboard')
      } finally { if (mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [selectedGame])

  const myRank = useMemo(() => {
    if (!me) return null
    const uid = me.id ?? me._id
    const idx = top.findIndex(t => String(t.user_id) === String(uid) || t.username === me.username || t.username === me.name)
    if (idx === -1) return null
    return { rank: idx + 1, entry: top[idx] }
  }, [me, top])

  return (
    <main className="p-8 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Ranking por juego</h1>
            <p className="text-slate-400">Selecciona un juego para ver el top local y tu posición</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm text-slate-300">Filtrar por juego</label>
            <select value={selectedGame} onChange={(e)=>setSelectedGame(e.target.value)} className="bg-[#08121a] border border-slate-700 text-slate-200 p-2 rounded w-full md:w-auto">
              {GAME_OPTIONS.map(g => <option key={g.slug} value={g.slug}>{g.label}</option>)}
            </select>
          </div>
        </header>

  {/* Show user's rank if available */}
  {error && <div className="mb-4 text-red-400">{error}</div>}
        {myRank ? (
          <div className="mb-4 p-4 rounded-lg bg-slate-900/60 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Tu posición en {GAME_OPTIONS.find(g => g.slug === selectedGame)?.label}</div>
                <div className="text-2xl font-bold">#{myRank.rank} — {myRank.entry.username ?? 'Tú'}</div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{myRank.entry.score}</div>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-slate-400">No estás en el top {top.length > 0 ? top.length : 50} de este juego (o no has iniciado sesión).</div>
        )}

        <section className="rounded-xl border border-slate-800 overflow-hidden bg-[#0e1b26]">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-3 text-slate-100 font-semibold">
              <span className="text-amber-300">🏆</span>
              Top jugadores — {GAME_OPTIONS.find(g => g.slug === selectedGame)?.label}
            </div>
            <div className="text-slate-400 text-sm">puntos</div>
          </div>

          <ul>
            {loading ? (
              Array.from({ length: 10 }).map((_,i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-md animate-pulse" />
                    <div>
                      <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-slate-800 rounded mt-2 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-slate-800 rounded animate-pulse" />
                </li>
              ))
            ) : (
              top.map((p, idx) => (
                <li key={`${p.user_id ?? p.username}-${idx}`} className={`flex items-center justify-between gap-4 px-6 py-4 ${idx < 3 ? 'bg-[rgba(255,255,255,0.02)]' : ''} border-t border-slate-800`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 text-slate-400">{idx+1 === 1 ? '🏆' : idx+1 === 2 ? '🥈' : idx+1 === 3 ? '🥉' : `#${idx+1}`}</div>
                    <div className={`${String(p.user_id) === String(me?.id ?? me?._id) ? 'font-semibold text-emerald-300' : 'font-semibold text-slate-100'}`}>
                      {p.username ?? 'Anónimo'}
                    </div>
                    <div className="text-xs text-slate-400">{p.user_id ? `id:${String(p.user_id).slice(0,6)}` : ''}</div>
                  </div>

                  <div className={`text-right ${String(p.user_id) === String(me?.id ?? me?._id) ? 'text-emerald-400' : 'text-slate-100'}`}>
                    <div className="font-semibold">{p.score}</div>
                    <div className="text-xs text-slate-400">puntos</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </main>
  )
}
