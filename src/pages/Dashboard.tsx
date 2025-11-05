import React, { useState } from 'react';
import { auth } from '../utils/auth';
import GameCarousel from '../components/GameCarousel';
import PaymentModal from '../components/PaymentModal';

const freeGames = [
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

const premiumGames = [
  { title: 'Pacman', desc: 'Come puntos y evita fantasmas', record: '--', colorFrom: '#f97316', colorTo: '#ef4444', route: '/pacman' },
  { title: 'Battle Ship', desc: 'Hundir los barcos del oponente', record: '--', colorFrom: '#0ea5e9', colorTo: '#0369a1', route: '/battleship' },
  { title: 'Show Down', desc: 'Minijuego competitivo', record: '--', colorFrom: '#f43f5e', colorTo: '#ef4444', route: '/showdown' },
  { title: 'Sudoku', desc: 'Completa la cuadrícula sin repetir números', record: '--', colorFrom: '#7c3aed', colorTo: '#6d28d9', route: '/sudoku' },
  { title: 'Simón dice', desc: 'Repite la secuencia de colores y sonidos', record: '--', colorFrom: '#84cc16', colorTo: '#16a34a', route: '/simondice' },
  { title: 'Flappy Bird', desc: 'Evita los obstáculos y mantén al pájaro en vuelo', record: '--', colorFrom: '#06b6d4', colorTo: '#0891b2', route: '/flappy' },
];

export default function Dashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const isPremiumUser = auth.getUser()?.hasPaid || false;

  const handlePremiumClick = () => {
    if (!isPremiumUser) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    // El usuario ya estará actualizado por el PaymentModal
    window.location.reload(); // Recargar para mostrar juegos premium
  };

  return (
    <main className="flex-1 p-8 bg-[linear-gradient(180deg,#071123_0%,#071726_100%)] min-h-screen text-slate-100">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold mb-1">Biblioteca de Juegos</h1>
          <p className="text-slate-400">Selecciona tu juego favorito y comienza a jugar</p>
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


