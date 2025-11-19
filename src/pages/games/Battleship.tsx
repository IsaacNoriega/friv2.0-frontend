import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, RocketLaunchIcon, PlayIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

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

  const { submitScore, bestScore } = useGameScore('battleship');
  const { isMuted, toggleMute } = useBackgroundMusic();

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
      
      // Verificar si ya fue golpeada antes de hacer cambios
      if (board[r][c].hit) return;
      
      const wasShip = board[r][c].ship !== null;
      const shipId = board[r][c].ship;
      
      setBoard(prev => {
        if (!prev) return prev;
        const copy = prev.map(row => row.map(cell => ({ ...cell })));
        copy[r][c].hit = true;
        return copy;
      });
      
      // Solo incrementar shots si NO le diste a un barco
      if (!wasShip) {
        setShots(s => s + 1);
      } else {
        setHits(h => h + 1);
        
        // Verificar si hundió el barco completo
        setTimeout(() => {
          setBoard(currentBoard => {
            if (!currentBoard) return currentBoard;
            
            // Verificar si todas las partes del barco fueron golpeadas
            let shipSunk = true;
            for (let i = 0; i < SIZE; i++) {
              for (let j = 0; j < SIZE; j++) {
                if (currentBoard[i][j].ship === shipId && !currentBoard[i][j].hit) {
                  shipSunk = false;
                  break;
                }
              }
              if (!shipSunk) break;
            }
            
            // Si hundió el barco, dar puntos de bonificación
            if (shipSunk && shipId !== null) {
              setScore(s => s + 100);
            }
            
            return currentBoard;
          });
        }, 50);
      }
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
    if (gameOver && (bestScore === null || score > bestScore)) {
      submitScore(score).catch(() => {});
    }
  }, [gameOver, score, submitScore, bestScore]);

  // ---------- UI ----------

  if (!gameStarted) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">⚓</div>
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Battleship
          </h1>
          <p className="text-slate-400 mb-6">Destruye todos los barcos por ronda y gana puntos</p>
          <button
            onClick={startGame}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-blue-500 to-cyan-600 text-white text-lg font-black hover:from-blue-600 hover:to-cyan-700 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-2 mx-auto"
          >
            <PlayIcon className="w-5 h-5" />
            Empezar Juego
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
              <div className="text-5xl">⚓</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Battleship
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
                <SpeakerWaveIcon className="w-6 h-6 text-blue-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Destruye todos los barcos antes de quedarte sin tiros</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Stats Card */}
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4">
              
              {/* Round & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-linear-to-br from-blue-500/10 to-cyan-600/5 rounded-lg border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300">Ronda</span>
                    <TrophyIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-4xl font-black text-blue-300">{round}</div>
                </div>
                <div className="p-4 bg-linear-to-br from-cyan-500/10 to-blue-600/5 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-300">Puntos</span>
                    <FireIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-4xl font-black text-cyan-300">{score}</div>
                </div>
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">Tiros</div>
                  <div className="text-2xl font-bold text-white">{shots}/{MAX_SHOTS_PER_ROUND}</div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">Precisión</div>
                  <div className="text-2xl font-bold text-white">{accuracy}%</div>
                </div>
              </div>

              {/* Ships Progress */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Barcos hundidos</span>
                  <span className="text-lg font-bold text-cyan-400">{sunk}/{totalShips}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <motion.div 
                    className="bg-linear-to-r from-blue-400 to-cyan-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(sunk / totalShips) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Win Message */}
              <AnimatePresence>
                {allSunk && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <RocketLaunchIcon className="w-6 h-6 text-green-400" />
                      <div>
                        <div className="text-lg font-bold text-green-400">¡Ronda completada!</div>
                        <div className="text-sm text-green-300">+500 puntos</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Over */}
              <AnimatePresence>
                {gameOver && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💀</span>
                      <span className="text-lg font-bold text-red-400">Fin del Juego</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">Puntaje final: {score}</p>
                    <button
                      onClick={() => { setScore(0); setRound(1); restart(); }}
                      className="w-full py-2 rounded-lg bg-linear-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      🔄 Jugar de Nuevo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex gap-2">
                <button 
                  onClick={restart} 
                  className="flex-1 py-3 rounded-lg bg-linear-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Reiniciar
                </button>
                <EndGameButton onEnd={() => {
                  if (bestScore === null || score > bestScore) {
                    submitScore(score);
                  }
                }} />
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
              <GameInstructions 
                title="Cómo Jugar Battleship"
                description="Coloca tus barcos en el tablero y ataca las coordenadas del oponente para hundir su flota. Cuando aciertes, verás '💥'. Cuando falles, verás '💦'. El primero en hundir todos los barcos del rival gana."
                controls={[
                  { key: 'Clic', action: 'Atacar casilla' }
                ]}
                note="Usa un patrón de búsqueda sistemático. Cuando aciertes, ataca las casillas adyacentes para hundir el barco completo."
              />
            </div>
          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 flex items-center justify-center">
              <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border-4 border-blue-500/20 shadow-2xl shadow-blue-500/20">
                <div
                  style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE}, 42px)`, gap: 4 }}
                >
                  {board!.flat().map((cell, i) => {
                    const r = Math.floor(i / SIZE);
                    const c = i % SIZE;
                    const show = cell.hit;
                    const isShip = cell.ship !== null;
                    const emoji = show ? (isShip ? "💥" : "💦") : "";
                    
                    return (
                      <motion.button
                        key={i}
                        onClick={() => shoot(r, c)}
                        disabled={gameOver || allSunk || show}
                        whileHover={!show && !gameOver && !allSunk ? { scale: 1.1 } : {}}
                        whileTap={!show && !gameOver && !allSunk ? { scale: 0.9 } : {}}
                        initial={show ? { scale: 0 } : undefined}
                        animate={show ? { scale: 1 } : undefined}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="rounded-lg relative overflow-hidden flex items-center justify-center text-2xl font-bold"
                        style={{
                          width: 42,
                          height: 42,
                          background: show
                            ? isShip 
                              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                              : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
                            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          boxShadow: show
                            ? isShip
                              ? '0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(255,255,255,0.2)'
                              : '0 0 15px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(0,0,0,0.3)'
                            : 'inset 0 1px 2px rgba(0,0,0,0.3)',
                          cursor: show || gameOver || allSunk ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {emoji}
                        {!show && !gameOver && !allSunk && (
                          <div 
                            className="absolute inset-0 bg-blue-400/0 hover:bg-blue-400/10 transition-colors rounded-lg"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>

        </div>

      </div>
    </main>
  );
}
