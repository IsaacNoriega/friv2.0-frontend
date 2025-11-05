import React from 'react'
import { useNavigate } from 'react-router-dom'

const games = [
  { title: 'Memorama', desc: 'Empareja las cartas lo más rápido posible', record: '--', colorFrom: '#ff9a2b', colorTo: '#d85f00', route: '/memorama' },
  { title: 'Black Jack', desc: 'Juega al clásico Black Jack contra el dealer', record: '--', colorFrom: '#1f2937', colorTo: '#111827', route: '/blackjack' },
  { title: 'Space Invaders', desc: 'Defiende la Tierra de invasores alienígenas', record: '15,420', colorFrom: '#0fb6ff', colorTo: '#0077d6', route: '' },
  { title: 'Pac Runner', desc: 'Corre por el laberinto y come todas las píldoras', record: '28,900', colorFrom: '#ff9a2b', colorTo: '#d85f00', route: '' },
  { title: 'Neon Racer', desc: 'Carreras a alta velocidad en la ciudad del futuro', record: '45,670', colorFrom: '#b84bff', colorTo: '#ff2a8a', route: '' },
  { title: 'Pixel Fighter', desc: 'Combate 1vs1 en el torneo definitivo', record: '12,340', colorFrom: '#f33b45', colorTo: '#c2122d', route: '' },
  { title: 'Retro Snake', desc: 'La serpiente clásica con un toque moderno', record: '8,920', colorFrom: '#16a34a', colorTo: '#0b8a3a', route: '' },
  { title: 'Galaxy Shooter', desc: 'Dispara a través del espacio sideral', record: '34,210', colorFrom: '#7c4dff', colorTo: '#5b2bff', route: '' },
]

export default function Dashboard(){
  return (
    <main className="flex-1 p-8 bg-[linear-gradient(180deg,#071123_0%,#071726_100%)] min-h-screen text-slate-100">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold mb-1">Biblioteca de Juegos</h1>
          <p className="text-slate-400">Selecciona tu juego favorito y comienza a jugar</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <article key={g.title} className="bg-[#0f2430] rounded-xl shadow-inner overflow-hidden border border-slate-800">
              <div style={{background: `linear-gradient(90deg, ${g.colorFrom}, ${g.colorTo})`}} className="h-28 rounded-t-xl flex items-center justify-center">
                {/* Placeholder graphic */}
                <div className="w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm" />
              </div>

              <div className="p-5">
                <h3 className="text-xl font-medium mb-2">{g.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{g.desc}</p>

                <div className="flex items-center gap-3 text-slate-300 mb-4">
                  <span className="text-yellow-400">🏆</span>
                  <span className="text-sm">Record: <span className="font-semibold text-white">{g.record}</span></span>
                </div>

                      <div>
                        <GameButton title={g.title} route={g.route} />
                      </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

      function GameButton({ title, route }: { title: string; route?: string }){
        const navigate = useNavigate()
        const onPlay = () => {
          if (route) navigate(route)
          else alert('Función de juego no implementada (demo)')
        }

        return (
          <button onClick={onPlay} className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-md text-white font-semibold" style={{background: `linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`}}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3v18l15-9L5 3z" stroke="currentColor" strokeWidth="0" fill="white"/></svg>
            Jugar Ahora
          </button>
        )
      }
