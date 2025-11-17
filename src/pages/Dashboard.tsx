import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
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
      'minesweeper', 'snake', 'battleship', 'connect4', 'sudoku', 'simondice', 'clicker'
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
    <main className="flex-1 p-8 bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] min-h-screen text-slate-100">
      <div className="max-w-[1400px] mx-auto">
        {/* Header with gradient and animation */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <SparklesIcon className="w-10 h-10 text-amber-400" />
            <h1 className="text-5xl font-black bg-linear-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Biblioteca de Juegos
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-13">Selecciona tu juego favorito y comienza a competir</p>
          
          {/* User status badge */}
          {isPremiumUser && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="mt-4 inline-flex items-center gap-2 bg-linear-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 rounded-full px-4 py-2 backdrop-blur-sm"
            >
              <RocketLaunchIcon className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-semibold">Acceso Premium Activo</span>
            </motion.div>
          )}

          {/* Test scores button - hidden in production */}
          {import.meta.env.DEV && (
            <div className="mt-4">
              <button
                onClick={generateTestScores}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm font-semibold transition-all"
              >
                🧪 Generar scores de prueba
              </button>
            </div>
          )}
        </motion.header>

        {/* Free games section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <GameCarousel
            title="Juegos Gratuitos"
            games={freeGames}
          />
        </motion.div>

        {/* Premium games section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GameCarousel
            title="Juegos Premium"
            games={premiumGames}
            isPremium={!isPremiumUser}
            onPremiumClick={handlePremiumClick}
          />
        </motion.div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </main>
  );
}


