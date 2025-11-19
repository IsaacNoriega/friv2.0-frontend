import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftIcon, ArrowRightIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/solid'
import { api } from '../services/api'

type ScoreItem = {
  game: string
  score: number
  date?: string
}

export default function Score(){
  const [myScores, setMyScores] = useState<ScoreItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 5
  const pageCount = Math.max(1, Math.ceil(myScores.length / PAGE_SIZE))

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Prefer a dedicated backend endpoint that returns all scores for the authenticated user
        let data: unknown = null
        try {
          data = await api.getMyScores()
        } catch {
          if (mounted) setError('Inicia sesión para ver tus scores')
          setLoading(false)
          return
        }

        // Normalize backend shape: { user: id, scores: [ { name, score, createdAt } ] }
        const payload = data as Record<string, unknown>
        const scoresArr = Array.isArray(payload.scores) ? payload.scores as unknown[] : []
        const mapped: ScoreItem[] = scoresArr.map((s) => {
          const r = s as Record<string, unknown>
          const game = (r.name ?? r.game ?? 'unknown') as string
          const scoreVal = typeof r.score === 'number' ? r.score : Number(r.score ?? r.points ?? r.value ?? 0)
          const dateVal = (r.createdAt ?? r.date ?? r.ts) as string | undefined
          return { game, score: Number(scoreVal || 0), date: dateVal }
        })

        if (!mounted) return
        setMyScores(mapped)
      } catch (e: unknown) {
        if (!mounted) return
        setError((e as Error).message || 'Error cargando scores')
      } finally { if (mounted) setLoading(false) }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-5xl mx-auto">
        {/* Header with gradient effect */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrophyIcon className="w-8 h-8 text-amber-400" />
            <h2 className="text-4xl font-bold bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Mis Scores
            </h2>
          </div>
          <p className="text-slate-400 text-lg ml-11">Tus mejores puntajes en cada juego</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 text-slate-400 py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <span>Cargando tus scores...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Stats summary */}
        {!loading && myScores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-linear-to-br from-sky-500/10 to-sky-600/5 border border-sky-500/30 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="text-sm text-sky-300 mb-1">Total Juegos</div>
              <div className="text-3xl font-bold text-white">{myScores.length}</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="text-sm text-emerald-300 mb-1">Score Más Alto</div>
              <div className="text-3xl font-bold text-white">{Math.max(...myScores.map(s => s.score))}</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="text-sm text-amber-300 mb-1">Promedio</div>
              <div className="text-3xl font-bold text-white">
                {Math.round(myScores.reduce((acc, s) => acc + s.score, 0) / myScores.length)}
              </div>
            </motion.div>
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center justify-between mb-6 bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-sm text-slate-300">
            Mostrando <span className="font-semibold text-white">{Math.min(myScores.length, PAGE_SIZE * (page + 1)) - PAGE_SIZE * page}</span> de <span className="font-semibold text-white">{myScores.length}</span> puntajes
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
              Página {Math.min(page + 1, pageCount)} / {pageCount}
            </div>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              title="Anterior"
              className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-sky-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={(page + 1) * PAGE_SIZE >= myScores.length}
              title="Siguiente"
              className="p-2.5 rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scores list */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeleton: show PAGE_SIZE placeholders
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 h-24" />
            ))
          ) : myScores.length ? (
            <AnimatePresence initial={false} mode="popLayout">
              {myScores.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item, idx) => {
                const rank = page * PAGE_SIZE + idx + 1
                const isTop3 = rank <= 3
                const medalConfig = {
                  1: { bg: 'bg-linear-to-br from-yellow-400 to-amber-500', text: 'text-slate-900', icon: '🥇', glow: 'shadow-yellow-500/50' },
                  2: { bg: 'bg-linear-to-br from-slate-300 to-slate-400', text: 'text-slate-900', icon: '🥈', glow: 'shadow-slate-400/50' },
                  3: { bg: 'bg-linear-to-br from-amber-600 to-amber-700', text: 'text-white', icon: '🥉', glow: 'shadow-amber-600/50' }
                }
                const medal = isTop3 ? medalConfig[rank as 1 | 2 | 3] : null
                
                return (
                  <motion.div
                    key={`${page}-${idx}-${item.game}-${item.score}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`relative overflow-hidden flex items-center justify-between 
                      ${isTop3 
                        ? 'bg-linear-to-r from-slate-800/90 via-slate-800/70 to-slate-900/90' 
                        : 'bg-linear-to-r from-slate-900/60 to-slate-800/40'
                      } 
                      border ${isTop3 ? 'border-amber-500/40' : 'border-slate-700/50'} 
                      rounded-xl p-5 backdrop-blur-sm hover:scale-[1.02] hover:border-sky-500/60 
                      transition-all duration-300 shadow-lg ${isTop3 ? medal!.glow + ' shadow-lg' : ''}`}
                  >
                    {/* Background decoration for top 3 */}
                    {isTop3 && (
                      <div className="absolute top-0 right-0 opacity-5">
                        <TrophyIcon className="w-32 h-32 -mr-8 -mt-8" />
                      </div>
                    )}

                    <div className="flex items-center gap-5 z-10">
                      {/* Rank badge */}
                      <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl 
                        ${medal ? `${medal.bg} ${medal.text} shadow-xl ${medal.glow}` : 'bg-slate-700/80 text-slate-200 border border-slate-600'}`}
                      >
                        {isTop3 ? medal!.icon : rank}
                        {rank === 1 && <FireIcon className="absolute -top-1 -right-1 w-5 h-5 text-orange-500" />}
                      </div>
                      
                      {/* Game info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-xl text-white capitalize">{item.game}</div>
                          {isTop3 && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">Top {rank}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Score display */}
                    <div className="text-right z-10">
                      <div className={`text-4xl font-black ${isTop3 ? 'bg-linear-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent' : 'text-emerald-400'}`}>
                        {item.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400 font-medium">puntos</div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-12 text-center backdrop-blur-sm"
            >
              <div className="text-6xl mb-4">🎮</div>
              <div className="text-xl text-slate-300 mb-2">No hay scores aún</div>
              <div className="text-slate-500">¡Empieza a jugar para ver tus puntajes aquí!</div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
