import { auth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  TrophyIcon, 
  ChartBarIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

type View = "login" | "register" | "dashboard" | "ranking" | "score" | "profile" | "guest";

export default function Sidebar({ current, onNavigate }: { current: View; onNavigate: (v: View) => void; }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.getUser());

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<unknown>;
      setUser(ce.detail as typeof user || null);
    };
    window.addEventListener('auth:changed', handler as EventListener);
    return () => window.removeEventListener('auth:changed', handler as EventListener);
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const navItems = [
    { view: 'dashboard' as View, icon: HomeIcon, label: 'Juegos', gradient: 'from-sky-500 to-blue-500' },
    { view: 'ranking' as View, icon: TrophyIcon, label: 'Ranking', gradient: 'from-amber-500 to-orange-500' },
    { view: 'score' as View, icon: ChartBarIcon, label: 'Mis Scores', gradient: 'from-emerald-500 to-green-500' },
    { view: 'profile' as View, icon: UserCircleIcon, label: 'Perfil', gradient: 'from-purple-500 to-pink-500' },
  ];

  return (
    <aside className="hidden md:flex w-72 bg-linear-to-b from-[#050d1a] via-[#071123] to-[#0a1628] p-6 text-slate-100 min-h-screen flex-col border-r border-slate-800/50 shadow-2xl">
      {/* Logo/Brand */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center pb-6 border-b border-slate-700/50 mb-6"
      >
        <div className="w-24 h-24 rounded-xl flex items-center justify-center shadow-lg">
          <img src="/logo/logo.png" alt="FRIV 2.0" className="w-full h-full object-contain" />
        </div>
      </motion.div>

      {/* User card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl mb-6 border border-slate-700/50 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20">
              {user?.username?.slice(0, 2).toUpperCase() || 'GU'}
            </div>
            {user?.hasPaid && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-slate-900">
                <ShieldCheckIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white truncate">{user?.username || 'Invitado'}</div>
            {user?.hasPaid && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <SparklesIcon className="w-3 h-3" />
                <span>Premium</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = current === item.view;
          
          return (
            <motion.button
              key={item.view}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              onClick={() => onNavigate(item.view)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? `bg-linear-to-r ${item.gradient} text-white shadow-lg` 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-linear-to-r ${item.gradient} rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="flex-1 text-left relative z-10">{item.label}</span>
              {isActive && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 bg-white rounded-full relative z-10"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto pt-6 border-t border-slate-700/50"
      >
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 text-sm hover:text-red-400 hover:bg-red-500/10 w-full px-4 py-3 rounded-lg transition-all duration-200 group"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </motion.div>
    </aside>
  );
}
