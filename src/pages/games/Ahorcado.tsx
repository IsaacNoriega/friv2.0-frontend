import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, HeartIcon, LightBulbIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

const WORDS_WITH_HINTS = [
  { word: "REACT", hint: "Biblioteca de UI de Facebook" },
  { word: "JAVASCRIPT", hint: "El lenguaje principal de la web" },
  { word: "PROGRAMAR", hint: "El arte de crear software" },
  { word: "FRIV", hint: "Famoso portal de minijuegos" },
  { word: "JUEGO", hint: "Actividad para divertirse" },
  { word: "ARQUITECTURA", hint: "Diseño estructural de un sistema" },
  { word: "TAILWIND", hint: "Framework de CSS basado en utilidad" },
  { word: "VITE", hint: "Herramienta de 'build' ultra rápida" },
  { word: "COMPONENTE", hint: "Bloque de construcción de UI" },
  { word: "HOOKS", hint: "Permiten usar estado en funciones de React" },
  { word: "FRAMER", hint: "Biblioteca de animación para React" },
  { word: "ESTADO", hint: "La 'memoria' de un componente" },
  { word: "FUNCION", hint: "Un bloque de código reutilizable" },
  { word: "TYPESCRIPT", hint: "JavaScript con súper-poderes de tipado" },
];

const LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

function pickWord() {
  return WORDS_WITH_HINTS[Math.floor(Math.random() * WORDS_WITH_HINTS.length)];
}


const HEAD_SVG = (
  <circle cx="165" cy="70" r="25" stroke="white" strokeWidth="4" fill="transparent" key="head-svg" />
);

const BODY_SVG = (
  <line x1="165" y1="95" x2="165" y2="150" stroke="white" strokeWidth="4" key="body-svg" />
);

const RIGHT_ARM_SVG = (
  <line x1="165" y1="105" x2="200" y2="135" stroke="white" strokeWidth="4" key="r-arm-svg" />
);

const LEFT_ARM_SVG = (
  <line x1="165" y1="105" x2="130" y2="135" stroke="white" strokeWidth="4" key="l-arm-svg" />
);

const RIGHT_LEG_SVG = (
  <line x1="165" y1="150" x2="190" y2="195" stroke="white" strokeWidth="4" key="r-leg-svg" />
);

const LEFT_LEG_SVG = (
  <line x1="165" y1="150" x2="140" y2="195" stroke="white" strokeWidth="4" key="l-leg-svg" />
);

const BODY_PARTS_SVG = [HEAD_SVG, BODY_SVG, RIGHT_ARM_SVG, LEFT_ARM_SVG, RIGHT_LEG_SVG, LEFT_LEG_SVG];

type HangmanDrawingProps = {
  numberOfGuesses: number;
};

function HangmanDrawing({ numberOfGuesses }: HangmanDrawingProps) {
  return (
    <div className="w-full h-72 mb-6 flex justify-center items-center">
      <svg width="280" height="280" viewBox="0 0 250 250" className="drop-shadow-2xl">
        {/* Base */}
        <line x1="10" y1="240" x2="150" y2="240" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        {/* Pole */}
        <line x1="80" y1="240" x2="80" y2="20" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        {/* Top bar */}
        <line x1="80" y1="20" x2="165" y2="20" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        {/* Rope */}
        <line x1="165" y1="20" x2="165" y2="45" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

        {/* Body parts with gradient colors */}
        {BODY_PARTS_SVG.slice(0, numberOfGuesses).map((part, i) => (
          <motion.g
            key={`part-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring" }}
          >
            {part}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}


export default function AhorcadoArcade() {
  const [word, setWord] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { submitScore, error: scoreError, bestScore } = useGameScore('ahorcado');
  const { isMuted, toggleMute } = useBackgroundMusic();

  const startGame = () => {
    const { word, hint } = pickWord();
    setWord(word);
    setHint(hint);
    setGuessed(new Set());
    setWrong(0);
    setScore(0);
    setRound(1);
    setGameOver(false);
    setGameStarted(true);
  };

  const restart = () => startGame();

  const guess = useCallback(
    (l: string) => {
      if (!word || gameOver || won) return;
      setGuessed(prev => {
        if (prev.has(l)) return prev;
        const next = new Set(prev);
        next.add(l);
        return next;
      });
      if (!word.includes(l)) setWrong(w => w + 1);
    },
    [word, gameOver]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(k)) guess(k);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [guess]);

  const revealed = word?.split("").map(ch => guessed.has(ch) ? ch : "_").join(" ") || "";

  const won = word ? word.split("").every(ch => guessed.has(ch)) : false;
  const lost = wrong >= MAX_WRONG;

  useEffect(() => {
    if (won && !gameOver) {
      const roundBonus = 100;
      const errorPenalty = wrong * 10;
      const roundScore = Math.max(10, roundBonus - errorPenalty);

      const timeout = setTimeout(() => {
        const newTotalScore = score + roundScore;
        setScore(newTotalScore);
        setRound(r => r + 1);

        const { word, hint } = pickWord();
        setWord(word);
        setHint(hint);
        setGuessed(new Set());
        setWrong(0);

        if (newTotalScore > (bestScore || 0)) {
          submitScore(newTotalScore).catch(console.error);
        }
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [won, gameOver, wrong, score, submitScore, bestScore]);

  useEffect(() => {
    if (lost && !gameOver) {
      setGameOver(true);
      // Solo guardar si es primera vez o supera el mejor puntaje
      if (bestScore === null || score > bestScore) {
        submitScore(score).catch(console.error);
      }
    }
  }, [lost, score, submitScore, gameOver, bestScore]);


  if (!gameStarted) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">🎯</div>
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-rose-400 to-orange-300 bg-clip-text text-transparent">
            Ahorcado Arcade
          </h1>
          <p className="text-slate-400 mb-6">Adivina tantas palabras como puedas y gana puntos</p>
          <button
            onClick={startGame}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-rose-500 to-orange-600 text-white text-lg font-black hover:from-rose-600 hover:to-orange-700 transition-all shadow-2xl shadow-rose-500/30"
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
              <div className="text-5xl">🎯</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-rose-400 via-orange-300 to-rose-500 bg-clip-text text-transparent">
                Ahorcado
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
                <SpeakerWaveIcon className="w-6 h-6 text-rose-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Adivina la palabra antes de que se complete el dibujo</p>
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
                  <TrophyIcon className="w-6 h-6 text-rose-400" />
                  <span className="text-sm text-slate-400">Ronda</span>
                </div>
                <div className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 rounded-lg">
                  <span className="text-2xl font-black text-rose-300">{round}</span>
                </div>
              </div>

              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-rose-500/10 to-orange-600/5 rounded-lg border border-rose-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-rose-300">Puntos</span>
                  <FireIcon className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-4xl font-black bg-linear-to-r from-rose-400 to-orange-300 bg-clip-text text-transparent">
                  {score.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Récord: {(bestScore ?? 0).toLocaleString()}
                </div>
                {scoreError && <div className="text-red-400 text-xs mt-1">{scoreError}</div>}
              </div>

              {/* Errors */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Intentos restantes</span>
                  <HeartIcon className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: MAX_WRONG }).map((_, i) => (
                    <HeartIcon 
                      key={i} 
                      className={`w-6 h-6 ${i < (MAX_WRONG - wrong) ? 'text-red-500' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Hint */}
              <div className="p-4 bg-linear-to-br from-amber-500/10 to-yellow-600/5 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <LightBulbIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-amber-300 font-medium">Pista</span>
                </div>
                <p className="text-slate-300 text-sm italic">
                  {gameOver ? `La palabra era: ${word}` : hint}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {gameOver && (
                  <button 
                    onClick={restart}
                    className="flex-1 py-3 rounded-lg bg-linear-to-r from-rose-500 to-orange-600 text-white font-bold hover:from-rose-600 hover:to-orange-700 transition-all shadow-lg shadow-rose-500/20"
                  >
                    🔄 Reiniciar
                  </button>
                )}
                <EndGameButton onEnd={() => {
                  if (bestScore === null || score > bestScore) {
                    submitScore(score);
                  }
                }} />
              </div>

              {/* Status Messages */}
              <AnimatePresence mode="wait">
                {won && !gameOver && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <span className="text-lg font-bold text-green-400">¡Correcto! Siguiente ronda...</span>
                    </div>
                  </motion.div>
                )}
                {gameOver && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💀</span>
                      <span className="text-lg font-bold text-red-400">Fin del Juego</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">Puntaje final: {score}</p>
                    <button
                      onClick={() => { newRound(); setScore(0); setRound(1); }}
                      className="w-full py-2 rounded-lg bg-linear-to-r from-rose-500 to-orange-600 text-white font-bold hover:from-rose-600 hover:to-orange-700 transition-all shadow-lg shadow-rose-500/20"
                    >
                      🔄 Jugar de Nuevo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full flex flex-col">
              
              {/* Hangman Drawing */}
              <HangmanDrawing numberOfGuesses={wrong} />

              {/* Word Display */}
              <div className="mb-6 text-center">
                <motion.h2 
                  key={revealed}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-mono tracking-widest font-bold text-white"
                >
                  {revealed}
                </motion.h2>
              </div>

              {/* Letter Grid */}
              <div className="flex flex-wrap gap-2 justify-center">
                {LETTERS.map(l => {
                  const used = guessed.has(l);
                  const correct = word?.includes(l);

                  return (
                    <motion.button
                      key={l}
                      whileHover={{ scale: used || gameOver || won ? 1 : 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => guess(l)}
                      disabled={used || gameOver || won}
                      className={`
                        w-11 h-11 rounded-lg font-black text-lg transition-all shadow-lg
                        ${
                          used
                            ? (correct 
                                ? "bg-linear-to-br from-green-500 to-emerald-600 text-white ring-2 ring-green-400" 
                                : "bg-slate-700/40 text-slate-500 opacity-40")
                            : "bg-slate-700/60 hover:bg-slate-600 text-white border border-slate-600 hover:border-rose-500/50"
                        }
                        disabled:cursor-not-allowed
                      `}
                    >
                      {l}
                    </motion.button>
                  );
                })}
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
            title="Cómo Jugar Ahorcado"
            description="Adivina la palabra oculta letra por letra. Cada letra incorrecta dibuja una parte del ahorcado. Tienes 6 intentos antes de perder. Usa la pista para ayudarte."
            controls={[
              { key: 'Clic / Teclado', action: 'Seleccionar letra' }
            ]}
            note="Ganas puntos por cada ronda. ¡Los errores te restan puntos de bonificación!"
          />
        </motion.div>

      </div>
    </main>
  );
}
