import { useEffect, useRef, useState } from 'react';

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('gameMusicMuted');
    return saved === 'true';
  });

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/soundtracks/mainSoundTrack.mp3');
    audio.loop = true;
    audio.volume = 0.15; // Set to 15% volume (not too strong)
    audioRef.current = audio;

    // Play if not muted
    if (!isMuted) {
      audio.play().catch(() => {
        // Autoplay might be blocked, ignore error
      });
    }

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update muted state
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    }
    localStorage.setItem('gameMusicMuted', String(isMuted));
  }, [isMuted]);

  const toggleMute = () => setIsMuted(prev => !prev);

  return { isMuted, toggleMute };
}
