import React, { useMemo, useState } from 'react'

const topPlayers = [
  { initials: 'CY', name: 'CYBER_NINJA', country: 'JP', points: 125840 },
  { initials: 'PI', name: 'PIXEL_MASTER', country: 'US', points: 119230 },
  { initials: 'NE', name: 'NEON_QUEEN', country: 'KR', points: 108560 },
  { initials: 'RE', name: 'RETRO_KING', country: 'GB', points: 98740 },
  { initials: 'SP', name: 'SPACE_ACE', country: 'DE', points: 95320 },
  { initials: 'BY', name: 'BYTE_WARRIOR', country: 'BR', points: 89450 },
  { initials: 'GL', name: 'GALAXY_LORD', country: 'US', points: 82910 },
  { initials: 'SN', name: 'SNAKE_MASTER', country: 'IN', points: 79200 },
  { initials: 'PK', name: 'PIXEL_KID', country: 'MX', points: 75540 },
  { initials: 'MK', name: 'MAZE_RUNNER', country: 'CA', points: 71200 },
]

function Badge({ initials, className }: { initials: string; className?: string }){
  return (
    <div className={`${className || ''} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold`}>{initials}</div>
  )
}

export default function Ranking(){
  const [selectedGame, setSelectedGame] = useState<string>('All');

  const games = ['All', 'Space Invaders', 'Pac Runner', 'Neon Racer', 'Pixel Fighter', 'Retro Snake', 'Galaxy Shooter'];

  // Simulated players per game (in a real app this comes from backend)
  const gamePlayers: Record<string, typeof topPlayers> = {
    'Space Invaders': [topPlayers[1], topPlayers[3], topPlayers[4], topPlayers[2], topPlayers[5], topPlayers[0], topPlayers[6], topPlayers[7], topPlayers[8], topPlayers[9]],
    'Pac Runner': [topPlayers[0], topPlayers[2], topPlayers[1], topPlayers[3], topPlayers[5], topPlayers[4], topPlayers[6], topPlayers[7], topPlayers[8], topPlayers[9]],
    'Neon Racer': [topPlayers[2], topPlayers[0], topPlayers[3], topPlayers[1], topPlayers[4], topPlayers[5], topPlayers[6], topPlayers[7], topPlayers[8], topPlayers[9]],
    'Pixel Fighter': [topPlayers[3], topPlayers[4], topPlayers[1], topPlayers[0], topPlayers[2], topPlayers[5], topPlayers[6], topPlayers[7], topPlayers[8], topPlayers[9]],
    'Retro Snake': [topPlayers[4], topPlayers[5], topPlayers[6], topPlayers[1], topPlayers[2], topPlayers[0], topPlayers[3], topPlayers[7], topPlayers[8], topPlayers[9]],
    'Galaxy Shooter': [topPlayers[5], topPlayers[6], topPlayers[0], topPlayers[2], topPlayers[1], topPlayers[3], topPlayers[4], topPlayers[7], topPlayers[8], topPlayers[9]],
  };

  const players = useMemo(() => {
    if (selectedGame === 'All') return topPlayers;
    return gamePlayers[selectedGame] ?? [];
  }, [selectedGame]);

  return (
    <main className="p-8 text-slate-100">
      <div className="max-w-6xl mx-auto">
  <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Ranking Global</h1>
            <p className="text-slate-400">Los mejores jugadores del mundo</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm text-slate-300">Filtrar por juego</label>
            <select value={selectedGame} onChange={(e)=>setSelectedGame(e.target.value)} className="bg-[#08121a] border border-slate-700 text-slate-200 p-2 rounded w-full md:w-auto">
              <option>All</option>
              <option>Space Invaders</option>
              <option>Pac Runner</option>
              <option>Neon Racer</option>
              <option>Pixel Fighter</option>
              <option>Retro Snake</option>
              <option>Galaxy Shooter</option>
            </select>
          </div>
        </header>

        {/* Top 3 highlight */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* #2 */}
          <div className="rounded-xl bg-[#0f2430] p-6 flex items-center justify-center border border-slate-800">
            <div className="w-full text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center text-slate-200 text-lg mb-3">PI</div>
              <div className="text-slate-300 mb-2">#2</div>
              <div className="font-semibold text-lg">PIXEL_MASTER</div>
            </div>
          </div>

          {/* #1 - center, emphasized */}
          <div className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 p-6 flex items-center justify-center shadow-lg">
            <div className="w-full text-center text-white">
              <div className="mx-auto w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white text-xl mb-3 ring-4 ring-amber-200/30">CY</div>
              <div className="text-sm opacity-90">#1</div>
              <div className="font-semibold text-2xl mt-1">CYBER_NINJA</div>
            </div>
          </div>

          {/* #3 */}
          <div className="rounded-xl bg-[#5b1f0f] p-6 flex items-center justify-center border border-slate-800">
            <div className="w-full text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-300 text-lg mb-3">NE</div>
              <div className="text-slate-300 mb-2">#3</div>
              <div className="font-semibold text-lg">NEON_QUEEN</div>
            </div>
          </div>
        </section>

        {/* Top 10 list */}
        <section className="rounded-xl border border-slate-800 overflow-hidden bg-[#0e1b26]">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-3 text-slate-100 font-semibold">
              <span className="text-amber-300">🏆</span>
              Top 10 Jugadores
            </div>
            <div className="text-slate-400 text-sm">puntos</div>
          </div>

          <ul>
            {topPlayers.map((p, idx) => (
              <li key={p.name} className={`flex items-center justify-between gap-4 px-6 py-4 ${idx < 3 ? 'bg-[rgba(255,255,255,0.02)]' : ''} border-t border-slate-800`}> 
                <div className="flex items-center gap-4">
                  <div className="w-10 text-slate-400">{idx+1 === 1 ? '🏆' : idx+1 === 2 ? '🥈' : idx+1 === 3 ? '🥉' : `#${idx+1}`}</div>
                  <Badge initials={p.initials} className={`${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-600' : idx === 2 ? 'bg-orange-500' : 'bg-violet-600'}`} />
                  <div>
                    <div className="font-semibold text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.country} Player</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-slate-100">{p.points.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">puntos</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
