import React, { useEffect, useMemo, useState } from "react";
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';

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
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setRoundFinished(true);
      setStartedAt(null);
      setScore((s) => s + 100);
    }
  }, [cards]);

  // Clic en carta
  function onCardClick(index: number) {
    if (flipped.includes(index)) return;
    if (cards[index].matched) return;
    if (flipped.length === 2) return;
    setFlipped((prev) => [...prev, index]);
  }

  const cols = useMemo(
    () => ({ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }),
    []
  );

  // ---------- UI ----------

  if (!gameStarted) {
    return (
      <main className="p-6 text-slate-100 min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
        <h1 className="text-4xl font-bold mb-4">🎴 Memorama</h1>
        <p className="text-slate-400 mb-6">Avanza por rondas, ¡gana puntos y demuestra tu memoria!</p>
        <button
          onClick={startGame}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold"
        >
          Empezar juego
        </button>
      </main>
    );
  }

  if (roundFinished) {
    return (
      <main className="p-6 text-slate-100 min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
        <h2 className="text-3xl font-bold mb-2">🎉 ¡Ronda {round} completada!</h2>
        <p className="text-slate-400 mb-4">Puntaje total: <span className="text-white font-semibold">{score}</span></p>
        <button
          onClick={() => {
            const nextRound = round + 1;
            setRound(nextRound);
            startRound(nextRound);
          }}
          className="py-2 px-5 rounded-lg bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold"
        >
          Siguiente ronda
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Memorama - Ronda {round}</h1>
            <p className="text-slate-400 text-sm">Encuentra todas las parejas.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-300">Puntaje: <span className="font-bold text-white">{score}</span></div>
            <div className="text-sm text-slate-300">Movimientos: <span className="font-semibold text-white">{moves}</span></div>
            <div className="text-sm text-slate-300">Tiempo: <span className="font-semibold text-white">{time}s</span></div>
            <EndGameButton />
          </div>
  </header>

  <GameInstructions />

  <section className="bg-[#0e1b26] rounded-xl border border-slate-800 p-6">
          <div className="grid gap-4" style={cols as React.CSSProperties}>
            {cards.map((c, i) => {
              const isFlipped = flipped.includes(i) || c.matched;
              return (
                <button
                  key={c.id}
                  onClick={() => onCardClick(i)}
                  className={`h-20 rounded-lg flex items-center justify-center text-3xl transition-all duration-300
                    ${isFlipped
                      ? "bg-white/10 text-white scale-105"
                      : "bg-[#071826] text-transparent hover:scale-105"}
                    border border-slate-700`}
                >
                  <span className={`${isFlipped ? "" : "opacity-0"}`}>{c.symbol}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
