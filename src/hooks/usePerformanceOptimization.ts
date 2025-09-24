import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook para otimizar performance e reduzir re-renders desnecessários
 */
export const usePerformanceOptimization = () => {
  const mountedRef = useRef(true);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Cleanup na desmontagem
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
      // Limpar todos os timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
      
      // Limpar todos os intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  // setTimeout otimizado que limpa automaticamente
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        callback();
      }
      timeoutsRef.current.delete(timeout);
    }, delay);
    
    timeoutsRef.current.add(timeout);
    return timeout;
  }, []);

  // setInterval otimizado que limpa automaticamente  
  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(() => {
      if (mountedRef.current) {
        callback();
      } else {
        clearInterval(interval);
        intervalsRef.current.delete(interval);
      }
    }, delay);
    
    intervalsRef.current.add(interval);
    return interval;
  }, []);

  // Debounce para reduzir calls desnecessários
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = safeSetTimeout(() => {
        if (mountedRef.current) {
          func(...args);
        }
      }, delay);
    };
  }, [safeSetTimeout]);

  // Throttle para limitar execuções
  const throttle = useCallback((func: Function, delay: number) => {
    let lastCall = 0;
    
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay && mountedRef.current) {
        lastCall = now;
        func(...args);
      }
    };
  }, []);

  return {
    isMounted: () => mountedRef.current,
    safeSetTimeout,
    safeSetInterval,
    debounce,
    throttle
  };
};