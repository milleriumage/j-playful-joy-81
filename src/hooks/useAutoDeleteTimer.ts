import { useState, useRef } from 'react';
import { toast } from "sonner";

interface AutoDeleteTimer {
  mediaId: string;
  timeoutId: NodeJS.Timeout;
  expiresAt: number;
  minutes: number;
}

export const useAutoDeleteTimer = (onMediaDelete: (id: string) => void) => {
  const [activeTimers, setActiveTimers] = useState<AutoDeleteTimer[]>([]);
  const timerRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const startAutoDeleteTimer = (mediaId: string, minutes: number) => {
    // Clear existing timer for this media if any
    const existingTimeout = timerRefs.current.get(mediaId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timerRefs.current.delete(mediaId);
    }

    // Create new timer
    const timeoutId = setTimeout(() => {
      onMediaDelete(mediaId);
      
      // Clean up
      setActiveTimers(prev => prev.filter(t => t.mediaId !== mediaId));
      timerRefs.current.delete(mediaId);
      
      // Show notification
      toast.success(`⏰ Mídia removida automaticamente após ${minutes} minuto(s)!`);
    }, minutes * 60 * 1000);

    // Store timeout ID
    timerRefs.current.set(mediaId, timeoutId);

    // Update active timers state
    const newTimer: AutoDeleteTimer = {
      mediaId,
      timeoutId,
      expiresAt: Date.now() + (minutes * 60 * 1000),
      minutes
    };

    setActiveTimers(prev => [...prev.filter(t => t.mediaId !== mediaId), newTimer]);

    console.log(`🔥 Auto-delete timer started: ${minutes} minutes for media ${mediaId}`);
  };

  const cancelAutoDeleteTimer = (mediaId: string) => {
    const timeoutId = timerRefs.current.get(mediaId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timerRefs.current.delete(mediaId);
      setActiveTimers(prev => prev.filter(t => t.mediaId !== mediaId));
      toast.info("⏹️ Timer de auto-delete cancelado");
      return true;
    }
    return false;
  };

  const getTimeRemaining = (mediaId: string): number | null => {
    const timer = activeTimers.find(t => t.mediaId === mediaId);
    if (!timer) return null;
    
    const remaining = Math.max(0, timer.expiresAt - Date.now());
    return Math.ceil(remaining / 1000); // Return seconds
  };

  const isTimerActive = (mediaId: string): boolean => {
    return timerRefs.current.has(mediaId);
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  const cleanup = () => {
    timerRefs.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timerRefs.current.clear();
    setActiveTimers([]);
  };

  return {
    startAutoDeleteTimer,
    cancelAutoDeleteTimer,
    getTimeRemaining,
    isTimerActive,
    formatTimeRemaining,
    activeTimers,
    cleanup
  };
};