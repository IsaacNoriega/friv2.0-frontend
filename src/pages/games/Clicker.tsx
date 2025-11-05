import React, { useEffect, useState } from "react";

type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: () => void;
  purchased: boolean;
};

export default function Clicker() {
  const [score, setScore] = useState(0);
  const [pointsPerClick, setPointsPerClick] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);

  // Cargar progreso guardado
  useEffect(() => {
    const savedScore = localStorage.getItem("score");
    const savedPPC = localStorage.getItem("ppc");
    const savedAuto = localStorage.getItem("auto");
    if (savedScore) setScore(parseInt(savedScore));
    if (savedPPC) setPointsPerClick(parseInt(savedPPC));
    if (savedAuto) setAutoClickers(parseInt(savedAuto));
  }, []);

  // Guardar progreso
  useEffect(() => {
    localStorage.setItem("score", score.toString());
    localStorage.setItem("ppc", pointsPerClick.toString());
    localStorage.setItem("auto", autoClickers.toString());
  }, [score, pointsPerClick, autoClickers]);

  // Efecto autoclick
  useEffect(() => {
    if (autoClickers > 0) {
      const interval = setInterval(() => {
        setScore((s) => s + autoClickers);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClickers]);

  // Inicializar upgrades
  useEffect(() => {
    setUpgrades([
      {
        id: "ppc",
        name: "Mano fuerte 💪",
        description: "Cada clic vale +1 punto adicional.",
        cost: 50,
        effect: () => setPointsPerClick((p) => p + 1),
        purchased: false,
      },
      {
        id: "auto",
        name: "Click automático 🤖",
        description: "Ganas 1 punto por segundo automáticamente.",
        cost: 100,
        effect: () => setAutoClickers((a) => a + 1),
        purchased: false,
      },
      {
        id: "double",
        name: "Click doble ⚡",
        description: "Duplica tus puntos por clic.",
        cost: 250,
        effect: () => setPointsPerClick((p) => p * 2),
        purchased: false,
      },
    ]);
  }, []);

  function handleClick() {
    setScore((s) => s + pointsPerClick);
  }

  function buyUpgrade(id: string) {
    const up = upgrades.find((u) => u.id === id);
    if (!up || up.purchased || score < up.cost) return;
    setScore((s) => s - up.cost);
    up.effect();
    setUpgrades((prev) =>
      prev.map((u) => (u.id === id ? { ...u, purchased: true } : u))
    );
  }

  function resetGame() {
    if (window.confirm("¿Reiniciar el progreso?")) {
      localStorage.clear();
      setScore(0);
      setPointsPerClick(1);
      setAutoClickers(0);
      setUpgrades((prev) => prev.map((u) => ({ ...u, purchased: false })));
    }
  }

  return (
    <main className="p-6 text-slate-100 min-h-screen bg-[linear-gradient(180deg,#071123_0%,#071726_100%)]">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">💥 Clicker Game</h1>
            <p className="text-slate-400 text-sm">
              Haz clic para ganar puntos y compra mejoras.
            </p>
          </div>
          <button
            onClick={resetGame}
            className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700"
          >
            Reiniciar
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Panel de juego */}
          <div className="bg-[#0e1b26] p-6 rounded-xl border border-slate-800 text-center">
            <div className="text-4xl font-bold mb-2">{score}</div>
            <p className="text-slate-400 mb-4">
              +{pointsPerClick} por clic {autoClickers > 0 && `• ${autoClickers}/s`}
            </p>
            <button
              onClick={handleClick}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] text-white text-lg font-semibold shadow-md hover:scale-105 transition"
            >
              ¡Clic!
            </button>
          </div>

          {/* Tienda */}
          <div className="bg-[#0e1b26] p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-semibold mb-3">🛒 Tienda</h2>
            <div className="space-y-3">
              {upgrades.map((u) => (
                <div
                  key={u.id}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    u.purchased ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-700"
                  }`}
                >
                  <div>
                    <h3 className="font-semibold">{u.name}</h3>
                    <p className="text-sm text-slate-400">{u.description}</p>
                  </div>
                  <button
                    disabled={u.purchased || score < u.cost}
                    onClick={() => buyUpgrade(u.id)}
                    className={`py-1 px-3 rounded-md text-sm font-semibold ${
                      u.purchased
                        ? "bg-emerald-600 text-black"
                        : score >= u.cost
                        ? "bg-gradient-to-r from-[#5b34ff] to-[#ff3fb6] text-white"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {u.purchased ? "Comprado" : `${u.cost} pts`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
