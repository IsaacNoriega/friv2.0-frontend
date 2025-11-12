import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
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
    <main className="p-8 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2">Mis Scores</h2>
        <p className="text-slate-400 mb-6">Tus puntajes personales (desde el backend).</p>

        {loading && <div className="text-slate-400">Cargando...</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-400">Mostrando {Math.min(myScores.length, PAGE_SIZE * (page + 1)) - PAGE_SIZE * page} de {myScores.length} puntajes</div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">Página {Math.min(page + 1, pageCount)} / {pageCount}</div>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              title="Anterior"
              className="p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={(page + 1) * PAGE_SIZE >= myScores.length}
              title="Siguiente"
              className="p-2 rounded-md bg-emerald-500 text-white font-semibold disabled:opacity-40"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            // Loading skeleton: show PAGE_SIZE placeholders
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-800/60 border border-slate-700 rounded-lg p-4 h-20" />
            ))
          ) : myScores.length ? (
            <AnimatePresence initial={false} mode="popLayout">
              {myScores.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item, idx) => {
                const rank = page * PAGE_SIZE + idx + 1
                const medalClass = rank === 1 ? 'bg-yellow-400 text-slate-900' : rank === 2 ? 'bg-slate-300 text-slate-900' : rank === 3 ? 'bg-amber-200 text-slate-900' : 'bg-slate-700 text-slate-200'
                return (
                  <motion.div
                    key={`${page}-${idx}-${item.game}-${item.score}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-linear-to-r from-slate-900/80 to-slate-800/60 border border-slate-700 rounded-lg p-4 shadow-md hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center font-bold text-lg ${medalClass}`}>
                        {rank}
                      </div>
                      <div>
                        <div className="font-semibold text-white capitalize">{item.game}</div>
                        <div className="text-sm text-slate-400">{item.date ? new Date(item.date).toLocaleString() : '—'}</div>
                      </div>
                    </div>

                    <div className="text-right mt-3 sm:mt-0">
                      <div className="text-2xl font-bold text-emerald-400">{item.score}</div>
                      <div className="text-sm text-slate-400">Puntos</div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          ) : (
            <div className="text-slate-400">No se encontraron scores para tu usuario.</div>
          )}
        </div>
      </div>
    </main>
  )
}
