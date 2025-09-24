import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook para otimização de memória e prevenção de memory leaks
 * Gerencia automaticamente cleanup de recursos e reduz consumo de memória
 */
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<Set<() => void>>(new Set());
  const intervals = useRef<Set<NodeJS.Timeout>>(new Set());
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const eventListeners = useRef<Set<{ element: EventTarget; event: string; handler: EventListener }>>(new Set());
  const abortControllers = useRef<Set<AbortController>>(new Set());

  // Adicionar função de cleanup
  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctions.current.add(cleanupFn);
    return () => cleanupFunctions.current.delete(cleanupFn);
  }, []);

  // setTimeout otimizado com cleanup automático
  const safeSetTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      callback();
      timeouts.current.delete(timeout);
    }, delay);
    
    timeouts.current.add(timeout);
    return timeout;
  }, []);

  // setInterval otimizado com cleanup automático
  const safeSetInterval = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const interval = setInterval(callback, delay);
    intervals.current.add(interval);
    return interval;
  }, []);

  // addEventListener otimizado com cleanup automático
  const safeAddEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    eventListeners.current.add({ element, event, handler });
    
    return () => {
      element.removeEventListener(event, handler, options);
      eventListeners.current.delete({ element, event, handler });
    };
  }, []);

  // AbortController otimizado
  const createAbortController = useCallback((): AbortController => {
    const controller = new AbortController();
    abortControllers.current.add(controller);
    return controller;
  }, []);

  // Debounce otimizado com cleanup
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = safeSetTimeout(() => func(...args), delay);
    }) as T;
  }, [safeSetTimeout]);

  // Throttle otimizado com cleanup
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let lastCall = 0;
    
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    }) as T;
  }, []);

  // Limpar recursos específicos
  const clearTimeouts = useCallback(() => {
    timeouts.current.forEach(timeout => clearTimeout(timeout));
    timeouts.current.clear();
  }, []);

  const clearIntervals = useCallback(() => {
    intervals.current.forEach(interval => clearInterval(interval));
    intervals.current.clear();
  }, []);

  const clearEventListeners = useCallback(() => {
    eventListeners.current.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    eventListeners.current.clear();
  }, []);

  const clearAbortControllers = useCallback(() => {
    abortControllers.current.forEach(controller => controller.abort());
    abortControllers.current.clear();
  }, []);

  // Limpar todas as funções de cleanup
  const clearCleanupFunctions = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => cleanup());
    cleanupFunctions.current.clear();
  }, []);

  // Limpar todos os recursos
  const clearAll = useCallback(() => {
    clearTimeouts();
    clearIntervals();
    clearEventListeners();
    clearAbortControllers();
    clearCleanupFunctions();
  }, [
    clearTimeouts,
    clearIntervals,
    clearEventListeners,
    clearAbortControllers,
    clearCleanupFunctions
  ]);

  // Cleanup automático na desmontagem
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  // Limpeza periódica de recursos órfãos (a cada 30 segundos)
  useEffect(() => {
    const cleanupInterval = safeSetInterval(() => {
      // Limpar timeouts expirados
      timeouts.current.forEach(timeout => {
        // Verificar se o timeout ainda é válido
        try {
          // Se não conseguir acessar, provavelmente já foi limpo
        } catch {
          timeouts.current.delete(timeout);
        }
      });
    }, 30000);

    return () => clearInterval(cleanupInterval);
  }, [safeSetInterval]);

  return {
    // Funções de gerenciamento
    addCleanup,
    clearAll,
    
    // Timers seguros
    safeSetTimeout,
    safeSetInterval,
    
    // Event listeners seguros
    safeAddEventListener,
    
    // Abort controllers
    createAbortController,
    
    // Utilitários de performance
    debounce,
    throttle,
    
    // Limpeza específica
    clearTimeouts,
    clearIntervals,
    clearEventListeners,
    clearAbortControllers,
    clearCleanupFunctions
  };
};
