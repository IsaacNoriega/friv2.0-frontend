import { useEffect, useRef, useState } from "react";
import GameInstructions from '../../components/GameInstructions'
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';

export default function Flappy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() =>
    Number(localStorage.getItem("flappy_best") || 0)
  );
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { submitScore } = useGameScore('flappy');

  useEffect(() => {
    if (!running) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const DPR = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Constantes del juego
    const W = 480;
    const H = 360;
    const gravity = 0.45;
    const jump = -8;
    const pipeSpeed = 2.6;
    const gap = 100;

    // Estado del juego
    let birdY = H / 2;
    const birdX = 80;
    let vy = 0;
    type Pipe = { x: number; gapY: number; scored?: boolean };
    let pipes: Pipe[] = [];
    let tick = 0;
    let alive = true;
    let internalScore = 0;

    function spawnPipe() {
      const gapY = 80 + Math.random() * (H - 240);
      pipes.push({ x: W + 20, gapY });
    }

    function reset() {
      birdY = H / 2;
      vy = 0;
      pipes = [];
      tick = 0;
      internalScore = 0;
      alive = true;
      spawnPipe();
      setScore(0);
      setGameOver(false);
    }

    function flap() {
      if (!alive) return;
      vy = jump;
    }

    function step() {
      tick += 1;
      if (tick % 100 === 0) spawnPipe();

      vy += gravity;
      birdY += vy;

      // Mover tubos
      pipes = pipes.map((p) => ({ ...p, x: p.x - pipeSpeed }));
      if (pipes.length && pipes[0].x < -60) pipes.shift();

      // Puntuar al pasar un tubo
      pipes.forEach((p) => {
        if (!p.scored && p.x + 20 < birdX) {
          p.scored = true;
          internalScore++;
          setScore(internalScore);
        }
      });

      // Colisiones
      for (const p of pipes) {
        const pipeW = 52;
        if (birdX + 12 > p.x && birdX - 12 < p.x + pipeW) {
          if (birdY - 12 < p.gapY - gap / 2 || birdY + 12 > p.gapY + gap / 2) {
            alive = false;
          }
        }
      }

      // Suelo / techo
      if (birdY > H - 10 || birdY < 0) alive = false;

      // Si muere, detener y mostrar "Game Over"
      if (!alive) {
        setBest((b) => {
          const nb = Math.max(b, internalScore);
          localStorage.setItem("flappy_best", String(nb));
          return nb;
        });
        setGameOver(true);
        // enviar puntuación final
        submitScore(internalScore).catch(() => {});
        setRunning(false);
      }
    }

    function draw() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "#071123";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Bird
      ctx.fillStyle = "#ffcc00";
      ctx.beginPath();
      ctx.arc(birdX, birdY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Tubos
      ctx.fillStyle = "#0ea5e9";
      pipes.forEach((p) => {
        const pipeW = 52;
        ctx.fillRect(p.x, 0, pipeW, p.gapY - gap / 2);
        ctx.fillRect(
          p.x,
          p.gapY + gap / 2,
          pipeW,
          rect.height - (p.gapY + gap / 2)
        );
      });

      // Score
      ctx.fillStyle = "#fff";
      ctx.font = "18px monospace";
      ctx.fillText(`Score: ${internalScore}`, 12, 22);
      ctx.fillText(`Best: ${best}`, 12, 42);
    }

    function loop() {
      step();
      draw();
      if (alive) raf = requestAnimationFrame(loop);
    }

    // Controles
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") flap();
    }
    function onClick() {
      flap();
    }

    reset();
    raf = requestAnimationFrame(loop);
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("click", onClick);
    };
  }, [running, best, submitScore]);

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[#071123]">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Flappy Bird 🐤</h1>
            <p className="text-slate-400 text-sm">
              Pulsa <b>Espacio</b> o haz click para volar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              Score: <span className="font-semibold text-white">{score}</span>
            </div>
            <div className="text-sm text-slate-300">
              Best: <span className="font-semibold text-white">{best}</span>
            </div>
            <EndGameButton />
          </div>
  </header>

  <GameInstructions 
          title="Cómo Jugar Flappy Bird"
          description="Haz clic o presiona Espacio para que el pájaro aletee y suba. Pasa entre los tubos sin chocar. Cada tubo superado suma 1 punto. ¡La gravedad te empuja hacia abajo constantemente!"
          controls={[
            { key: 'Espacio', action: 'Aletear / Saltar' },
            { key: 'Clic', action: 'Aletear / Saltar' }
          ]}
          note="El tiempo de reacción es clave. Mantén un ritmo constante de clics para volar suavemente."
        />

  <div className="bg-[#0e1b26] rounded-xl border border-slate-800 p-4 relative">
          <div style={{ width: "100%", maxWidth: 480, position: "relative" }}>
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: 360,
                display: "block",
                borderRadius: 8,
              }}
            />
            {!running && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-md">
                {gameOver ? (
                  <>
                    <div className="text-xl mb-2">💀 Game Over 💀</div>
                    <div className="text-sm text-slate-300 mb-4">
                      Score final: <b>{score}</b>
                    </div>
                    <button
                      onClick={() => setRunning(true)}
                      className="px-4 py-2 bg-[#5b34ff] text-white rounded-md font-semibold"
                    >
                      Reintentar
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xl mb-3 font-semibold">
                      🕹️ Flappy Bird
                    </div>
                    <button
                      onClick={() => setRunning(true)}
                      className="px-4 py-2 bg-[#5b34ff] text-white rounded-md font-semibold"
                    >
                      Empezar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
