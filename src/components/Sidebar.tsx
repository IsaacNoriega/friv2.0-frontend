import { auth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

type View = "login" | "register" | "dashboard" | "ranking" | "score" | "profile" | "guest";

function IconGames(){
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 12v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 12v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 12v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 12v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function IconTrophy(){
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8 3h8v4a3 3 0 01-3 3H11a3 3 0 01-3-3V3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 21h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconChart(){
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 13v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5v13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconUser(){
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

export default function Sidebar({ current, onNavigate }: { current: View; onNavigate: (v: View) => void; }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.getUser());

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<any>;
      setUser(ce.detail || null);
    };
    window.addEventListener('auth:changed', handler as EventListener);
    return () => window.removeEventListener('auth:changed', handler as EventListener);
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
  <aside className="hidden md:flex w-72 bg-linear-to-b from-[#0b1220] to-[#0e1724] p-6 text-slate-100 min-h-screen flex-col border-r-2 border-sky-700/20">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-800 mb-5">
        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#6a5cff] to-[#7ef0d9] flex items-center justify-center text-white text-lg">🎮</div>
        <div className="text-sky-200 font-semibold">Friv 2.0</div>
      </div>

  <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl mb-6 flex items-center gap-4 border border-sky-600/30 shadow-sm">
        <div className="w-14 h-14 rounded-lg bg-linear-to-br from-[#8c5bff] to-[#6aa6ff] flex items-center justify-center font-bold text-white text-lg ring-2 ring-sky-500/20">
          {user?.username?.slice(0, 2).toUpperCase() || 'IN'}
        </div>
        <div>
          <div className="font-semibold text-white">{user?.username || 'Invitado'}</div>
          <div className="text-slate-400 text-xs">{user?.hasPaid ? 'Usuario Premium' : 'Modo Gratuito'}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-3">
        <button onClick={() => onNavigate("dashboard")} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${current === "dashboard" ? 'bg-linear-to-r from-[#5b34ff] to-[#b144ff] text-white shadow-lg' : 'text-slate-300 hover:bg-[rgba(255,255,255,0.02)]'}`}>
          <span className="text-slate-200"><IconGames /></span>
          <span className="flex-1 text-left">Juegos</span>
        </button>

        <button onClick={() => onNavigate("ranking")} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${current === "ranking" ? 'bg-linear-to-r from-[#5b34ff] to-[#b144ff] text-white shadow-lg' : 'text-slate-300 hover:bg-[rgba(255,255,255,0.02)]'}`}>
          <span className="text-slate-400"><IconTrophy /></span>
          <span className="flex-1 text-left">Ranking</span>
        </button>

        <button onClick={() => onNavigate("score")} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${current === "score" ? 'bg-linear-to-r from-[#5b34ff] to-[#b144ff] text-white shadow-lg' : 'text-slate-300 hover:bg-[rgba(255,255,255,0.02)]'}`}>
          <span className="text-slate-400"><IconChart /></span>
          <span className="flex-1 text-left">Mis Scores</span>
        </button>

        <button onClick={() => onNavigate("profile")} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${current === "profile" ? 'bg-linear-to-r from-[#5b34ff] to-[#b144ff] text-white shadow-lg' : 'text-slate-300 hover:bg-[rgba(255,255,255,0.02)]'}`}>
          <span className="text-slate-400"><IconUser /></span>
          <span className="flex-1 text-left">Perfil</span>
        </button>
      </nav>

      <div className="mt-auto pt-6">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 text-sm hover:text-white hover:bg-red-500/10 w-full px-3 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
