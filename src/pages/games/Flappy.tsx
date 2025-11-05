import { useEffect, useRef, useState } from 'react'

export default function Flappy(){
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('flappy_best') || 0))

  useEffect(()=>{
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    const DPR = window.devicePixelRatio || 1
    function resize(){
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * DPR
      canvas.height = rect.height * DPR
      ctx.scale(DPR, DPR)
    }
    resize()
    window.addEventListener('resize', resize)

    // game state
    const W = 480
    const H = 360
  let birdY = H/2
  const birdX = 80
    let vy = 0
    const gravity = 0.45
    const jump = -8
  type Pipe = { x: number, gapY: number, scored?: boolean }
    let pipes: Pipe[] = []
    let tick = 0
    let alive = true

    function spawnPipe(){
      const gapY = 80 + Math.random() * (H - 240)
      pipes.push({ x: W + 20, gapY })
    }

    function reset(){
      birdY = H/2
      vy = 0
      pipes = []
      tick = 0
      setScore(0)
      alive = true
      spawnPipe()
    }

    function flap(){
      vy = jump
    }

    function step(){
      if (!alive) return
      tick += 1
      // spawn pipe every 100 ticks (~1.6s)
      if (tick % 100 === 0) spawnPipe()
      // update
      vy += gravity
      birdY += vy
      // move pipes
      pipes = pipes.map(p => ({ ...p, x: p.x - 2.6 }))
      // remove passed
      if (pipes.length && pipes[0].x < -60) pipes.shift()
  // score when passing center
  pipes.forEach(p => { if (!p.scored && p.x + 20 < birdX){ p.scored = true; setScore(s => s+1) } })
      // collisions
      for (const p of pipes){
        const pipeW = 52
        const gap = 100
        if (birdX + 12 > p.x && birdX - 12 < p.x + pipeW){
          if (birdY - 12 < p.gapY - gap/2 || birdY + 12 > p.gapY + gap/2){
            alive = false
          }
        }
      }
      // ground / ceiling
      if (birdY > H - 10 || birdY < 0){ alive = false }
    }

    function draw(){
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0,0,rect.width,rect.height)
      // background
      ctx.fillStyle = '#071123'
      ctx.fillRect(0,0,rect.width,rect.height)
      // bird
      ctx.fillStyle = '#ffcc00'
      ctx.beginPath()
      ctx.arc(birdX, birdY, 12, 0, Math.PI*2)
      ctx.fill()
      // pipes
      ctx.fillStyle = '#0ea5e9'
      pipes.forEach(p => {
        const pipeW = 52
        const gap = 100
        ctx.fillRect(p.x, 0, pipeW, p.gapY - gap/2)
        ctx.fillRect(p.x, p.gapY + gap/2, pipeW, rect.height - (p.gapY + gap/2))
      })
      // score
      ctx.fillStyle = '#fff'
      ctx.font = '18px monospace'
      ctx.fillText(`Score: ${score}`, 12, 22)
      ctx.fillText(`Best: ${best}`, 12, 42)
      if (!alive){
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, rect.height/2 - 40, rect.width, 80)
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over - Click to Restart', rect.width/2, rect.height/2)
        ctx.textAlign = 'start'
      }
    }

    function loop(){
      step()
      draw()
      raf = requestAnimationFrame(loop)
      if (!alive){
        // save best
        setBest(b => { const nb = Math.max(b, score); localStorage.setItem('flappy_best', String(nb)); return nb })
      }
    }
    reset()
    raf = requestAnimationFrame(loop)

    // input
    function onKey(e: KeyboardEvent){ if (e.code === 'Space') flap() }
  function onClick(){ if (!alive){ reset(); } else flap() }
    window.addEventListener('keydown', onKey)
    canvas.addEventListener('click', onClick)

    return ()=>{
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('click', onClick)
    }
  },[score, best])

  return (
    <main className="p-6 text-slate-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Flappy Bird</h1>
            <p className="text-slate-400 text-sm">Pulsa espacio o haz click para volar. Click para reiniciar tras perder.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">Score: <span className="font-semibold text-white">{score}</span></div>
            <div className="text-sm text-slate-300">Best: <span className="font-semibold text-white">{best}</span></div>
          </div>
        </header>

        <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4">
          <div style={{ width: '100%', maxWidth: 480 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: 360, display: 'block', borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </main>
  )
}
