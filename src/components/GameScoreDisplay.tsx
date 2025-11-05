import { useNavigate } from 'react-router-dom';

interface GameScoreDisplayProps {
  lastScore: number | null;
  bestScore: number | null;
  isSubmitting?: boolean;
  onFinish?: () => void;
}

export function GameScoreDisplay({ lastScore, bestScore, isSubmitting, onFinish }: GameScoreDisplayProps) {
  const navigate = useNavigate();

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    }
    navigate('/dashboard');
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <div className="space-y-2">
        {bestScore !== null && (
          <div className="text-yellow-400">
            Mejor: {bestScore}
          </div>
        )}
        {lastScore !== null && (
          <div className="text-blue-400">
            Último: {lastScore}
          </div>
        )}
        <button
          onClick={handleFinish}
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Guardando...' : 'Finalizar Juego'}
        </button>
      </div>
    </div>
  );
}