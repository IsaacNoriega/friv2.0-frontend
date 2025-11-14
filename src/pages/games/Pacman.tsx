import { useEffect, useState, useRef, useCallback } from 'react'
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

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

function parseMap(): Cell[][] {
  return BASE_MAP.split('\n').map(r => r.split('') as Cell[])
}

export default function Pacman() {
  const [grid, setGrid] = useState<Cell[][]>(() => parseMap())
  const [pos, setPos] = useState({ r: 1, c: 1 })
  const [dots, setDots] = useState(0)
  const ghostRef = useRef({ r: 9, c: 15 })
  const [tick, setTick] = useState(0)
  const [win, setWin] = useState(false)
  const [started, setStarted] = useState(false)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [ghostSpeed, setGhostSpeed] = useState(500)
  const { submitScore, error: scoreError, bestScore } = useGameScore('pacman')

  // 🔹 contar puntos restantes
  useEffect(() => {
    let n = 0
    for (const row of grid)
      for (const cell of row)
        if (cell === '.') n++
    setDots(n)
  }, [grid])

  // 🔹 movimiento del Pacman
  useEffect(() => {
    if (!started || win) return
    function onKey(e: KeyboardEvent) {
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
      }
      const dir = moves[e.key]
      if (!dir) return
      e.preventDefault()

      const nr = pos.r + dir[0],
        nc = pos.c + dir[1]

      if (grid[nr] && grid[nr][nc] !== '#') {
        setPos({ r: nr, c: nc })
        setGrid((g) => {
          const copy = g.map((row) => row.slice()) as Cell[][]
          if (copy[nr][nc] === '.') {
            copy[nr][nc] = ' '
            setScore((s) => s + 10)
          }
          return copy
        })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pos, grid, win, started])

  // 🔹 movimiento del fantasma
  useEffect(() => {
    if (!started) return
    const id = setInterval(() => {
      setTick((t) => t + 1)
      const g = ghostRef.current
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]
      const cand = dirs
        .map((d) => ({ r: g.r + d[0], c: g.c + d[1] }))
        .filter((p) => grid[p.r] && grid[p.r][p.c] !== '#')

      if (cand.length) {
        ghostRef.current = cand[Math.floor(Math.random() * cand.length)]
      }
    }, ghostSpeed)

    return () => clearInterval(id)
  }, [grid, started, ghostSpeed])

  // ✅ SOLO guarda score si es récord
  const handleScoreSubmit = useCallback((scoreToSubmit: number) => {
    if (scoreToSubmit > (bestScore || 0)) {
      submitScore(scoreToSubmit).catch(console.error)
    }
  }, [bestScore, submitScore])

  // 🔹 detectar colisiones con fantasma
  useEffect(() => {
    if (!started) return

    const g = ghostRef.current
    if (g.r === pos.r && g.c === pos.c) {
      setLives((l) => {
        if (l <= 1) {
          setStarted(false)
          setWin(false)
          handleScoreSubmit(score)
          return 0
        }
        setPos({ r: 1, c: 1 })
        return l - 1
      })
    }
  }, [tick, pos, started, score, handleScoreSubmit])

  // ✅ detectar cuando gana (pero sin sumar score aquí)
  useEffect(() => {
    if (started && dots === 0 && !win) {
      setWin(true)
    }
  }, [dots, started, win])

  // ✅ sumar score SOLO UNA VEZ cuando win cambia a true
  useEffect(() => {
    if (!win) return

    const roundBonus = 100 * round

    setScore((prev) => {
      const newScore = prev + roundBonus
      handleScoreSubmit(newScore)
      return newScore
    })

    setTimeout(() => nextRound(), 1500)
  }, [win])

  function nextRound() {
    setRound((r) => r + 1)
    setGhostSpeed((s) => Math.max(200, s - 50))
    ghostRef.current = { r: 9, c: 15 }
    setGrid(parseMap())
    setPos({ r: 1, c: 1 })
    setWin(false)
  }

  function startGame() {
    setGrid(parseMap())
    setPos({ r: 1, c: 1 })
    ghostRef.current = { r: 9, c: 15 }
    setScore(0)
    setLives(3)
    setRound(1)
    setGhostSpeed(500)
    setStarted(true)
    setWin(false)
  }

  function restart() {
    startGame()
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#06111f_0%,#071726_100%)]">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Pacman</h1>
            <p className="text-slate-400 text-sm">Flechas para mover. Evita al fantasma.</p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div>Ronda: <span className="font-semibold text-white">{round}</span></div>
            <div>Vidas: <span className="font-semibold text-white">{lives}</span></div>

            <div className="text-right">
              <div className="text-sm mb-1">
                🎮 Puntos: <span className="font-bold">{score}</span>
              </div>
              <div className="text-xs text-slate-400">
                Récord: <span className="font-bold">{bestScore ?? 0}</span>
              </div>
              {scoreError && <div className="text-red-500 text-xs">{scoreError}</div>}
            </div>

            <EndGameButton />
            <button onClick={restart} className="px-3 py-1 bg-[#0ea5e9] rounded text-black text-sm">Reiniciar</button>
          </div>
        </header>

        <GameInstructions 
          title="Cómo Jugar Pacman"
          description="Come todos los puntos del laberinto mientras evitas a los fantasmas. Cuando comes una píldora grande (power pellet), los fantasmas se vuelven azules y puedes comértelos por puntos extra. ¡Limpia todo el laberinto para ganar!"
          controls={[
            { key: '←', action: 'Mover izquierda' },
            { key: '→', action: 'Mover derecha' },
            { key: '↑', action: 'Mover arriba' },
            { key: '↓', action: 'Mover abajo' }
          ]}
          note="Los fantasmas tienen diferentes patrones de movimiento. Observa sus comportamientos para evitarlos."
        />

        {!started ? (
          <div className="text-center mt-16">
            <h2 className="text-xl mb-3">Bienvenido a Pacman 🎮</h2>
            {lives === 0 ? <p className="text-slate-400 mb-4">Perdiste todas tus vidas</p> : <p className="text-slate-400 mb-4">Presiona para comenzar</p>}
            <button onClick={startGame} className="px-5 py-2 rounded-md bg-[#0ea5e9] text-black font-semibold">Empezar</button>
          </div>
        ) : (
          <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 overflow-auto">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, 22px)`, gap: 4 }}>
              {grid.flat().map((cell, i) => {
                const r = Math.floor(i / grid[0].length)
                const c = i % grid[0].length
                const isPac = pos.r === r && pos.c === c
                const ghost = ghostRef.current && ghostRef.current.r === r && ghostRef.current.c === c
                const bg = cell === '#' ? '#0b1220' : '#071f2f'
                return (
                  <div key={i} style={{ width: 22, height: 22, background: bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isPac ? (
                      <div style={{ width: 16, height: 16, background: '#ffcc00', borderRadius: 8 }} />
                    ) : ghost ? (
                      <div style={{ width: 16, height: 16, background: '#ef4444', borderRadius: 8 }} />
                    ) : cell === '.' ? (
                      <div style={{ width: 6, height: 6, background: '#fff', borderRadius: 3 }} />
                    ) : null}
                  </div>
                )
              })}
            </div>

            {win && <div className="mt-4 text-center text-white font-semibold">¡Ganaste la ronda {round}! 🎉</div>}
          </div>
        )}
      </div>
    </main>
  )
}
