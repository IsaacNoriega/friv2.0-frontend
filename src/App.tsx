import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LoginComponent } from "./pages/Login";
import { RegisterComponent } from "./pages/Register";
import GoogleCallback from "./pages/GoogleCallback";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Ranking from "./pages/Ranking";
import Score from "./pages/Score";
import Profile from "./pages/Profile";
import Memorama from "./pages/games/Memorama";
import Blackjack from "./pages/games/Blackjack";
import Flappy from "./pages/games/Flappy";
import Game2048 from "./pages/games/Game2048";
import Tetris from "./pages/games/Tetris";
import Pacman from "./pages/games/Pacman";
import Ahorcado from "./pages/games/Ahorcado";
import Minesweeper from "./pages/games/Minesweeper";
import Snake from "./pages/games/Snake";
import Battleship from "./pages/games/Battleship";
import Connect4 from "./pages/games/Connect4";
import Sudoku from "./pages/games/Sudoku";
import SimonDice from "./pages/games/SimonDice";
import Clicker from "./pages/games/Clicker";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // derive current active view from pathname (keep as a plain string to avoid cross-file type mismatch)
  const path = location.pathname;
  let current: string = "dashboard";
  if (path.startsWith("/ranking")) current = "ranking";
  else if (path.startsWith("/score")) current = "score";
  else if (path.startsWith("/profile")) current = "profile";

  const onNavigate = (v: string) => {
    if (v === "dashboard") navigate("/dashboard");
    if (v === "ranking") navigate("/ranking");
    if (v === "score") navigate("/score");
    if (v === "profile") navigate("/profile");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar current={current as any} onNavigate={onNavigate as any} />
      <div className="flex-1 bg-[#071123]">
        {/* Mobile top nav (visible on small screens) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#071123] border-b border-slate-800 flex items-center gap-2 p-2 px-4">
          <div className="text-sky-200 font-semibold">Friv 2.0</div>
          <div className="flex gap-2 ml-auto">
            <button aria-label="Juegos" onClick={() => onNavigate('dashboard')} className={`p-2 rounded-md text-slate-200 hover:bg-[rgba(255,255,255,0.02)]`}>🏠</button>
            <button aria-label="Ranking" onClick={() => onNavigate('ranking')} className={`p-2 rounded-md text-slate-200 hover:bg-[rgba(255,255,255,0.02)]`}>🏆</button>
            <button aria-label="Mis Scores" onClick={() => onNavigate('score')} className={`p-2 rounded-md text-slate-200 hover:bg-[rgba(255,255,255,0.02)]`}>📊</button>
            <button aria-label="Perfil" onClick={() => onNavigate('profile')} className={`p-2 rounded-md text-slate-200 hover:bg-[rgba(255,255,255,0.02)]`}>👤</button>
          </div>
        </div>

        {/* content area: add top padding on mobile so content doesn't hide behind mobile nav */}
        <div className="pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginComponent onGuest={(u) => setUser(u)} />} />
        <Route path="/register" element={<RegisterComponent />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

        {/* Protected layout routes (visual-only) */}
        <Route element={<Layout />}> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/score" element={<Score />} />
          <Route path="/memorama" element={<Memorama />} />
          <Route path="/blackjack" element={<Blackjack />} />
          <Route path="/flappy" element={<Flappy />} />
          <Route path="/2048" element={<Game2048 />} />
          <Route path="/tetris" element={<Tetris />} />
          <Route path="/pacman" element={<Pacman />} />
          <Route path="/ahorcado" element={<Ahorcado />} />
          <Route path="/minesweeper" element={<Minesweeper />} />
          <Route path="/snake" element={<Snake />} />
          <Route path="/battleship" element={<Battleship />} />
          <Route path="/connect4" element={<Connect4 />} />
          <Route path="/sudoku" element={<Sudoku />} />
          <Route path="/simondice" element={<SimonDice />} />
          <Route path="/clicker" element={<Clicker />} />
          <Route path="/profile" element={<Profile user={user} onSave={(u)=>{ console.log('profile save', u); }} />} />
        </Route>

        <Route path="*" element={<h2 className="text-center text-white mt-10">404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
