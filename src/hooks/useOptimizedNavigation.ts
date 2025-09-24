import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useOptimizedNavigation = () => {
  const navigate = useNavigate();

  const navigateToRoute = useCallback((route: string, message?: string) => {
    if (message) {
      toast.success(message);
    }
    
    // Use navigate ao invés de window.location para evitar recarregamentos
    setTimeout(() => {
      navigate(route, { replace: true });
    }, message ? 1000 : 0);
  }, [navigate]);

  const refreshData = useCallback((message?: string) => {
    // Ao invés de window.location.reload(), apenas mostrar mensagem
    if (message) {
      toast.success(message);
    }
    
    // Forçar re-render através de um evento personalizado
    window.dispatchEvent(new CustomEvent('optimized-refresh'));
  }, []);

  return {
    navigateToRoute,
    refreshData,
    navigate
  };
};