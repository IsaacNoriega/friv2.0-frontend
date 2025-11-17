import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartIcon, TrophyIcon, FireIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid'
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

// --- Constants & Types --------------------------------------------------
const BASE_MAP = `
#################
#...............#
#.###.#####.###.#
#.#.#.#...#.#.#.#
#.#.#.#.#.#.#.#.#
#...............#
#.#.#.#.#.#.#.#.#
#.#.#.#...#.#.#.#
#.###.#####.###.#
#...............#
#################
`.trim()

type Cell = '#' | '.' | ' '

type Pos = { r: number; c: number }

// --- Helpers ------------------------------------------------------------
function parseMap(): Cell[][] {
  return BASE_MAP.split('\n').map(r => r.split('') as Cell[])
}

function inside(grid: Cell[][], p: Pos) {
  return p.r >= 0 && p.r < grid.length && p.c >= 0 && p.c < grid[0].length
}

function neighbors(p: Pos) {
  return [
    { r: p.r, c: p.c + 1 },
    { r: p.r, c: p.c - 1 },
    { r: p.r + 1, c: p.c },
    { r: p.r - 1, c: p.c },
  ]
}

// Simple BFS pathfinder returning next step towards target
function nextStepTowards(grid: Cell[][], from: Pos, to: Pos): Pos | null {
  const rows = grid.length, cols = grid[0].length
  const q: Pos[] = [from]
  const prev = new Map<string, string | null>()
  const key = (p: Pos) => `${p.r},${p.c}`
  prev.set(key(from), null)

  while (q.length) {
    const cur = q.shift() as Pos
    if (cur.r === to.r && cur.c === to.c) break
    for (const n of neighbors(cur)) {
      const k = key(n)
      if (!inside(grid, n)) continue
      if (prev.has(k)) continue
      if (grid[n.r][n.c] === '#') continue
      prev.set(k, key(cur))
      q.push(n)
    }
  }

  const targetKey = key(to)
  if (!prev.has(targetKey)) return null

  // walk back to `from`
  let curKey: string | null = targetKey
  let last: string | null = null
  while (curKey && prev.get(curKey) !== null) {
    last = curKey
    curKey = prev.get(curKey) ?? null
  }
  if (!last) return null
  const [r, c] = last.split(',').map(Number)
  return { r, c }
}

// hook: interval that respects latest callback
function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback)
  useEffect(() => { saved.current = callback }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => saved.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// --- Component ----------------------------------------------------------
export default function Pacman() {
  const [grid, setGrid] = useState<Cell[][]>(() => parseMap())
  const [pac, setPac] = useState<Pos>({ r: 1, c: 1 })
  const [dotsLeft, setDotsLeft] = useState(0)
  const ghostRef = useRef<Pos>({ r: 9, c: 15 })
  const [tick, setTick] = useState(0)
  const [win, setWin] = useState(false)
  const [started, setStarted] = useState(false)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [ghostSpeed, setGhostSpeed] = useState(420)

  const dirRef = useRef<Pos | null>(null) // desired movement direction
  const { submitScore, error: scoreError, bestScore } = useGameScore('pacman')
  const { isMuted, toggleMute } = useBackgroundMusic()

  // count dots
  useEffect(() => {
    let n = 0
    for (const row of grid) for (const cell of row) if (cell === '.') n++
    setDotsLeft(n)
  }, [grid])

  // keyboard handling (writes desired direction to dirRef)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Pos> = {
        ArrowLeft: { r: 0, c: -1 },
        ArrowRight: { r: 0, c: 1 },
        ArrowUp: { r: -1, c: 0 },
        ArrowDown: { r: 1, c: 0 },
        a: { r: 0, c: -1 },
        d: { r: 0, c: 1 },
        w: { r: -1, c: 0 },
        s: { r: 1, c: 0 },
      }
      const d = map[e.key]
      if (!d) return
      e.preventDefault()
      dirRef.current = d
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // pac movement runs on small interval and respects desired dir
  useInterval(() => {
    if (!started || win) return
    setTick(t => t + 1)

    const desired = dirRef.current
    const tryMove = (from: Pos, d: Pos) => ({ r: from.r + d.r, c: from.c + d.c })

    let moved = false
    if (desired) {
      const candidate = tryMove(pac, desired)
      if (inside(grid, candidate) && grid[candidate.r][candidate.c] !== '#') {
        setPac(candidate)
        moved = true
      }
    }

    // if didn't move in desired direction, try continuing current direction
    if (!moved && desired) {
      // no-op: keep waiting for next tick
    }

    // eat dot if on one
    setGrid(g => {
      const copy = g.map(r => r.slice()) as Cell[][]
      if (copy[pac.r][pac.c] === '.') {
        copy[pac.r][pac.c] = ' '
        setScore(s => s + 10)
      }
      return copy
    })
  }, 120)

  // ghost AI: prefers path towards pacman, but with randomness
  useInterval(() => {
    if (!started) return
    const g = ghostRef.current
    // 60% chase, 40% random walk
    const roll = Math.random()
    let next: Pos | null = null
    if (roll < 0.6) {
      next = nextStepTowards(grid, g, pac)
    }
    if (!next) {
      // fallback random valid neighbor
      const cand = neighbors(g).filter(p => inside(grid, p) && grid[p.r][p.c] !== '#')
      next = cand[Math.floor(Math.random() * cand.length)] || null
    }
    if (next) ghostRef.current = next
  }, ghostSpeed)

  // collision detection runs every tick
  useEffect(() => {
    if (!started) return
    const g = ghostRef.current
    if (g.r === pac.r && g.c === pac.c) {
      setLives(l => {
        if (l <= 1) {
          setStarted(false)
          setWin(false)
          handleScoreSubmit(score)
          return 0
        }
        // lose a life and reset positions
        setPac({ r: 1, c: 1 })
        ghostRef.current = { r: 9, c: 15 }
        return l - 1
      })
    }
  }, [tick, pac, started, score])

  // detect win
  useEffect(() => {
    if (started && dotsLeft === 0 && !win) setWin(true)
  }, [dotsLeft, started, win])

  // award round bonus once
  useEffect(() => {
    if (!win) return
    const bonus = 100 * round
    setScore(prev => {
      const newScore = prev + bonus
      handleScoreSubmit(newScore)
      return newScore
    })
    const t = setTimeout(() => nextRound(), 900)
    return () => clearTimeout(t)
  }, [win])

  const handleScoreSubmit = useCallback((scoreToSubmit: number) => {
    if (scoreToSubmit > (bestScore || 0)) {
      submitScore(scoreToSubmit).catch(() => {})
    }
  }, [bestScore, submitScore])

  function nextRound() {
    setRound(r => r + 1)
    setGhostSpeed(s => Math.max(180, s - 40))
    ghostRef.current = { r: 9, c: 15 }
    setGrid(parseMap())
    setPac({ r: 1, c: 1 })
    setWin(false)
  }

  function startGame() {
    setGrid(parseMap())
    setPac({ r: 1, c: 1 })
    ghostRef.current = { r: 9, c: 15 }
    setScore(0)
    setLives(3)
    setRound(1)
    setGhostSpeed(420)
    setStarted(true)
    setWin(false)
  }

  function restart() { startGame() }

  // small helpers for UI
  const cols = grid[0].length
  const cellSize = 32

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
              <div className="text-5xl">👻</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Pacman
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
                <SpeakerWaveIcon className="w-6 h-6 text-yellow-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Come todos los puntos y evita al fantasma</p>
        </motion.header>

        {/* TOP ROW: Stats & Game Board */}
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
                  <TrophyIcon className="w-6 h-6 text-amber-400" />
                  <span className="text-sm text-slate-400">Ronda</span>
                </div>
                <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                  <span className="text-2xl font-black text-amber-300">{round}</span>
                </div>
              </div>

              {/* Lives */}
              <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <span className="text-sm text-slate-400">Vidas</span>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <HeartIcon 
                      key={i} 
                      className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="p-4 bg-linear-to-br from-yellow-500/10 to-amber-600/5 rounded-lg border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-yellow-300">Puntos</span>
                  <FireIcon className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-4xl font-black bg-linear-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                  {score.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Récord: {(bestScore ?? 0).toLocaleString()}
                </div>
                {scoreError && <div className="text-red-400 text-xs mt-1">{scoreError}</div>}
              </div>

              {/* Game Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                  <div className="text-slate-500 text-xs mb-1">Puntos</div>
                  <div className="font-semibold text-white">{dotsLeft}</div>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                  <div className="text-slate-500 text-xs mb-1">Velocidad</div>
                  <div className="font-semibold text-white">{ghostSpeed}ms</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={startGame} 
                  className="flex-1 py-3 rounded-lg bg-linear-to-r from-yellow-500 to-amber-600 text-black font-bold hover:from-yellow-600 hover:to-amber-700 transition-all shadow-lg shadow-yellow-500/20"
                >
                  {!started ? '▶ Empezar' : '▶ Continuar'}
                </button>
                <button 
                  onClick={restart} 
                  className="px-4 py-3 rounded-lg bg-slate-700/60 border border-slate-600 text-white font-semibold hover:bg-slate-600 transition-all"
                >
                  ↻
                </button>
              </div>

              <EndGameButton onEnd={() => handleScoreSubmit(score)} />
            </div>
          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!started ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md">
                  <div className="text-7xl mb-4">🎮</div>
                  <h2 className="text-3xl font-bold mb-3 bg-linear-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                    {lives === 0 ? '💀 Game Over' : '¡Listo para jugar!'}
                  </h2>
                  {lives === 0 ? (
                    <p className="text-slate-400 mb-6">Perdiste todas tus vidas. Puntuación final: {score}</p>
                  ) : (
                    <p className="text-slate-400 mb-6">Presiona el botón para comenzar la aventura</p>
                  )}
                  <button 
                    onClick={startGame} 
                    className="px-8 py-4 rounded-xl bg-linear-to-r from-yellow-500 to-amber-600 text-black text-lg font-black hover:from-yellow-600 hover:to-amber-700 transition-all shadow-2xl shadow-yellow-500/30"
                  >
                    {lives === 0 ? '🔄 Jugar de Nuevo' : '▶ Empezar Juego'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 h-full flex items-center justify-center">
                <AnimatePresence>
                  {win && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-sm"
                    >
                      <div className="bg-linear-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/50 p-8 rounded-2xl text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <div className="text-3xl font-black text-yellow-400 mb-2">
                          ¡Ronda {round} Completada!
                        </div>
                        <div className="text-lg text-slate-300">
                          +{100 * round} puntos de bonus
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative mx-auto" style={{ width: cols * (cellSize + 4) }}>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 4 }}>
                    {grid.flat().map((cell, i) => {
                      const r = Math.floor(i / cols)
                      const c = i % cols
                      const isPac = pac.r === r && pac.c === c
                      const isGhost = ghostRef.current.r === r && ghostRef.current.c === c

                      return (
                        <motion.div 
                          key={i} 
                          className={`rounded-lg flex items-center justify-center ${
                            cell === '#' 
                              ? 'bg-blue-900/40 border border-blue-700/30' 
                              : 'bg-slate-800/20'
                          }`} 
                          style={{ width: cellSize, height: cellSize }}
                        >
                          {/* Pacman */}
                          {isPac && (
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 15, 0, -15, 0]
                              }}
                              transition={{ 
                                duration: 0.4,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-5 h-5 rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/50"
                            />
                          )}
                          
                          {/* Ghost */}
                          {isGhost && (
                            <motion.div 
                              animate={{ 
                                y: [0, -3, 0],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ 
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-5 h-5 rounded-full bg-linear-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/50"
                            />
                          )}
                          
                          {/* Dot */}
                          {!isPac && !isGhost && cell === '.' && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-yellow-300 shadow-sm shadow-yellow-300/50"
                            />
                          )}

                          {/* Hint Mode - Always On */}
                          {isGhost && (
                            <div className="-mt-2 text-xs text-red-400 font-bold">👻</div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.section>

        </div>

        {/* BOTTOM ROW: Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GameInstructions
            title="Cómo Jugar Pacman"
            description="Come todos los puntos del laberinto mientras evitas al fantasma. Usa flechas o WASD. Limpia todo para ganar la ronda."
            controls={[
              { key: '← / A', action: 'Mover izquierda' },
              { key: '→ / D', action: 'Mover derecha' },
              { key: '↑ / W', action: 'Mover arriba' },
              { key: '↓ / S', action: 'Mover abajo' }
            ]}
            note="El fantasma tiende a perseguirte, pero a veces se mueve aleatoriamente. Usa paredes a tu favor."
          />
        </motion.div>

      </div>
    </main>
  )
}
