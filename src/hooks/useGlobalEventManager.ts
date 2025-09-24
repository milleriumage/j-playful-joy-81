import { useEffect } from 'react';

export const useGlobalEventManager = () => {
  useEffect(() => {
    // Substituir eventos de recarregamento por atualizações de estado locais
    const handleMediaPurchaseSuccess = (event: CustomEvent) => {
      console.log('✅ Mídia desbloqueada:', event.detail.mediaId);
      // Disparar um evento de atualização específico ao invés de reload
      window.dispatchEvent(new CustomEvent('media-status-changed', {
        detail: { mediaId: event.detail.mediaId, unlocked: true }
      }));
    };

    const handleAuthSuccess = () => {
      console.log('✅ Login realizado com sucesso');
      // Reload suave apenas da seção necessária
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    };

    const handleNavigateHome = () => {
      console.log('🏠 Navegando para home');
      // Usar history API ao invés de location.href
      if (window.history.pushState) {
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new CustomEvent('route-changed'));
      } else {
        window.location.href = '/';
      }
    };

    // Registrar listeners
    window.addEventListener('media-purchase-success', handleMediaPurchaseSuccess);
    window.addEventListener('auth-success', handleAuthSuccess);
    window.addEventListener('navigate-home', handleNavigateHome);

    // Cleanup
    return () => {
      window.removeEventListener('media-purchase-success', handleMediaPurchaseSuccess);
      window.removeEventListener('auth-success', handleAuthSuccess);
      window.removeEventListener('navigate-home', handleNavigateHome);
    };
  }, []);
};