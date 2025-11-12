import { useEffect, useState, useCallback } from "react";
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

const WORDS = [
  "REACT","JAVASCRIPT","PROGRAMAR","FRIV","JUEGO","ARQUITECTURA",
  "TAILWIND","VITE","COMPONENTE","HOOKS","FRAMER","ESTADO","FUNCION","TYPESCRIPT",
];

const LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function AhorcadoArcade() {
  const [word, setWord] = useState<string | null>(null);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { submitScore, error: scoreError, bestScore } = useGameScore('ahorcado');

  // Iniciar juego
  const startGame = () => {
    setWord(pickWord());
    setGuessed(new Set());
    setWrong(0);
    setScore(0);
    setRound(1);
    setGameOver(false);
    setGameStarted(true);
  };

  // Reiniciar ronda / juego
  const restart = () => startGame();

  // Lógica de adivinanza
  const guess = useCallback(
    (l: string) => {
      if (!word || gameOver) return;
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

  // Teclado físico
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

  // Avanzar de ronda si gana
  useEffect(() => {
    if (won && !gameOver) {
      const roundBonus = 100;
      const errorPenalty = wrong * 10;
      const roundScore = roundBonus - errorPenalty;
      const timeout = setTimeout(() => {
        setScore(s => s + roundScore);
        setRound(r => r + 1);
        setWord(pickWord());
        setGuessed(new Set());
        setWrong(0);
        submitScore(score + roundScore).catch(console.error);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [won, gameOver, wrong, score, submitScore]);

  // Terminar juego si pierde
  useEffect(() => {
    if (lost) {
      setGameOver(true);
      submitScore(score).catch(console.error);
    }
  }, [lost, score, submitScore]);

  // ---------- UI ----------

  if (!gameStarted) {
    return (
      <main className="p-6 text-slate-100 min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
        <h1 className="text-4xl font-bold mb-4">🎯 Ahorcado Arcade</h1>
        <p className="text-slate-400 mb-6">Adivina tantas palabras como puedas y gana puntos.</p>
        <button
          onClick={startGame}
          className="py-3 px-6 rounded-xl bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold"
        >
          Empezar juego
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)] flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header uniforme */}
        <header className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold">Ahorcado Arcade</h1>
            <p className="text-slate-400 text-sm">Adivina tantas palabras como puedas.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              <div>Ronda: <span className="text-white font-semibold">{round}</span></div>
              <div>Puntos: <span className="text-white font-semibold">{score}</span></div>
              <div>Mejor: <span className="text-white font-semibold">{bestScore}</span></div>
              {scoreError && <div className="text-red-500">{scoreError}</div>}
            </div>
            <EndGameButton />
          </div>
        </header>

        <GameInstructions />

        {/* Contenedor principal */}
        <div className="bg-[#0e1b26] rounded-xl border border-slate-700 p-6 shadow-xl text-center">
          <p className="text-slate-300 mb-2">
            Errores: <span className="text-white font-semibold">{wrong}/{MAX_WRONG}</span>
          </p>

          <h2 className="text-3xl font-mono tracking-widest mb-6">{revealed}</h2>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {LETTERS.map(l => {
              const used = guessed.has(l);
              return (
                <button
                  key={l}
                  onClick={() => guess(l)}
                  disabled={used || gameOver || won}
                  className={`w-9 h-9 rounded font-semibold transition ${
                    used
                      ? (word?.includes(l)
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white")
                      : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>

          {won && <p className="text-green-400 font-semibold">¡Correcto! +100 puntos 🎉</p>}

          {gameOver && (
            <div className="mt-4 text-red-400 font-semibold">
              💀 Fin del juego. Puntaje final: {score}
              <br />
              <button
                onClick={restart}
                className="mt-3 px-4 py-2 bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] rounded-xl text-white font-semibold"
              >
                Reiniciar
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
