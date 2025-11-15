import { useEffect, useState, useCallback } from "react";
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

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
    <div className="w-full h-64 mb-4 flex justify-center items-end overflow-hidden">
      <svg width="250" height="250" viewBox="0 0 250 250" className="flex-shrink-0">
        <line x1="10" y1="240" x2="150" y2="240" stroke="white" strokeWidth="6" />
        <line x1="80" y1="240" x2="80" y2="20" stroke="white" strokeWidth="6" />
        <line x1="80" y1="20" x2="165" y2="20" stroke="white" strokeWidth="6" />
        <line x1="165" y1="20" x2="165" y2="45" stroke="white" strokeWidth="4" />

        {BODY_PARTS_SVG.slice(0, numberOfGuesses)}
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
      if (score > (bestScore || 0)) {
        submitScore(score).catch(console.error);
      }
    }
  }, [lost, score, submitScore, gameOver, bestScore]);


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
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)] flex flex-col items-center">
      <div className="max-w-lg w-full">
        <header className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold">Ahorcado Arcade</h1>
            <p className="text-slate-400 text-sm">Adivina tantas palabras como puedas.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              <div>Ronda: <span className="text-white font-semibold">{round}</span></div>
              <div>Puntos: <span className="text-white font-semibold">{score}</span></div>
              <div>Mejor: <span className="text-white font-semibold">{bestScore ?? 0}</span></div>
              {scoreError && <div className="text-red-500">{scoreError}</div>}
            </div>
            <EndGameButton />
          </div>
        </header>

        <GameInstructions
          title="Cómo Jugar Ahorcado"
          description="Adivina la palabra oculta letra por letra. Cada letra incorrecta dibuja una parte del ahorcado. Tienes 6 intentos antes de perder. Usa la pista para ayudarte."
          controls={[
            { key: 'Clic / Teclado', action: 'Seleccionar letra' }
          ]}
          note="Ganas puntos por cada ronda. ¡Los errores te restan puntos de bonificación!"
        />

        <div className="bg-[#0e1b26] rounded-xl border border-slate-700 p-6 shadow-xl text-center">

          <HangmanDrawing numberOfGuesses={wrong} />

          <p className="text-slate-300 mb-2">
            Errores: <span className="text-white font-semibold">{wrong}/{MAX_WRONG}</span>
          </p>

          <h2 className="text-3xl font-mono tracking-widest mb-4">{revealed}</h2>

          <p className="text-lg text-sky-300 italic mb-6 h-6">
            {gameOver ? `La palabra era: ${word}` : `Pista: ${hint}`}
          </p>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {LETTERS.map(l => {
              const used = guessed.has(l);
              const correct = word?.includes(l);

              return (
                <button
                  key={l}
                  onClick={() => guess(l)}
                  disabled={used || gameOver || won}
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded font-semibold transition
                    disabled:opacity-50
                    ${
                      used
                        ? (correct ? "bg-green-600 text-white" : "bg-red-600 text-white opacity-40")
                        : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                    }
                  `}
                >
                  {l}
                </button>
              );
            })}
          </div>

          {won && !gameOver && (
            <p className="text-green-400 font-semibold text-lg">
                ¡Correcto! Siguiente ronda...
            </p>
          )}

          {gameOver && (
            <div className="mt-4 text-red-400 font-semibold">
              <p className="text-xl"> Fin del juego </p>
              <p className="text-base text-slate-300">Puntaje final: {score}</p>
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
