import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, FireIcon, SparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import GameInstructions from '../../components/GameInstructions';
import { EndGameButton } from '../../components/EndGameButton';
import { useGameScore } from '../../hooks/useGameScore';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';

type Card = {
  code: string; 
  value: number;
};

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      const code = `${r}${s}`;
      let value = 0;
      if (r === "A") value = 11;
      else if (["J","Q","K"].includes(r)) value = 10;
      else value = parseInt(r,10);
      deck.push({ code, value });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function handValue(cards: Card[]) {
  let total = cards.reduce((s,c)=>s+c.value,0);
  let aces = cards.filter(c=>c.code.startsWith("A")).length;
  while(total>21 && aces>0){ total-=10; aces--; }
  return total;
}

export default function Blackjack() {
  const [deck,setDeck] = useState<Card[]>([]);
  const [player,setPlayer] = useState<Card[]>([]);
  const [dealer,setDealer] = useState<Card[]>([]);
  const [message,setMessage] = useState<string>("");
  const [gameOver,setGameOver] = useState(false);
  const [score,setScore] = useState<number>(0);
  const [round,setRound] = useState<number>(1);

  const { submitScore, error: bestScore } = useGameScore('blackjack');
  const { isMuted, toggleMute } = useBackgroundMusic();

  const newGame = useCallback(()=>{
    const d = shuffle(buildDeck());
    const [p1,d1,p2,d2] = d;
    setDeck(d.slice(4));
    setPlayer([p1,p2]);
    setDealer([d1,d2]);
    setMessage("");
    setGameOver(false);
  },[]);

  useEffect(()=>{ newGame() },[newGame]);

  const playerValue = useMemo(()=>handValue(player),[player]);
  const dealerValue = useMemo(()=>handValue(dealer),[dealer]);

  useEffect(()=>{
    if(playerValue===21 && player.length===2){
      setMessage("¡Blackjack! +100 pts");
      setScore(s=>s+100);
      setGameOver(true);
      submitScore(score+100).catch(console.error);
    } else if(playerValue>21){
      setMessage("Te pasaste. Fin del juego.");
      setGameOver(true);
      submitScore(score).catch(console.error);
    }
  },[playerValue,player.length,score,submitScore]);

  function playerHit(){ if(gameOver || deck.length===0) return; const [c,...rest]=deck; setPlayer(p=>[...p,c]); setDeck(rest); }

  function dealerPlayAndResolve(){
    let d = [...deck]; let dh = [...dealer];
    while(handValue(dh)<17){ const [c,...rest]=d; dh=[...dh,c]; d=rest; }
    const pv = handValue(player); const dv = handValue(dh);
    setDealer(dh); setDeck(d);
    if(dv>21){ setMessage("Dealer se pasó. +100 pts"); setScore(s=>s+100); setGameOver(true); submitScore(score+100).catch(console.error);}
    else if(pv>dv){ setMessage("¡Ganaste! +100 pts"); setScore(s=>s+100); setGameOver(true); submitScore(score+100).catch(console.error);}
    else if(pv===dv){ setMessage("Empate +50 pts"); setScore(s=>s+50); setGameOver(true); submitScore(score+50).catch(console.error);}
    else { setMessage("Perdiste. Fin del juego."); setGameOver(true); submitScore(score).catch(console.error);}
  }

  function playerStand(){ if(gameOver) return; dealerPlayAndResolve(); }
  function nextRound(){ setRound(r=>r+1); newGame(); }

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
              <div className="text-5xl">🃏</div>
              <h1 className="text-5xl font-black bg-linear-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
                Blackjack
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
                <SpeakerWaveIcon className="w-6 h-6 text-emerald-400" />
              )}
            </button>
          </div>
          <p className="text-slate-400 text-lg ml-16">Alcanza 21 sin pasarte y vence al dealer</p>
        </motion.header>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

          {/* LEFT: Stats & Controls */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 space-y-4">
              
              {/* Round Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-emerald-400" />
                  <span className="text-sm text-slate-400">Ronda</span>
                </div>
                <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                  <span className="text-2xl font-black text-emerald-300">{round}</span>
                </div>
              </div>

              {/* Score Card */}
              <div className="p-4 bg-linear-to-br from-emerald-500/10 to-green-600/5 rounded-lg border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-emerald-300">Puntos Totales</span>
                  <FireIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-4xl font-black bg-linear-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                  {score.toLocaleString()}
                </div>
                {bestScore !== null && (
                  <div className="text-xs text-slate-400 mt-1">
                    Récord: {bestScore.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-300">Estado del Juego</span>
                </div>
                <AnimatePresence mode="wait">
                  {message ? (
                    <motion.p 
                      key={message}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-sm font-semibold ${
                        message.includes('Ganaste') || message.includes('Blackjack') 
                          ? 'text-emerald-400' 
                          : message.includes('Perdiste') || message.includes('pasaste')
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {message}
                    </motion.p>
                  ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-400 text-sm"
                    >
                      Esperando tu decisión...
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={playerHit} 
                    disabled={gameOver}
                    className="py-3 rounded-lg bg-linear-to-r from-emerald-500 to-green-600 text-black font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    🎯 Hit
                  </button>
                  <button 
                    onClick={playerStand} 
                    disabled={gameOver}
                    className="py-3 rounded-lg bg-linear-to-r from-amber-500 to-orange-600 text-black font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ✋ Stand
                  </button>
                </div>
                
                {gameOver && !message.includes("Fin del juego") && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={nextRound}
                    className="w-full py-3 rounded-lg bg-linear-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    ▶ Siguiente Ronda
                  </motion.button>
                )}
              </div>

              <EndGameButton onEnd={() => submitScore(score)} />
            </div>
          </motion.section>

          {/* RIGHT: Game Board */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-4 h-full flex flex-col justify-center">
              {/* Dealer Hand */}
              <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-200">🎩 Dealer</h2>
                  {gameOver && (
                    <div className="px-3 py-1 bg-slate-700/50 rounded-lg border border-slate-600">
                      <span className="text-lg font-bold text-white">{dealerValue}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <AnimatePresence>
                    {dealer.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-24 h-36 rounded-xl flex items-center justify-center text-2xl font-black border-2 shadow-xl ${
                          i === 1 && !gameOver
                            ? "bg-linear-to-br from-slate-700 to-slate-800 border-slate-600 text-transparent"
                            : c.code.includes("♥") || c.code.includes("♦")
                            ? "bg-white border-red-300 text-red-600"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      >
                        <span className={i === 1 && !gameOver ? "opacity-0" : ""}>
                          {c.code}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Player Hand */}
              <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-emerald-400">👤 Tu Mano</h2>
                  <div className="px-3 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/40">
                    <span className="text-lg font-bold text-emerald-300">{playerValue}</span>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <AnimatePresence>
                    {player.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-24 h-36 rounded-xl flex items-center justify-center text-2xl font-black border-2 shadow-xl ${
                          c.code.includes("♥") || c.code.includes("♦")
                            ? "bg-white border-red-300 text-red-600"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      >
                        {c.code}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.section>

        </div>

        {/* BOTTOM ROW: Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GameInstructions 
            title="Cómo Jugar Blackjack"
            description="Intenta llegar a 21 puntos sin pasarte. Las cartas numéricas valen su número, las figuras valen 10, y el As puede valer 1 u 11. Puedes pedir más cartas (Hit) o plantarte (Stand). Ganas si tu puntuación es mayor que la del dealer sin pasarte de 21."
            controls={[
              { key: 'Hit', action: 'Pedir otra carta' },
              { key: 'Stand', action: 'Plantarse' }
            ]}
            note="Si te pasas de 21, pierdes automáticamente. El dealer debe pedir carta hasta tener 17 o más."
          />
        </motion.div>

      </div>
    </main>
  );
}
