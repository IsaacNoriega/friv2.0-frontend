import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, SparklesIcon, PlayIcon, ArrowPathIcon, CheckCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

// ✅ Lista de puzzles por ronda (PUEDES AGREGAR MÁS)
const PUZZLES: number[][][] = [
  [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,3,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ],
  // 👉 RONDA 2 (ejemplo, puedes editarlo)
  [
    [0,0,4,0,0,0,1,0,0],
    [0,0,0,4,1,0,0,0,0],
    [9,0,0,0,0,0,0,6,0],
    [0,7,0,0,6,0,0,0,3],
    [0,0,0,0,0,3,0,0,8],
    [5,0,0,0,0,0,0,0,0],
    [0,9,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,7],
    [0,0,6,3,0,0,0,5,0]
  ],
]

// ✅ Soluciones correspondientes a los puzzles
const SOLUTIONS: number[][][] = [
  [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ],

  // 👉 SOLUCIÓN DE RONDA 2 (ejemplo)
  [
    [3,6,4,2,9,8,1,7,5],
    [8,5,9,4,1,6,3,2,0],
    [9,1,7,5,3,0,8,6,4],
    [2,7,8,1,6,5,9,4,3],
    [6,4,1,9,2,3,5,0,8],
    [5,3,0,8,0,7,6,1,2],
    [7,9,3,6,5,1,4,8,0],
    [4,8,2,0,1,9,0,3,7],
    [1,0,6,3,8,2,7,5,9]
  ],
]

// ----- utils -----
function cloneGrid(g: number[][]) {
  return g.map(r => r.slice())
}

function findConflicts(grid: number[][]) {
  const conflicts = new Set<string>()

  // filas
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>()
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c]
      if (!v) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push(c)
    }
    for (const [, cols] of seen)
      if (cols.length > 1)
        for (const c of cols) conflicts.add(`${r},${c}`)
  }

  // columnas
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>()
    for (let r = 0; r < 9; r++) {
      const v = grid[r][c]
      if (!v) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push(r)
    }
    for (const [, rows] of seen)
      if (rows.length > 1)
        for (const r of rows) conflicts.add(`${r},${c}`)
  }

  // cajas
  for (let br = 0; br < 3; br++)
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Map<number, [number, number][]>()
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
          const rr = br * 3 + r,
            cc = bc * 3 + c
          const v = grid[rr][cc]
          if (!v) continue
          if (!seen.has(v)) seen.set(v, [])
          seen.get(v)!.push([rr, cc])
        }
      for (const [, coords] of seen)
        if (coords.length > 1)
          for (const [rr, cc] of coords) conflicts.add(`${rr},${cc}`)
    }

  return conflicts
}

export default function Sudoku() {
  const [grid, setGrid] = useState<number[][]>(() => cloneGrid(PUZZLES[0]))
  const [conflicts, setConflicts] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)
  const { submitScore, error: scoreError, bestScore } = useGameScore('sudoku')
  const { isMuted, toggleMute } = useBackgroundMusic()

  // ✅ Cambios en el grid
  function onChange(r: number, c: number, v: string) {
    const n = Number(v) || 0
    if (n < 0 || n > 9) return
    const g = cloneGrid(grid)
    g[r][c] = n
    setGrid(g)
  }

  // ✅ Revisar sudoku
  function check() {
    const conf = findConflicts(grid)
    setConflicts(conf)

    const allFilled = grid.flat().every(v => v > 0)

    if (conf.size === 0 && allFilled) {
      setWon(true)

      const bonus = level * 100
      setScore(prev => prev + bonus)

      // si es récord, guardar
      if (score + bonus > (bestScore || 0)) {
        submitScore(score + bonus).catch(console.error)
      }

      // esperar y pasar de ronda
      setTimeout(nextRound, 1200)
    }
  }

  // ✅ Pasar al siguiente puzzle
  function nextRound() {
    if (level >= PUZZLES.length) {
      alert("🎉 Completaste todos los niveles!")
      return restart()
    }

    const next = level + 1
    setLevel(next)
    setGrid(cloneGrid(PUZZLES[next - 1]))
    setConflicts(new Set())
    setWon(false)
  }

  function solve() {
    setGrid(cloneGrid(SOLUTIONS[level - 1]))
    setConflicts(new Set())
  }

  function restart() {
    setLevel(1)
    setGrid(cloneGrid(PUZZLES[0]))
    setConflicts(new Set())
    setScore(0)
    setWon(false)
    setStarted(false)
  }

  if (!started) {
    return (
      <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 max-w-md"
        >
          <div className="text-7xl mb-4">🧩</div>
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            Sudoku
          </h1>
          <p className="text-slate-400 mb-6">Resuelve puzzles por rondas y gana puntos</p>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 text-white text-lg font-black hover:from-purple-600 hover:to-pink-700 transition-all shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-2 mx-auto"
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
              <div className="text-5xl">🧩</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-purple-400 via-pink-300 to-purple-500 bg-clip-text text-transparent">
                Sudoku
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
          <p className="text-slate-400 text-lg ml-16">Completa la cuadrícula sin repetir números</p>
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
                <div className="p-4 bg-linear-to-br from-purple-500/10 to-pink-600/5 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-300">Ronda</span>
                    <TrophyIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-4xl font-black text-purple-300">{level}</div>
                </div>
                <div className="p-4 bg-linear-to-br from-pink-500/10 to-purple-600/5 rounded-lg border border-pink-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-pink-300">Puntos</span>
                    <FireIcon className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="text-4xl font-black text-pink-300">{score}</div>
                </div>
              </div>

              {/* Best Score */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-slate-400">Mejor Récord</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">{bestScore ?? 0}</span>
                </div>
              </div>

              {/* Win Message */}
              <AnimatePresence>
                {won && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-400" />
                      <div>
                        <div className="text-lg font-bold text-green-400">¡Nivel completado!</div>
                        <div className="text-sm text-green-300">+{level * 100} puntos</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conflicts Warning */}
              <AnimatePresence>
                {conflicts.size > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <div className="text-lg font-bold text-red-400">Conflictos detectados</div>
                        <div className="text-sm text-red-300">{conflicts.size} casillas con errores</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="space-y-2">
                <button 
                  onClick={check} 
                  className="w-full py-3 rounded-lg bg-linear-to-r from-purple-500 to-pink-600 text-white font-bold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Verificar
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={solve} 
                    className="py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
                  >
                    Resolver
                  </button>
                  <button 
                    onClick={restart} 
                    className="py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Reiniciar
                  </button>
                </div>
                <EndGameButton onEnd={() => submitScore(score)} />
              </div>

              {scoreError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{scoreError}</p>
                </div>
              )}
            </div>

            {/* Instructions Card */}
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
              <GameInstructions 
                title="Cómo Jugar Sudoku"
                description="Completa la cuadrícula 9x9 con números del 1 al 9. Cada fila, columna y caja 3x3 debe contener todos los números del 1 al 9 sin repetir. Usa la lógica y eliminación para resolver el puzzle."
                controls={[
                  { key: 'Clic', action: 'Seleccionar casilla' },
                  { key: '1-9', action: 'Ingresar número' }
                ]}
                note="Empieza por las filas, columnas o cajas con más números dados. Busca los números que solo pueden ir en una posición."
              />
            </div>
          </motion.section>

          {/* RIGHT: Sudoku Grid */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 flex items-center justify-center">
              <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border-4 border-purple-500/20 shadow-2xl shadow-purple-500/20">
                <div 
                  className="grid gap-0"
                  style={{ gridTemplateColumns: "repeat(9, 44px)" }}
                >
                  {grid.flat().map((v, i) => {
                    const r = Math.floor(i / 9)
                    const c = i % 9
                    const isConf = conflicts.has(`${r},${c}`)
                    const fixed = PUZZLES[level - 1][r][c] !== 0
                    
                    // Grid borders for 3x3 boxes - thicker borders at box boundaries
                    const borderTop = r % 3 === 0 ? 'border-t-4 border-t-purple-400/60' : 'border-t border-t-purple-500/20'
                    const borderLeft = c % 3 === 0 ? 'border-l-4 border-l-purple-400/60' : 'border-l border-l-purple-500/20'
                    const borderRight = c === 8 ? 'border-r-4 border-r-purple-400/60' : ''
                    const borderBottom = r === 8 ? 'border-b-4 border-b-purple-400/60' : ''

                    return (
                      <motion.input
                        key={`${r},${c}`}
                        value={v === 0 ? "" : String(v)}
                        onChange={(e) => onChange(r, c, e.target.value)}
                        disabled={fixed}
                        whileFocus={{ scale: 1.1, zIndex: 10 }}
                        className={`w-11 h-11 text-center text-xl font-bold transition-all
                          ${borderTop} ${borderLeft} ${borderRight} ${borderBottom}
                          ${fixed 
                            ? "bg-slate-800 text-purple-300 cursor-not-allowed" 
                            : "bg-slate-900 text-white focus:bg-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-500"}
                          ${isConf ? "bg-red-900/40! ring-2! ring-red-500! animate-pulse" : ""}
                        `}
                        maxLength={1}
                        type="text"
                        inputMode="numeric"
                        pattern="[1-9]"
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.section>

        </div>

      </div>
    </main>
  )
}
