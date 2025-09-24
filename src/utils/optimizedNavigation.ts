/**
 * Utilitários para navegação otimizada sem recarregamentos desnecessários
 */

import { toast } from 'sonner';

export const optimizedNavigate = {
  // Substituir window.location.reload() por refresh otimizado
  refresh: (message?: string) => {
    if (message) {
      toast.success(message);
    }
    
    // Disparar evento customizado para components reagirem
    window.dispatchEvent(new CustomEvent('optimized-refresh', {
      detail: { timestamp: Date.now(), message }
    }));
  },

  // Substituir window.location.href por navigation suave
  navigateTo: (path: string, message?: string, delay = 1000) => {
    if (message) {
      toast.success(message);
    }
    
    setTimeout(() => {
      // Usar history API ao invés de location.href quando possível
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', path);
        window.location.href = path; // Fallback necessário para algumas rotas
      } else {
        window.location.href = path;
      }
    }, delay);
  },

  // Limpar dados de forma otimizada
  clearAppData: (preserveGuest = true) => {
    const keysToRemove = [];
    const preserveKeys = preserveGuest ? ['dreamlink_guest_data'] : [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !preserveKeys.includes(key)) {
        if (key.startsWith('user_') || key.startsWith('dreamlink_') || key.startsWith('ryan_')) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Disparar evento de limpeza
    window.dispatchEvent(new CustomEvent('app-data-cleared', {
      detail: { clearedKeys: keysToRemove.length }
    }));
    
    return keysToRemove.length;
  }
};

// Hook para escutar eventos de refresh otimizado
export const useOptimizedRefreshListener = (callback: () => void) => {
  const handleRefresh = () => {
    callback();
  };

  // Setup listener
  if (typeof window !== 'undefined') {
    window.addEventListener('optimized-refresh', handleRefresh);
    window.addEventListener('user-data-reset', handleRefresh);
    window.addEventListener('app-data-cleared', handleRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('optimized-refresh', handleRefresh);
      window.removeEventListener('user-data-reset', handleRefresh);
      window.removeEventListener('app-data-cleared', handleRefresh);
    };
  }
  
  return () => {};
};