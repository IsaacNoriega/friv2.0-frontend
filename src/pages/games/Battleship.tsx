import React, { useState, useCallback, useEffect, useMemo } from "react";
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

type Cell = { ship: number | null; hit: boolean };

const SIZE = 8;
const SHIPS = [4, 3, 3, 2, 2];
const MAX_SHOTS_PER_ROUND = 40;

function makeBoard(size: number) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ ship: null, hit: false } as Cell))
  );
}

function placeShips(size: number, ships: number[]) {
  const board = makeBoard(size);
  let id = 1;
  for (const len of ships) {
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const coords: [number, number][] = [];
      for (let k = 0; k < len; k++)
        coords.push(horiz ? [r, c + k] : [r + k, c]);
      if (coords.some(([rr, cc]) => rr < 0 || rr >= size || cc < 0 || cc >= size))
        continue;
      if (coords.some(([rr, cc]) => board[rr][cc].ship !== null)) continue;
      for (const [rr, cc] of coords) board[rr][cc].ship = id;
      placed = true;
      id++;
    }
  }
  return board;
}

export default function BattleshipRounds() {
  const [board, setBoard] = useState<Cell[][] | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const { submitScore } = useGameScore('battleship');

  const startGame = () => {
    setBoard(placeShips(SIZE, SHIPS));
    setRound(1);
    setScore(0);
    setShots(0);
    setHits(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const restart = useCallback(() => startGame(), []);

  const shoot = useCallback(
    (r: number, c: number) => {
      if (!board || gameOver) return;
      setBoard(prev => {
        if (!prev) return prev;
        const copy = prev.map(row => row.map(cell => ({ ...cell })));
        if (copy[r][c].hit) return prev;
        copy[r][c].hit = true;
        if (copy[r][c].ship !== null) setHits(h => h + 1);
        setShots(s => s + 1);
        return copy;
      });
    },
    [board, gameOver]
  );

  const sunk = useMemo(() => {
    if (!board) return 0;
    const shipsAlive = new Map<number, boolean>();
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        const s = board[r][c].ship;
        if (s !== null) {
          if (!shipsAlive.has(s)) shipsAlive.set(s, false);
          if (!board[r][c].hit) shipsAlive.set(s, true);
        }
      }
    let sunkCount = 0;
    for (const hasUnhit of shipsAlive.values()) if (!hasUnhit) sunkCount++;
    return sunkCount;
  }, [board]);

  const totalShips = SHIPS.length;
  const allSunk = sunk === totalShips;
  const accuracy = shots > 0 ? ((hits / shots) * 100).toFixed(1) : "0.0";

  // Avanzar de ronda si gana
  useEffect(() => {
    if (allSunk && !gameOver) {
      const timeout = setTimeout(() => {
        setScore(s => s + 500);
        setRound(r => r + 1);
        setShots(0);
        setHits(0);
        setBoard(placeShips(SIZE, SHIPS));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [allSunk, gameOver]);

  // Perder si se acaban los tiros
  useEffect(() => {
    if (shots >= MAX_SHOTS_PER_ROUND && !allSunk) setGameOver(true);
  }, [shots, allSunk]);

  useEffect(() => {
    if (gameOver) submitScore(score).catch(() => {});
  }, [gameOver, score, submitScore]);

  // ---------- UI ----------

  if (!gameStarted) {
    return (
      <main className="p-6 text-slate-100 min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
        <h1 className="text-4xl font-bold mb-4">⚓ Battleship</h1>
        <p className="text-slate-400 mb-6">Destruye todos los barcos por ronda y gana puntos.</p>
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
      <div className="max-w-3xl mx-auto text-center">
        {/* Header uniforme */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#0ea5e9]">Battleship ⚓</h1>
            <p className="text-slate-400 text-sm">Modo por rondas</p>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-300">
            <div>Ronda: <span className="text-white font-semibold">{round}</span></div>
            <div>Puntos: <span className="text-white font-semibold">{score}</span></div>
            <div>Tiros: <span className="text-white font-semibold">{shots}/{MAX_SHOTS_PER_ROUND}</span></div>
            <div>Precisión: <span className="text-white font-semibold">{accuracy}%</span></div>
            <EndGameButton />
            <button
              onClick={restart}
              className="px-3 py-1 bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold rounded-xl"
            >
              Reiniciar
            </button>
          </div>
        </header>

        <GameInstructions 
          title="Cómo Jugar Battleship"
          description="Coloca tus barcos en el tablero y ataca las coordenadas del oponente para hundir su flota. Cuando aciertes, verás 'HIT'. Cuando falles, verás 'MISS'. El primero en hundir todos los barcos del rival gana."
          controls={[
            { key: 'Clic', action: 'Colocar barco / Atacar' }
          ]}
          note="Usa un patrón de búsqueda sistemático. Cuando aciertes, ataca las casillas adyacentes para hundir el barco completo."
        />

        {/* Tablero */}
        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-5 inline-block shadow-lg">
          <div
            style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE}, 38px)`, gap: 6 }}
          >
            {board!.flat().map((cell, i) => {
              const r = Math.floor(i / SIZE);
              const c = i % SIZE;
              const show = cell.hit;
              const isShip = cell.ship !== null;
              const cellColor = show
                ? isShip ? "#ef4444" : "#1f2937"
                : "#0b1220";
              const emoji = show ? (isShip ? "💥" : "💦") : "";
              return (
                <button
                  key={i}
                  onClick={() => shoot(r, c)}
                  disabled={gameOver || allSunk}
                  style={{ width: 38, height: 38, background: cellColor, borderRadius: 6, transition: "background 0.2s" }}
                  className="flex items-center justify-center font-bold text-white hover:brightness-125"
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-white">
            <div>Barcos hundidos: <span className="font-semibold text-[#0ea5e9]">{sunk}/{totalShips}</span></div>
            {allSunk && (
              <div className="mt-3 text-green-400 font-bold text-lg animate-pulse">
                ¡Ronda completada! 🚀 +500 puntos
              </div>
            )}
            {gameOver && (
              <div className="mt-4 text-red-400 font-bold text-lg">
                💀 Fin del juego — Puntaje final: {score}
                <br />
                <button
                  onClick={restart}
                  className="mt-3 px-4 py-2 bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold rounded-xl"
                >
                  Reiniciar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
