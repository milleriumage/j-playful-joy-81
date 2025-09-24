import { useEffect, useRef } from 'react';
import { useGoogleAuth } from './useGoogleAuth';

/**
 * Hook responsável por garantir isolamento total de dados entre usuários
 * Limpa dados locais e força re-renderização quando o usuário muda
 */
export const useDataIsolation = () => {
  const { user, isGuest } = useGoogleAuth();
  const previousUserIdRef = useRef<string | null>(null);
  const previousIsGuestRef = useRef<boolean | null>(null);

  useEffect(() => {
    const currentUserId = user?.id || null;
    const currentIsGuest = isGuest;
    
    // Detectar mudança de usuário ou mudança entre guest/logado
    const userChanged = previousUserIdRef.current !== currentUserId;
    const guestModeChanged = previousIsGuestRef.current !== currentIsGuest;
    
    if (userChanged || guestModeChanged) {
      console.log('🔄 Detectada mudança de usuário - isolando dados:', {
        previousUserId: previousUserIdRef.current,
        currentUserId,
        previousIsGuest: previousIsGuestRef.current,
        currentIsGuest,
        userChanged,
        guestModeChanged
      });
      
      // Limpar dados locais específicos do usuário anterior
      clearUserSpecificData();
      
      // Forçar limpeza de cache de components
      setTimeout(() => {
        // Disparar evento customizado para componentes que precisam limpar dados
        window.dispatchEvent(new CustomEvent('user-data-isolation', {
          detail: { 
            previousUserId: previousUserIdRef.current,
            currentUserId,
            isGuest: currentIsGuest
          }
        }));
      }, 100);
    }
    
    // Atualizar referências
    previousUserIdRef.current = currentUserId;
    previousIsGuestRef.current = currentIsGuest;
  }, [user?.id, isGuest]);

  const clearUserSpecificData = () => {
    // Limpar localStorage de dados de usuário específicos
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('user_') || 
        key.startsWith('social_') ||
        key.startsWith('media_') ||
        key.startsWith('profile_') ||
        key.startsWith('credits_') ||
        key.startsWith('guest_') ||
        key.startsWith('wishlist_guest_') || // Limpar wishlists guest antigas
        key.includes('cache') ||
        key === 'visitorAvatar' // Limpar avatar antigo do visitante
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Limpar sessionStorage também
    sessionStorage.clear();
    
    console.log('🧹 Dados locais limpos (incluindo sessões guest antigas):', keysToRemove.length, 'itens removidos');
  };

  return {
    currentUserId: user?.id || null,
    isGuest
  };
};