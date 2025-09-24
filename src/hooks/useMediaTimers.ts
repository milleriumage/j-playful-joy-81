
import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useGoogleAuth } from './useGoogleAuth';
import { useMemoryOptimization } from './useMemoryOptimization';

interface MediaTimer {
  id: string;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  remainingSeconds: number;
  audioFile?: File;
  audioUrl?: string;
  alertSeconds?: number;
  alertMessage?: string;
  isActive: boolean;
  hasPlayedAlert: boolean;
}

export const useMediaTimers = (onMediaExpire: (id: string) => void) => {
  const [timers, setTimers] = useState<MediaTimer[]>([]);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useGoogleAuth();
  const { safeSetInterval, addCleanup } = useMemoryOptimization();

  // Limpar timers quando o usuário muda
  useEffect(() => {
    setTimers([]);
    audioRefs.current.clear();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [user?.id]);

  // Calculate if there are active timers
  const hasActiveTimers = timers.some(t => t.isActive);

  // OTIMIZAÇÃO: Start interval when first timer is added, stop when no timers
  useEffect(() => {
    if (hasActiveTimers && !intervalRef.current) {
      console.log('🕐 Starting timer interval');
      intervalRef.current = safeSetInterval(() => {
        setTimers(prevTimers => {
          // OTIMIZAÇÃO: Filtrar timers ativos primeiro para reduzir iterações
          const activeTimers = prevTimers.filter(timer => timer.isActive && timer.remainingSeconds > 0);
          
          if (activeTimers.length === 0) {
            return prevTimers;
          }

          const updatedTimers = prevTimers.map(timer => {
            if (!timer.isActive || timer.remainingSeconds <= 0) {
              return timer;
            }

            const newRemaining = timer.remainingSeconds - 1;

            // Check if we should play alert sound
            if (timer.alertSeconds && !timer.hasPlayedAlert && newRemaining <= timer.alertSeconds) {
              if (timer.audioUrl) {
                const audio = audioRefs.current.get(timer.id);
                if (audio) {
                  audio.play().catch(console.error);
                }
              }
              
              if (timer.alertMessage) {
                toast.warning(timer.alertMessage);
              }

              return { ...timer, remainingSeconds: newRemaining, hasPlayedAlert: true };
            }

            // Check if timer expired
            if (newRemaining <= 0) {
              onMediaExpire(timer.id);
              toast.info("⏰ Mídia removida - tempo esgotado!");
              return { ...timer, remainingSeconds: 0, isActive: false };
            }

            return { ...timer, remainingSeconds: newRemaining };
          });
          
          return updatedTimers;
        });
      }, 1000);
    } else if (!hasActiveTimers && intervalRef.current) {
      console.log('🔄 Stopping timer interval - no active timers');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasActiveTimers, onMediaExpire, safeSetInterval]);

  // OTIMIZAÇÃO: Cleanup automático de recursos
  useEffect(() => {
    addCleanup(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Limpar todos os elementos de áudio
      audioRefs.current.forEach(audio => {
        audio.pause();
        if (audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }
      });
      audioRefs.current.clear();
    });
  }, [addCleanup]);

  const addTimer = (timer: Omit<MediaTimer, 'totalSeconds' | 'remainingSeconds' | 'isActive' | 'hasPlayedAlert'>) => {
    const totalSeconds = timer.minutes * 60 + timer.seconds;
    const newTimer: MediaTimer = {
      ...timer,
      totalSeconds,
      remainingSeconds: totalSeconds,
      isActive: true,
      hasPlayedAlert: false
    };

    // Create audio element if audio file provided
    if (timer.audioFile) {
      const audioUrl = URL.createObjectURL(timer.audioFile);
      const audio = new Audio(audioUrl);
      audioRefs.current.set(timer.id, audio);
      newTimer.audioUrl = audioUrl;
    }

    setTimers(prev => [...prev.filter(t => t.id !== timer.id), newTimer]);
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
    
    // Clean up audio
    const audio = audioRefs.current.get(id);
    if (audio) {
      audio.pause();
      if (audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
      audioRefs.current.delete(id);
    }
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id 
        ? { ...timer, remainingSeconds: timer.totalSeconds, isActive: true, hasPlayedAlert: false }
        : timer
    ));
  };

  const pauseTimer = (id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, isActive: false } : timer
    ));
  };

  const resumeTimer = (id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, isActive: true } : timer
    ));
  };

  const getTimer = (id: string) => timers.find(t => t.id === id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timers,
    addTimer,
    removeTimer,
    resetTimer,
    pauseTimer,
    resumeTimer,
    getTimer,
    formatTime
  };
};
