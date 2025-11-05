import React from 'react'

type ScoreItem = {
  id: number
  game: string
  score: number
  date?: string
}

const myScores: ScoreItem[] = [
  { id: 1, game: 'Snake', score: 1240, date: '2025-11-04' },
  { id: 2, game: 'Tetris', score: 980, date: '2025-10-30' },
  { id: 3, game: 'Pac-Run', score: 2140, date: '2025-09-12' },
]

export default function Score(){
  return (
    <main className="p-8 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2">Mis Scores</h2>
        <p className="text-slate-400 mb-6">Tus puntajes personales (demo).</p>

        <div className="space-y-4">
          {myScores.length ? (
            myScores.map(item => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {item.game.split(' ').map(w => w[0]).slice(0,2).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{item.game}</div>
                    <div className="text-sm text-slate-400">{item.date}</div>
                  </div>
                </div>

                <div className="text-right mt-3 sm:mt-0">
                  <div className="text-2xl font-bold text-emerald-400">{item.score}</div>
                  <div className="text-sm text-slate-400">Puntos</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400">No tienes scores todavía.</div>
          )}
        </div>
      </div>
    </main>
  )
}
