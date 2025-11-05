import { useState } from 'react';
import { api } from '../services/api';

interface UseGameScoreProps {
  gameName: string;
}

export const useGameScore = ({ gameName }: UseGameScoreProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const submitScore = async (score: number) => {
    if (!gameName || typeof score !== 'number') {
      setError('Nombre del juego y puntuación son requeridos');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.postGameScore(gameName, Math.floor(score));
      setLastScore(score);
      setBestScore(result.best);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la puntuación');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitScore,
    isSubmitting,
    error,
    lastScore,
    bestScore,
  };
};