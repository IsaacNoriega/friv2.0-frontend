import React from 'react'
import { useNavigate } from 'react-router-dom'

const games = [
  { title: 'Memorama', desc: 'Empareja las cartas lo más rápido posible', record: '--', colorFrom: '#ff9a2b', colorTo: '#d85f00', route: '/memorama' },
  { title: 'Black Jack', desc: 'Juega al clásico Black Jack contra el dealer', record: '--', colorFrom: '#1f2937', colorTo: '#111827', route: '/blackjack' },
  { title: 'Flappy Bird', desc: 'Evita los obstáculos y mantén al pájaro en vuelo', record: '--', colorFrom: '#06b6d4', colorTo: '#0891b2', route: '/flappy' },
  { title: '2048', desc: 'Combina fichas y llega a 2048', record: '--', colorFrom: '#f59e0b', colorTo: '#d97706', route: '/2048' },
  { title: 'Tetris', desc: 'Ordena las piezas para completar líneas', record: '--', colorFrom: '#06b6d4', colorTo: '#7c3aed', route: '/tetris' },
  { title: 'Pacman', desc: 'Come puntos y evita fantasmas', record: '--', colorFrom: '#f97316', colorTo: '#ef4444', route: '/pacman' },
  { title: 'Ahorcado', desc: 'Adivina la palabra antes de colgarte', record: '--', colorFrom: '#10b981', colorTo: '#047857', route: '/ahorcado' },
  { title: 'Buscaminas', desc: 'Encuentra las minas sin explotarlas', record: '--', colorFrom: '#ef4444', colorTo: '#b91c1c', route: '/minesweeper' },
  { title: 'Snake', desc: 'Crece evitando chocar', record: '--', colorFrom: '#16a34a', colorTo: '#0b8a3a', route: '/snake' },
  { title: 'Battle Ship', desc: 'Hundir los barcos del oponente (tal vez)', record: '--', colorFrom: '#0ea5e9', colorTo: '#0369a1', route: '/battleship' },
  { title: 'Conecta 4', desc: 'Conecta 4 fichas en línea', record: '--', colorFrom: '#f97316', colorTo: '#d97706', route: '/connect4' },
  { title: 'Sudoku', desc: 'Completa la cuadrícula sin repetir números', record: '--', colorFrom: '#7c3aed', colorTo: '#6d28d9', route: '/sudoku' },
  { title: 'Show Down', desc: 'Minijuego competitivo (placeholder)', record: '--', colorFrom: '#f43f5e', colorTo: '#ef4444', route: '/showdown' },
  { title: 'Simón dice', desc: 'Repite la secuencia de colores y sonidos', record: '--', colorFrom: '#84cc16', colorTo: '#16a34a', route: '/simondice' },
  { title: 'Clicker', desc: 'Clickea para ganar puntos', record: '--', colorFrom: '#f59e0b', colorTo: '#f97316', route: '/clicker' },
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
