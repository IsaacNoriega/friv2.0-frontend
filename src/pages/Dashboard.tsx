import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';
import { api } from '../services/api';
import GameCarousel from '../components/GameCarousel';
import PaymentModal from '../components/PaymentModal';

// Define premium games (complex / featured). Ensure they do not appear in the free list.
const premiumGames = [
  { title: 'Pacman', desc: 'Come puntos y evita fantasmas', record: '--', colorFrom: '#f97316', colorTo: '#ef4444', route: '/pacman' },
  { title: 'Tetris', desc: 'Ordena piezas para limpiar líneas', record: '--', colorFrom: '#06b6d4', colorTo: '#7c3aed', route: '/tetris' },
  { title: 'Battle Ship', desc: 'Estrategia naval por turnos', record: '--', colorFrom: '#0ea5e9', colorTo: '#0369a1', route: '/battleship' },
  { title: 'Sudoku', desc: 'Desafío lógico por números', record: '--', colorFrom: '#7c3aed', colorTo: '#6d28d9', route: '/sudoku' },
  { title: 'Flappy Bird', desc: 'Física precisa y reflejos', record: '--', colorFrom: '#06b6d4', colorTo: '#0891b2', route: '/flappy' },
  { title: 'Show Down', desc: 'Minijuego competitivo', record: '--', colorFrom: '#f43f5e', colorTo: '#ef4444', route: '/showdown' },
];

// Free games should exclude premium titles above to avoid duplication
const freeGames = [
  { title: 'Memorama', desc: 'Empareja las cartas lo más rápido posible', record: '--', colorFrom: '#ff9a2b', colorTo: '#d85f00', route: '/memorama' },
  { title: 'Black Jack', desc: 'Juega al clásico Black Jack contra el dealer', record: '--', colorFrom: '#1f2937', colorTo: '#111827', route: '/blackjack' },
  { title: '2048', desc: 'Combina fichas y llega a 2048', record: '--', colorFrom: '#f59e0b', colorTo: '#d97706', route: '/2048' },
  { title: 'Ahorcado', desc: 'Adivina la palabra antes de colgarte', record: '--', colorFrom: '#10b981', colorTo: '#047857', route: '/ahorcado' },
  { title: 'Buscaminas', desc: 'Encuentra las minas sin explotarlas', record: '--', colorFrom: '#ef4444', colorTo: '#b91c1c', route: '/minesweeper' },
  { title: 'Snake', desc: 'Crece evitando chocar', record: '--', colorFrom: '#16a34a', colorTo: '#0b8a3a', route: '/snake' },
  { title: 'Conecta 4', desc: 'Conecta 4 fichas en línea', record: '--', colorFrom: '#f97316', colorTo: '#d97706', route: '/connect4' },
  { title: 'Simón dice', desc: 'Repite la secuencia de colores y sonidos', record: '--', colorFrom: '#84cc16', colorTo: '#16a34a', route: '/simondice' },
  { title: 'Clicker', desc: 'Clickea para ganar puntos', record: '--', colorFrom: '#f59e0b', colorTo: '#f97316', route: '/clicker' },
]

export default function Dashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(!!auth.getUser()?.hasPaid);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Record<string, unknown> | null>;
      const updated = ce.detail as ({ hasPaid?: boolean } | null);
      setIsPremiumUser(!!(updated?.hasPaid || auth.getUser()?.hasPaid));
    };
    window.addEventListener('auth:changed', handler as EventListener);
    return () => window.removeEventListener('auth:changed', handler as EventListener);
  }, []);

  // Generar scores de prueba para varios juegos (usar para testing)
  const generateTestScores = async () => {
    const games = [
      'memorama', 'blackjack', 'flappy', '2048', 'tetris', 'pacman', 'ahorcado',
      'minesweeper', 'snake', 'battleship', 'connect4', 'sudoku', 'showdown', 'simondice', 'clicker'
    ];

    const tasks = games.map((g) => {
      const randomScore = Math.floor(Math.random() * 5000) + 10;
      return api.postGameScore(g, randomScore).then(
        (res) => ({ game: g, ok: true, res }),
        (err) => ({ game: g, ok: false, err: String(err) })
      );
    });

  const results: Array<{game:string; ok:boolean; res?: unknown; err?: string}> = await Promise.all(tasks);
  const succeeded = results.filter((r) => r.ok).length;
    const failed = results.length - succeeded;
    // Mostrar resumen rápido
    alert(`Scores generados: ${succeeded} exitosos, ${failed} fallidos (revisa la consola para detalles)`);
    console.log('Resultados generación scores de prueba:', results);
  };

  const handlePremiumClick = () => {
    if (!isPremiumUser) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    // El usuario ya estará actualizado por el PaymentModal via auth.setUser
    setShowPaymentModal(false);
    setIsPremiumUser(!!auth.getUser()?.hasPaid);
  };

  return (
    <main className="flex-1 p-8 bg-[linear-gradient(180deg,#071123_0%,#071726_100%)] min-h-screen text-slate-100">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold mb-1">Biblioteca de Juegos</h1>
          <p className="text-slate-400">Selecciona tu juego favorito y comienza a jugar</p>
          <div className="mt-3">
            <button
              onClick={generateTestScores}
              className="px-3 py-1 bg-green-500 hover:bg-green-400 rounded text-black text-sm font-semibold"
            >
              Generar scores de prueba
            </button>
          </div>
        </header>

        <GameCarousel
          title="Juegos Gratuitos"
          games={freeGames}
        />

        <GameCarousel
          title="Juegos Premium"
          games={premiumGames}
          isPremium={!isPremiumUser}
          onPremiumClick={handlePremiumClick}
        />
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </main>
  );
}


