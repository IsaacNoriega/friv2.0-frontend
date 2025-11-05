import React, { useState, useRef } from 'react';
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

function GameButton({ title, route, isPremium, onPremiumClick }: { 
  title: string; 
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

  const scrollPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      containerRef.current?.scrollTo({
        left: (currentIndex - 1) * (containerRef.current.clientWidth / 3),
        behavior: 'smooth'
      });
    }
  };

  const scrollNext = () => {
    if (currentIndex < games.length - 3) {
      setCurrentIndex(currentIndex + 1);
      containerRef.current?.scrollTo({
        left: (currentIndex + 1) * (containerRef.current.clientWidth / 3),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {isPremium && (
            <p className="text-amber-400 text-sm">Exclusivo para usuarios premium</p>
          )}
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      <div 
        ref={containerRef}
        className="grid grid-flow-col auto-cols-[calc(33.333%-1rem)] gap-6 overflow-x-hidden"
      >
        {games.map((g) => (
          <article key={g.title} className="bg-[#0f2430] rounded-xl shadow-inner overflow-hidden border border-slate-800">
            <div 
              style={{background: `linear-gradient(90deg, ${g.colorFrom}, ${g.colorTo})`}} 
              className="h-28 rounded-t-xl flex items-center justify-center relative"
            >
              {/* Placeholder graphic */}
              <div className="w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm" />
              {isPremium && (
                <div className="absolute top-2 right-2 text-amber-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6l2.4-7.4z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-xl font-medium mb-2">{g.title}</h3>
              <p className="text-slate-400 text-sm mb-4">{g.desc}</p>

              <div className="flex items-center gap-3 text-slate-300 mb-4">
                <span className="text-yellow-400">🏆</span>
                <span className="text-sm">Record: <span className="font-semibold text-white">{g.record}</span></span>
              </div>

              <div>
                <GameButton 
                  title={g.title} 
                  route={g.route}
                  isPremium={isPremium}
                  onPremiumClick={onPremiumClick}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}