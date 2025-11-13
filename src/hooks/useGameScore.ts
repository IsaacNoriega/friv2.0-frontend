import { useState } from 'react';
import { api } from '../services/api';


export const useGameScore = (gameName: string) => {
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
      // Notify other components (e.g. carousel) that this user's score updated
      try {
        const evt = new CustomEvent('score:updated', { detail: { name: gameName, score: result.best } });
        window.dispatchEvent(evt);
      } catch {
        // ignore if CustomEvent not supported in environment
      }
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