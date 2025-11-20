import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrophyIcon, ChartBarIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { api } from '../services/api'

type Entry = {
  username?: string
  score: number
  user_id?: string
}

const GAME_OPTIONS: { slug: string; label: string }[] = [
  { slug: '2048', label: '2048' },
  { slug: 'ahorcado', label: 'Ahorcado' },
  { slug: 'battleship', label: 'Battleship' },
  { slug: 'blackjack', label: 'Blackjack' },
  { slug: 'clicker', label: 'Clicker' },
  { slug: 'connect4', label: 'Conecta 4' },
  { slug: 'flappy', label: 'Flappy Bird' },
  { slug: 'memorama', label: 'Memorama' },
  { slug: 'minesweeper', label: 'Buscaminas' },
  { slug: 'pacman', label: 'Pacman' },
  { slug: 'simondice', label: 'Simón Dice' },
  { slug: 'snake', label: 'Snake' },
  { slug: 'sudoku', label: 'Sudoku' },
  { slug: 'tetris', label: 'Tetris' },
]

export default function Ranking(){
  const [selectedGame, setSelectedGame] = useState(GAME_OPTIONS[0].slug)
  const [top, setTop] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        try { const m = await api.getMe(); if (mounted) setMe(m) } catch { if (mounted) setMe(null) }
        const data = await api.getGameTop(selectedGame, 50) as unknown
        // data may be an array or object - api.getGameTop normalizes to array
        type ApiTopEntry = {
          username?: string
          score: number
          user_id?: string
          user?: { username?: string; name?: string; _id?: string; id?: string }
        }
        const arr = Array.isArray(data) ? data as ApiTopEntry[] : []
        if (!mounted) return
        setTop(arr.map((x) => ({ username: x.username ?? x.user?.username ?? x.user?.name, score: x.score, user_id: x.user_id ?? x.user?._id ?? x.user?.id })))
      } catch (e: unknown) {
        if (!mounted) return
        const errMsg = e instanceof Error ? e.message : (typeof e === 'string' ? e : 'Error cargando leaderboard')
        setError(errMsg)
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
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="w-9 h-9 text-sky-400" />
            <h1 className="text-4xl font-bold bg-linear-to-r from-sky-400 via-blue-300 to-sky-500 bg-clip-text text-transparent">
              Ranking Global
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-12">Compite con los mejores jugadores en cada juego</p>
        </header>

        {/* Game selector */}
        <div className="mb-8 bg-slate-900/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-amber-400" />
              <label className="text-lg font-semibold text-slate-200">Selecciona un juego</label>
            </div>
            <select 
              value={selectedGame} 
              onChange={(e)=>setSelectedGame(e.target.value)} 
              className="bg-slate-800/80 border border-slate-600 text-slate-100 px-4 py-2.5 rounded-lg w-full md:w-64 font-medium hover:border-sky-500/50 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            >
              {GAME_OPTIONS.map(g => <option key={g.slug} value={g.slug}>{g.label}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* User's rank card */}
        {myRank ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-xl bg-linear-to-r from-emerald-500/10 via-emerald-600/5 to-sky-500/10 border-2 border-emerald-500/40 backdrop-blur-sm shadow-xl shadow-emerald-500/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <UserCircleIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="text-sm text-emerald-300 font-medium mb-1">Tu posición en {GAME_OPTIONS.find(g => g.slug === selectedGame)?.label}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-white">#{myRank.rank}</div>
                    <div className="text-xl text-slate-200">{myRank.entry.username ?? 'Tú'}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black bg-linear-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  {myRank.entry.score.toLocaleString()}
                </div>
                <div className="text-sm text-emerald-300 font-medium">puntos</div>
              </div>
            </div>
          </motion.div>
        ) : !loading && (
          <div className="mb-6 p-5 rounded-xl bg-slate-900/30 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-2xl">📊</span>
              <span>No estás en el top {top.length > 0 ? top.length : 50} de este juego. ¡Sigue jugando para entrar!</span>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <section className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/40 backdrop-blur-sm shadow-2xl">
          {/* Table header */}
          <div className="px-6 py-5 border-b border-slate-700/50 bg-linear-to-r from-slate-800/80 to-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-100 font-bold text-lg">
                <TrophyIcon className="w-6 h-6 text-amber-400" />
                <span>Top Jugadores — {GAME_OPTIONS.find(g => g.slug === selectedGame)?.label}</span>
              </div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wide">Puntos</div>
            </div>
          </div>

          {/* Table body */}
          <ul>
            {loading ? (
              Array.from({ length: 10 }).map((_,i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-6 py-5 border-t border-slate-800/50">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-800/60 rounded-xl animate-pulse" />
                    <div>
                      <div className="h-5 w-40 bg-slate-800/60 rounded animate-pulse mb-2" />
                      <div className="h-3 w-24 bg-slate-800/60 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-7 w-20 bg-slate-800/60 rounded animate-pulse" />
                </li>
              ))
            ) : (
              <AnimatePresence initial={false}>
                {top.map((p, idx) => {
                  const rank = idx + 1
                  const isTop3 = rank <= 3
                  const isCurrentUser = String(p.user_id) === String(me?.id ?? me?._id)
                  const medalConfig = {
                    1: { emoji: '🥇', bg: 'bg-linear-to-br from-yellow-400 to-amber-500', text: 'text-slate-900', glow: 'shadow-yellow-500/40' },
                    2: { emoji: '🥈', bg: 'bg-linear-to-br from-slate-300 to-slate-400', text: 'text-slate-900', glow: 'shadow-slate-400/40' },
                    3: { emoji: '🥉', bg: 'bg-linear-to-br from-amber-600 to-amber-700', text: 'text-white', glow: 'shadow-amber-600/40' }
                  }
                  const medal = isTop3 ? medalConfig[rank as 1 | 2 | 3] : null

                  return (
                    <motion.li
                      key={`${p.user_id ?? p.username}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className={`flex items-center justify-between gap-4 px-6 py-5 border-t border-slate-800/50
                        ${isTop3 ? 'bg-slate-800/30' : 'bg-transparent'}
                        ${isCurrentUser ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500' : ''}
                        hover:bg-slate-800/50 transition-all duration-200`}
                    >
                      <div className="flex items-center gap-5">
                        {/* Rank badge */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl
                          ${medal ? `${medal.bg} ${medal.text} shadow-lg ${medal.glow}` : 'bg-slate-700/60 text-slate-300 border border-slate-600'}`}
                        >
                          {medal ? medal.emoji : `#${rank}`}
                        </div>

                        {/* Player info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`font-bold text-lg ${isCurrentUser ? 'text-emerald-300' : 'text-slate-100'}`}>
                              {p.username ?? 'Anónimo'}
                            </div>
                            {isTop3 && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">Top {rank}</span>}
                            {isCurrentUser && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">Tú</span>}
                          </div>
                          {p.user_id && <div className="text-xs text-slate-500 font-mono mt-1">ID: {String(p.user_id).slice(0,8)}</div>}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={`text-2xl font-black ${isCurrentUser ? 'text-emerald-400' : isTop3 ? 'text-amber-300' : 'text-slate-100'}`}>
                          {p.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">pts</div>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            )}
          </ul>

          {/* Empty state */}
          {!loading && top.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <div className="text-xl text-slate-300 mb-2">No hay datos disponibles</div>
              <div className="text-slate-500">Sé el primero en jugar y establecer un récord</div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
