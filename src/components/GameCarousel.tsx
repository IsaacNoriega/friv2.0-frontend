import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Game {
  title: string;
  desc: string;
  record: string;
  colorFrom: string;
  colorTo: string;
  route: string;
  premium?: boolean;
}

interface GameCarouselProps {
  title: string;
  games: Game[];
  isPremium?: boolean;
  onPremiumClick?: () => void;
}

function GameButton({ route, isPremium, onPremiumClick }: { 
  route?: string;
  isPremium?: boolean;
  onPremiumClick?: () => void;
}) {
  const navigate = useNavigate();
  const onPlay = () => {
    if (isPremium) {
      onPremiumClick?.();
    } else if (route) {
      navigate(route);
    } else {
      alert('Función de juego no implementada (demo)');
    }
  };

  return (
    <button 
      onClick={onPlay} 
      className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-md text-white font-semibold" 
      style={{background: `linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`}}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3v18l15-9L5 3z" stroke="currentColor" strokeWidth="0" fill="white"/>
      </svg>
      {isPremium ? 'Desbloquear' : 'Jugar Ahora'}
    </button>
  );
}

export default function GameCarousel({ title, games, isPremium, onPremiumClick }: GameCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScores, setUserScores] = useState<Record<string, number>>({});

  const scrollPrev = () => {
    const el = containerRef.current;
    if (!el) return;
    const visibleCount = Math.max(1, Math.floor(el.clientWidth / (el.clientWidth / 3)));
    const newIndex = Math.max(0, currentIndex - visibleCount);
    setCurrentIndex(newIndex);
    el.scrollTo({ left: newIndex * (el.clientWidth / visibleCount), behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = containerRef.current;
    if (!el) return;
    const visibleCount = Math.max(1, Math.floor(el.clientWidth / (el.clientWidth / 3)));
    const maxIndex = Math.max(0, games.length - visibleCount);
    const newIndex = Math.min(maxIndex, currentIndex + visibleCount);
    setCurrentIndex(newIndex);
    el.scrollTo({ left: newIndex * (el.clientWidth / visibleCount), behavior: 'smooth' });
  };

  const scrollToEnd = () => {
    const el = containerRef.current;
    if (!el) return;
    const visibleCount = Math.max(1, Math.floor(el.clientWidth / (el.clientWidth / 3)));
    const lastIndex = Math.max(0, games.length - visibleCount);
    setCurrentIndex(lastIndex);
    el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'smooth' });
  }

  useEffect(() => {
    // Only attempt to fetch if token exists
    const token = localStorage.getItem('token');
    if (!token) return;

    let mounted = true;
    api.getMyScores()
      .then((res: { user: string; scores: Array<{ name: string; score: number }> }) => {
        if (!mounted) return;
        const scoresArr = res?.scores || [];
        const map: Record<string, number> = {};
        scoresArr.forEach((s: { name: string; score: number }) => {
          if (!s) return;
          // store by returned name key (lowercase for easier matching)
          map[String(s.name).toLowerCase()] = Number(s.score || 0);
        });
        setUserScores(map);
      })
      .catch(() => {
        // ignore errors (unauthenticated or network) — fall back to default record
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handler = (ev: Event) => {
      const ce = ev as CustomEvent<{ name: string; score: number }>;
      const n = String(ce.detail?.name || '').toLowerCase();
      const s = Number(ce.detail?.score || 0);
      if (!n) return;
      setUserScores(prev => ({ ...prev, [n]: s }));
    };
    window.addEventListener('score:updated', handler as EventListener);
    return () => window.removeEventListener('score:updated', handler as EventListener);
  }, []);

  const getUserScoreForGame = (g: Game) => {
    // Build normalized candidate keys (lower-case) to match how we store scores
    const candidates = [] as string[];
    if (g.title) candidates.push(g.title.toLowerCase());
    if (g.route) candidates.push(g.route.toLowerCase());
    if (g.route) {
      const seg = g.route.split('/').filter(Boolean).pop();
      if (seg) candidates.push(seg.toLowerCase());
    }
    for (const key of candidates) {
      if (!key) continue;
      if (userScores[key] !== undefined) return userScores[key];
    }
    return undefined;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {isPremium && (
            <p className="text-amber-400 text-sm">Exclusivo para usuarios premium</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={scrollPrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-slate-800/50 text-white hover:bg-slate-700/50 disabled:opacity-30"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            onClick={scrollNext}
            disabled={currentIndex >= games.length - 3}
            className="p-2 rounded-lg bg-slate-800/50 text-white hover:bg-slate-700/50 disabled:opacity-30"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={scrollToEnd}
            className="p-2 rounded-lg bg-slate-800/50 text-white hover:bg-slate-700/50"
            aria-label="Ir al final"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 6l7 6-7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6h7v12h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="grid grid-flow-col auto-cols-[calc(33.333%-1rem)] gap-6 overflow-x-auto overflow-y-hidden scroll-pl-2 snap-x snap-mandatory hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {games.map((g) => (
          <article key={g.title} className="relative bg-[#0f2430] rounded-xl overflow-hidden transform transition-all duration-150 snap-start border-2 border-slate-800 hover:border-sky-500/60 hover:shadow-lg"
            style={{ minWidth: 'min(33.333%, 320px)' }}>
            <div 
              style={{background: `linear-gradient(90deg, ${g.colorFrom}, ${g.colorTo})`}} 
              className="h-28 rounded-t-xl flex items-center justify-center relative"
            >
              {/* Placeholder graphic */}
              <div className="w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm" />
              {/* Premium badge top-left */}
              {isPremium && (
                <div className="absolute top-2 left-2 text-amber-400 text-xs font-semibold bg-black/30 px-2 py-1 rounded">
                  PREMIUM
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-xl font-medium mb-2">{g.title}</h3>
              <p className="text-slate-400 text-sm mb-4">{g.desc}</p>

              <div className="flex items-center gap-3 text-slate-300 mb-4">
                <span className="text-yellow-400">🏆</span>
                <span className="text-sm">Record: <span className={`font-semibold ${getUserScoreForGame(g) !== undefined ? 'text-emerald-300' : 'text-white'}`}>{(getUserScoreForGame(g) ?? g.record)}</span></span>
                {getUserScoreForGame(g) !== undefined && (
                  <span className="ml-2 bg-emerald-400 text-black text-xs px-2 py-0.5 rounded">Mi record</span>
                )}
              </div>

              <div>
                <GameButton 
                  route={g.route}
                  isPremium={isPremium}
                  onPremiumClick={onPremiumClick}
                />
              </div>
            </div>

            {/* Lock overlay when carousel is in premium-locked mode */}
            {isPremium && (
              <button
                onClick={() => onPremiumClick?.()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center text-white p-4"
                aria-label="Desbloquear contenido premium"
              >
                <div className="text-center">
                  <svg className="mx-auto mb-2 w-8 h-8 opacity-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor" />
                    <path d="M7 10V8a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="4" y="10" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="font-semibold">Contenido Premium</div>
                  <div className="text-sm text-slate-200/80">Haz clic para desbloquear</div>
                </div>
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}