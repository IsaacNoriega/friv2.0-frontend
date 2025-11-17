import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, CursorArrowRaysIcon, BoltIcon, ShoppingCartIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: () => void;
  purchased: boolean;
};

export default function Clicker() {
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [pointsPerClick, setPointsPerClick] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [gameStarted, setGameStarted] = useState(false); // pre-pantalla
  const [clickAnimation, setClickAnimation] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const { submitScore, error: scoreError} = useGameScore('clicker');
  const { isMuted, toggleMute } = useBackgroundMusic();

  // Guardar puntuación máxima
  useEffect(() => {
    if (score > maxScore) {
      setMaxScore(score);
      submitScore(score).catch(console.error);
    }
  }, [score, maxScore, submitScore]);

  // Cargar progreso
  useEffect(() => {
    const savedScore = localStorage.getItem("score");
    const savedPPC = localStorage.getItem("ppc");
    const savedAuto = localStorage.getItem("auto");
    if (savedScore) setScore(parseInt(savedScore));
    if (savedPPC) setPointsPerClick(parseInt(savedPPC));
    if (savedAuto) setAutoClickers(parseInt(savedAuto));
  }, []);

  // Guardar progreso
  useEffect(() => {
    localStorage.setItem("score", score.toString());
    localStorage.setItem("ppc", pointsPerClick.toString());
    localStorage.setItem("auto", autoClickers.toString());
  }, [score, pointsPerClick, autoClickers]);

  // Auto-click
  useEffect(() => {
    if (autoClickers > 0) {
      const interval = setInterval(() => setScore((s) => s + autoClickers), 1000);
      return () => clearInterval(interval);
    }
  }, [autoClickers]);

  // Inicializar upgrades
  useEffect(() => {
    setUpgrades([
      { id: "ppc", name: "Mano fuerte 💪", description: "Cada clic vale +1 punto adicional.", cost: 50, effect: () => setPointsPerClick((p) => p + 1), purchased: false },
      { id: "auto", name: "Click automático 🤖", description: "Ganas 1 punto por segundo automáticamente.", cost: 100, effect: () => setAutoClickers((a) => a + 1), purchased: false },
      { id: "double", name: "Click doble ⚡", description: "Duplica tus puntos por clic.", cost: 250, effect: () => setPointsPerClick((p) => p * 2), purchased: false },
      { id: "triple", name: "Click triple 🔥", description: "Triplica tus puntos por clic.", cost: 500, effect: () => setPointsPerClick((p) => p * 3), purchased: false },
      { id: "bonus", name: "Bono instantáneo 💎", description: "Recibes +100 puntos al instante.", cost: 300, effect: () => setScore((s) => s + 100), purchased: false },
      { id: "autoPlus", name: "Autoclicker avanzado 🤖⚡", description: "Incrementa los puntos por segundo en +2.", cost: 400, effect: () => setAutoClickers((a) => a + 2), purchased: false },
    ]);
  }, []);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    setScore((s) => s + pointsPerClick);
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 200);
    
    // Crear partículas
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newParticle = { id: Date.now(), x, y };
    setParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  }

  function buyUpgrade(id: string) {
    const up = upgrades.find((u) => u.id === id);
    if (!up || up.purchased || score < up.cost) return;
    setScore((s) => s - up.cost);
    up.effect();
    setUpgrades((prev) => prev.map((u) => u.id === id ? { ...u, purchased: true } : u));
  }

  function resetGame() {
    if (window.confirm("¿Reiniciar el progreso?")) {
      localStorage.clear();
      setScore(0);
      setMaxScore(0);
      setPointsPerClick(1);
      setAutoClickers(0);
      setUpgrades((prev) => prev.map((u) => ({ ...u, purchased: false })));
      setGameStarted(false);
    }
  }

  if (!gameStarted) {
    // Pre-pantalla
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">💥</div>
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-cyan-400 to-pink-300 bg-clip-text text-transparent">
            Clicker Game
          </h1>
          <p className="text-slate-400 mb-6">Haz clic para ganar puntos, compra mejoras y mejora tu puntuación</p>
          <button
            onClick={() => setGameStarted(true)}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-cyan-500 to-pink-600 text-white text-lg font-black hover:from-cyan-600 hover:to-pink-700 transition-all shadow-2xl shadow-cyan-500/30"
          >
            ▶ Empezar Juego
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-5xl">💥</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-cyan-400 via-pink-300 to-cyan-500 bg-clip-text text-transparent">
                Clicker Game
              </h1>
            </div>
            <button
              onClick={toggleMute}
              className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
              title={isMuted ? "Activar música" : "Silenciar música"}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6 text-slate-400" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6 text-cyan-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Haz clic para ganar puntos y compra mejoras</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Game */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">
              
              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-cyan-500/10 to-pink-600/5 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-cyan-300">Puntuación</span>
                  <FireIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-5xl font-black bg-linear-to-r from-cyan-400 to-pink-300 bg-clip-text text-transparent">
                  {score.toLocaleString()}
                </div>
              </div>

              {/* Max Score */}
              <div className="p-4 bg-linear-to-br from-pink-500/10 to-purple-600/5 rounded-lg border border-pink-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-pink-300">Récord de Sesión</span>
                  <TrophyIcon className="w-5 h-5 text-pink-400" />
                </div>
                <div className="text-4xl font-black text-pink-300">
                  {maxScore.toLocaleString()}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CursorArrowRaysIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400">Por clic</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-300">+{pointsPerClick}</div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <BoltIcon className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-slate-400">Auto/s</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-300">{autoClickers}</div>
                </div>
              </div>

              {scoreError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{scoreError}</p>
                </div>
              )}

              {/* Click Button */}
              <div className="relative py-8">
                <motion.button
                  onClick={handleClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  animate={clickAnimation ? { 
                    scale: [1, 1.15, 1],
                    rotate: [0, -5, 5, 0]
                  } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="relative w-full h-48 rounded-2xl bg-linear-to-br from-cyan-500 to-pink-600 text-white text-3xl font-black shadow-2xl shadow-cyan-500/50 hover:shadow-pink-500/50 transition-all overflow-hidden"
                >
                  <span className="relative z-10">¡CLIC! 💥</span>
                  
                  {/* Particles */}
                  <AnimatePresence>
                    {particles.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ 
                          x: p.x, 
                          y: p.y, 
                          scale: 1, 
                          opacity: 1 
                        }}
                        animate={{ 
                          x: p.x + (Math.random() - 0.5) * 100,
                          y: p.y - 100,
                          scale: 0,
                          opacity: 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute text-2xl pointer-events-none"
                      >
                        +{pointsPerClick}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 rounded-lg bg-linear-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Reiniciar
                </button>
              </div>

              {/* Action Button */}
              <EndGameButton onEnd={() => submitScore(score)} />
            </div>
          </motion.section>

          {/* RIGHT: Shop */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCartIcon className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-black text-cyan-300">Tienda</h2>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {upgrades.map((u, idx) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className={`p-4 rounded-lg border transition-all ${
                      u.purchased 
                        ? 'border-emerald-500/50 bg-emerald-500/10' 
                        : score >= u.cost
                        ? 'border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10'
                        : 'border-slate-700/30 bg-slate-800/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{u.name}</h3>
                        <p className="text-sm text-slate-400">{u.description}</p>
                      </div>
                      <motion.button
                        disabled={u.purchased || score < u.cost}
                        onClick={() => buyUpgrade(u.id)}
                        whileHover={!u.purchased && score >= u.cost ? { scale: 1.05 } : {}}
                        whileTap={!u.purchased && score >= u.cost ? { scale: 0.95 } : {}}
                        className={`py-2 px-4 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                          u.purchased
                            ? 'bg-emerald-600 text-white'
                            : score >= u.cost
                            ? 'bg-linear-to-r from-cyan-500 to-pink-600 text-white shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {u.purchased ? '✓ Comprado' : `${u.cost} pts`}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

        </div>

        {/* BOTTOM ROW: Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GameInstructions 
            title="Cómo Jugar Clicker"
            description="Haz clic en el botón lo más rápido que puedas para acumular puntos. Cada clic suma puntos a tu contador. ¡Intenta alcanzar la puntuación más alta en el menor tiempo posible!"
            controls={[
              { key: 'Clic', action: 'Ganar puntos' }
            ]}
            note="La velocidad y la resistencia son clave. ¿Cuántos clics puedes hacer en un minuto?"
          />
        </motion.div>

      </div>
    </main>
  );
}
