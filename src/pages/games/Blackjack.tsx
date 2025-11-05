import React, { useEffect, useMemo, useState } from "react";
import GameInstructions from '../../components/GameInstructions'

type Card = {
  code: string; // e.g. 'A♠' or '10♥'
  value: number;
};

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      const code = `${r}${s}`;
      let value = 0;
      if (r === "A") value = 11;
      else if (["J", "Q", "K"].includes(r)) value = 10;
      else value = parseInt(r, 10);
      deck.push({ code, value });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function handValue(cards: Card[]) {
  let total = cards.reduce((s, c) => s + c.value, 0);
  let aces = cards.filter((c) => c.code.startsWith("A")).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

export default function Blackjack() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [message, setMessage] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState<number>(0);

  // Inicia la primera partida
  useEffect(() => {
    newGame();
  }, []);

  function newGame() {
    const d = shuffle(buildDeck());
    const p1 = d[0];
    const d1 = d[1];
    const p2 = d[2];
    const d2 = d[3];
    setDeck(d.slice(4));
    setPlayer([p1, p2]);
    setDealer([d1, d2]);
    setMessage("");
    setGameOver(false);
  }

  const playerValue = useMemo(() => handValue(player), [player]);
  const dealerValue = useMemo(() => handValue(dealer), [dealer]);

  // Verifica estados automáticos del jugador
  useEffect(() => {
    if (playerValue === 21 && player.length === 2) {
      setMessage("¡Blackjack! +100 pts");
      setScore((s) => s + 100);
      setGameOver(true);
      nextRound();
    } else if (playerValue > 21) {
      setMessage("Te pasaste. Fin del juego.");
      setGameOver(true);
    }
  }, [playerValue]);

  function playerHit() {
    if (gameOver || deck.length === 0) return;
    const [c, ...rest] = deck;
    setPlayer((p) => [...p, c]);
    setDeck(rest);
  }

  function dealerPlayAndResolve() {
    let d = [...deck];
    let dh = [...dealer];

    while (handValue(dh) < 17) {
      const [c, ...rest] = d;
      dh = [...dh, c];
      d = rest;
    }

    const pv = handValue(player);
    const dv = handValue(dh);

    setDealer(dh);
    setDeck(d);

    if (dv > 21) {
      setMessage("Dealer se pasó. +100 pts");
      setScore((s) => s + 100);
      setGameOver(true);
      nextRound();
    } else if (pv > dv) {
      setMessage("¡Ganaste! +100 pts");
      setScore((s) => s + 100);
      setGameOver(true);
      nextRound();
    } else if (pv === dv) {
      setMessage("Empate +50 pts");
      setScore((s) => s + 50);
      setGameOver(true);
      nextRound();
    } else {
      setMessage("Perdiste. Fin del juego.");
      setGameOver(true);
    }
  }

  function playerStand() {
    if (gameOver) return;
    dealerPlayAndResolve();
  }

  // Si gana o empata → inicia siguiente ronda tras 2 seg
  function nextRound() {
    setTimeout(() => {
      if (!message.includes("Fin del juego")) {
        newGame();
      }
    }, 2000);
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Blackjack</h1>
            <p className="text-slate-400 text-sm">
              Acércate a 21 sin pasarte. Gana rondas y suma puntos.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-300">Puntuación:</p>
            <p className="text-xl font-bold text-white">{score}</p>
          </div>
  </header>

  <GameInstructions />

  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-3">
              Dealer {gameOver ? `(${dealerValue})` : ""}
            </h2>
            <div className="flex gap-3">
              {dealer.map((c, i) => (
                <div
                  key={i}
                  className={`w-20 h-28 rounded-lg flex items-center justify-center text-xl font-bold border ${
                    i === 1 && !gameOver
                      ? "bg-[#071826] text-transparent"
                      : "bg-white/5 text-white"
                  } border-slate-700`}
                >
                  <span className={`${i === 1 && !gameOver ? "opacity-0" : ""}`}>
                    {c.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-3">
              Tu mano ({playerValue})
            </h2>
            <div className="flex gap-3 mb-4">
              {player.map((c, i) => (
                <div
                  key={i}
                  className="w-20 h-28 rounded-lg flex items-center justify-center text-xl font-bold border bg-white/5 text-white border-slate-700"
                >
                  {c.code}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={playerHit}
                disabled={gameOver}
                className="py-2 px-4 rounded-md bg-emerald-500 text-black font-semibold disabled:opacity-50"
              >
                Hit
              </button>
              <button
                onClick={playerStand}
                disabled={gameOver}
                className="py-2 px-4 rounded-md bg-amber-400 text-black font-semibold disabled:opacity-50"
              >
                Stand
              </button>
            </div>

            {message && (
              <div className="mt-4 text-sm text-slate-200">{message}</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
