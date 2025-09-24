import { useState, useEffect } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { useRealtimeMedia } from './useRealtimeMedia';
import { useUserCredits } from './useUserCredits';

interface LoadingState {
  isInitialLoading: boolean;
  isDataLoading: boolean;
  loadingMessage: string;
  showVitrine: boolean;
}

export const useDataLoadingState = () => {
  const { user, isLoading: authLoading, session } = useGoogleAuth();
  const { isLoading: creditsLoading } = useUserCredits();
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isInitialLoading: true,
    isDataLoading: false,
    loadingMessage: 'Carregando seus dados...',
    showVitrine: false
  });

  // Controlar loading inicial após login - OTIMIZADO
  useEffect(() => {
    if (authLoading) {
      setLoadingState(prev => ({
        ...prev,
        isInitialLoading: true,
        loadingMessage: 'Autenticando usuário...',
        showVitrine: false
      }));
      return;
    }

    // Usuário logado ou guest - sem timeouts desnecessários
    setLoadingState(prev => ({
      ...prev,
      isInitialLoading: false,
      isDataLoading: creditsLoading && !!user,
      loadingMessage: user ? 'Carregando suas mídias...' : 'Pronto',
      showVitrine: !!user
    }));
  }, [user, session, authLoading, creditsLoading]);

  return {
    isLoading: loadingState.isInitialLoading || loadingState.isDataLoading,
    loadingMessage: loadingState.loadingMessage,
    showVitrine: loadingState.showVitrine
  };
};