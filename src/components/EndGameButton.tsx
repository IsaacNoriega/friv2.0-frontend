import { useNavigate } from 'react-router-dom';

interface EndGameButtonProps {
  onEnd?: () => void;
  className?: string;
  isSubmitting?: boolean;
}

export function EndGameButton({ onEnd, className = '', isSubmitting = false }: EndGameButtonProps) {
  const navigate = useNavigate();

  const handleEndGame = () => {
    if (onEnd) {
      onEnd();
    }
    navigate('/dashboard');
  };

  return (
    <button
      onClick={handleEndGame}
      disabled={isSubmitting}
      className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 ${className}`}
    >
      {isSubmitting ? 'Guardando...' : 'Finalizar Juego'}
    </button>
  );
}
