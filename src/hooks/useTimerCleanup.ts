import { useEffect, useRef, useCallback } from 'react';

interface TimerManager {
  addTimeout: (callback: () => void, delay: number) => number;
  addInterval: (callback: () => void, delay: number) => number;
  clearTimer: (id: number) => void;
  clearAllTimers: () => void;
}

/**
 * Hook para gerenciamento automático de timers com cleanup
 * Previne memory leaks garantindo limpeza automática
 */
export const useTimerCleanup = (): TimerManager => {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const addTimeout = useCallback((callback: () => void, delay: number): number => {
    const id = setTimeout(() => {
      callback();
      timeoutsRef.current.delete(id);
    }, delay);
    
    timeoutsRef.current.add(id);
    return id as unknown as number;
  }, []);

  const addInterval = useCallback((callback: () => void, delay: number): number => {
    const id = setInterval(callback, delay);
    intervalsRef.current.add(id);
    return id as unknown as number;
  }, []);

  const clearTimer = useCallback((id: number): void => {
    const timerId = id as unknown as NodeJS.Timeout;
    
    if (timeoutsRef.current.has(timerId)) {
      clearTimeout(timerId);
      timeoutsRef.current.delete(timerId);
    }
    
    if (intervalsRef.current.has(timerId)) {
      clearInterval(timerId);
      intervalsRef.current.delete(timerId);
    }
  }, []);

  const clearAllTimers = useCallback((): void => {
    // Limpar todos os timeouts
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current.clear();
    
    // Limpar todos os intervals
    intervalsRef.current.forEach(id => clearInterval(id));
    intervalsRef.current.clear();
  }, []);

  // Cleanup automático quando o componente desmonta
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    addTimeout,
    addInterval,
    clearTimer,
    clearAllTimers
  };
};