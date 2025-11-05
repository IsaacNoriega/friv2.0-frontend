import { useEffect, useState, useCallback } from "react";

const WORDS = [
  "REACT",
  "JAVASCRIPT",
  "PROGRAMAR",
  "FRIV",
  "JUEGO",
  "ARQUITECTURA",
  "TAILWIND",
  "VITE",
  "COMPONENTE",
  "HOOKS",
  "FRAMER",
  "ESTADO",
  "FUNCION",
  "TYPESCRIPT",
];

const LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function AhorcadoArcade() {
  const [word, setWord] = useState(() => pickWord());
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const guess = useCallback(
    (l: string) => {
      if (gameOver) return;
      setGuessed((prev) => {
        if (prev.has(l)) return prev;
        const next = new Set(prev);
        next.add(l);
        return next;
      });
      if (!word.includes(l)) {
        setWrong((w) => w + 1);
      }
    },
    [word, gameOver]
  );

  // Detectar teclado físico
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const k = e.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(k)) guess(k);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [guess]);

  const revealed = word
    .split("")
    .map((ch) => (guessed.has(ch) ? ch : "_"))
    .join(" ");

  const won = word.split("").every((ch) => guessed.has(ch));
  const lost = wrong >= MAX_WRONG;

  // ✅ Avanzar de ronda si gana
  useEffect(() => {
    if (won && !gameOver) {
      const timeout = setTimeout(() => {
        setScore((s) => s + 100);
        setRound((r) => r + 1);
        setWord(pickWord());
        setGuessed(new Set());
        setWrong(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [won, gameOver]);

  // ✅ Terminar juego si pierde
  useEffect(() => {
    if (lost) setGameOver(true);
  }, [lost]);

  const restart = () => {
    setWord(pickWord());
    setGuessed(new Set());
    setWrong(0);
    setScore(0);
    setRound(1);
    setGameOver(false);
  };

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <header className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold">Ahorcado Arcade</h1>
            <p className="text-slate-400 text-sm">
              Adivina tantas palabras como puedas.
            </p>
          </div>
          <div className="text-right text-sm text-slate-300">
            <div>Ronda: <span className="text-white font-semibold">{round}</span></div>
            <div>Puntos: <span className="text-white font-semibold">{score}</span></div>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-700 p-6 shadow-xl text-center">
          <p className="text-slate-300 mb-2">
            Errores: <span className="text-white font-semibold">{wrong}/{MAX_WRONG}</span>
          </p>

          <h2 className="text-3xl font-mono tracking-widest mb-6">{revealed}</h2>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {LETTERS.map((l) => {
              const used = guessed.has(l);
              return (
                <button
                  key={l}
                  onClick={() => guess(l)}
                  disabled={used || gameOver || won}
                  className={`w-9 h-9 rounded font-semibold transition ${
                    used
                      ? word.includes(l)
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
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
                className="mt-3 px-4 py-1 bg-blue-500 hover:bg-blue-600 transition rounded text-white text-sm"
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