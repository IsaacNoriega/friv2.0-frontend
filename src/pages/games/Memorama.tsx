import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, ClockIcon, CursorArrowRaysIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

type Card = {
  id: number;
  symbol: string;
  matched: boolean;
};

const SYMBOLS = ["🍎", "🍌", "🍇", "🍓", "🍊", "🍍", "🥝", "🍑", "🥥", "🍉", "🥭", "🍒"];

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoramaPorRondas() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false);
  const { submitScore, error: scoreError, bestScore } = useGameScore('memorama');
  const { isMuted, toggleMute } = useBackgroundMusic();

  // Construir mazo según ronda
  function buildDeck(r: number) {
    const pairs = Math.min(6 + r * 2, SYMBOLS.length); // más dificultad
    const pick = SYMBOLS.slice(0, pairs);
    const deck = pick.flatMap((s, idx) => [
      { id: idx * 2, symbol: s, matched: false },
      { id: idx * 2 + 1, symbol: s, matched: false },
    ]);
    return shuffle(deck);
  }

  function startRound(r = 1) {
    const deck = buildDeck(r);
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setStartedAt(Date.now());
    setTime(0);
    setRoundFinished(false);
  }

  function startGame() {
    setGameStarted(true);
    setRound(1);
    setScore(0);
    startRound(1);
  }

  // Temporizador
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    if (startedAt && gameStarted && !roundFinished) {
      t = setInterval(() => setTime(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [startedAt, gameStarted, roundFinished]);

  // Comparar cartas
  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (cards[a].symbol === cards[b].symbol) {
        setCards((prev) =>
          prev.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c
          )
        );
        setFlipped([]);
        setScore((s) => s + 10);
      } else {
        setScore((s) => s - 5);
        const t = setTimeout(() => setFlipped([]), 800);
        return () => clearTimeout(t);
      }
      setMoves((m) => m + 1);
    }
  }, [flipped, cards]);

  // Detectar fin de ronda
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched) && !roundFinished) {
      const roundBonus = 100;
      setScore(currentScore => currentScore + roundBonus);
      setRoundFinished(true);
      setStartedAt(null);
    }
  }, [cards, roundFinished]);

  // Guardar puntuación cuando termina la ronda
  useEffect(() => {
    if (roundFinished && score > 0 && (bestScore === null || score > bestScore)) {
      submitScore(score).catch(console.error);
    }
  }, [roundFinished, score, submitScore, bestScore]);

  // Clic en carta
  function onCardClick(index: number) {
    if (flipped.includes(index)) return;
    if (cards[index].matched) return;
    if (flipped.length === 2) return;
    setFlipped((prev) => [...prev, index]);
  }

  const cols = useMemo(
    () => ({ gridTemplateColumns: "repeat(4, minmax(120px, 1fr))" }),
    []
  );

  // ---------- UI ----------

  if (!gameStarted) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">🎴</div>
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            Memorama
          </h1>
          <p className="text-slate-400 mb-6">Avanza por rondas, ¡gana puntos y demuestra tu memoria!</p>
          <button
            onClick={startGame}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 text-white text-lg font-black hover:from-purple-600 hover:to-pink-700 transition-all shadow-2xl shadow-purple-500/30"
          >
            ▶ Empezar Juego
          </button>
        </motion.div>
      </main>
    );
  }

  if (roundFinished) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black mb-3 text-purple-400">
            ¡Ronda {round} completada!
          </h2>
          <div className="mb-6">
            <div className="text-sm text-slate-400 mb-1">Puntaje total</div>
            <div className="text-4xl font-black bg-linear-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              {score.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => {
              const nextRound = round + 1;
              setRound(nextRound);
              startRound(nextRound);
            }}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 text-white text-lg font-black hover:from-purple-600 hover:to-pink-700 transition-all shadow-2xl shadow-purple-500/30"
          >
            ▶ Siguiente Ronda
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
              <div className="text-5xl">🎴</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-purple-400 via-pink-300 to-purple-500 bg-clip-text text-transparent">
                Memorama
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
                <SpeakerWaveIcon className="w-6 h-6 text-purple-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Encuentra todas las parejas de cartas</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4 h-full">
              
              {/* Round Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-purple-400" />
                  <span className="text-sm text-slate-400">Ronda</span>
                </div>
                <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg">
                  <span className="text-2xl font-black text-purple-300">{round}</span>
                </div>
              </div>

              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-purple-500/10 to-pink-600/5 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">Puntaje</span>
                  <FireIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-4xl font-black bg-linear-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                  {score.toLocaleString()}
                </div>
                {bestScore !== null && (
                  <div className="text-xs text-slate-400 mt-1">
                    Récord: {bestScore.toLocaleString()}
                  </div>
                )}
                {scoreError && <div className="text-red-400 text-xs mt-1">{scoreError}</div>}
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CursorArrowRaysIcon className="w-4 h-4 text-cyan-400" />
                    <div className="text-slate-500 text-xs">Movimientos</div>
                  </div>
                  <div className="font-semibold text-white text-lg">{moves}</div>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="w-4 h-4 text-amber-400" />
                    <div className="text-slate-500 text-xs">Tiempo</div>
                  </div>
                  <div className="font-semibold text-white text-lg">{time}s</div>
                </div>
              </div>

              <EndGameButton onEnd={() => {
                if (bestScore === null || score > bestScore) {
                  submitScore(score);
                }
              }} />
            </div>
          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 h-full flex items-center justify-center">
              <div className="grid gap-4" style={cols as React.CSSProperties}>
                <AnimatePresence>
                  {cards.map((c, i) => {
                    const isFlipped = flipped.includes(i) || c.matched;
                    return (
                      <motion.button
                        key={c.id}
                        onClick={() => onCardClick(i)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        whileHover={{ scale: isFlipped ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`h-32 w-full rounded-xl flex items-center justify-center text-5xl transition-all duration-300 ${
                          isFlipped
                            ? "bg-linear-to-br from-purple-500/20 to-pink-500/10 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                            : "bg-slate-800/60 border-2 border-slate-700/50 hover:border-purple-500/30"
                        }`}
                      >
                        <motion.span
                          initial={false}
                          animate={{
                            rotateY: isFlipped ? 0 : 90,
                            opacity: isFlipped ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {c.symbol}
                        </motion.span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
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
            title="Cómo Jugar Memorama"
            description="Encuentra todos los pares de cartas iguales. Haz clic en dos cartas para voltearlas. Si coinciden, permanecen descubiertas. Si no, se voltean de nuevo. ¡Memoriza las posiciones para ganar más rápido!"
            controls={[
              { key: 'Clic', action: 'Voltear carta' }
            ]}
            note="Intenta completar el juego en el menor número de movimientos posible."
          />
        </motion.div>

      </div>
    </main>
  );
}
