import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useSecureStorage } from './useSecureStorage';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isGuest: boolean;
}

export const useOptimizedAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isGuest: false
  });

  const { clearUserData, setSecureData } = useSecureStorage();

  const mergeGuestDataToUser = useCallback(async (loggedUser: User) => {
    try {
      console.log('🔄 Iniciando fusão otimizada de dados guest');
      
      // OTIMIZAÇÃO: Usar for loop ao invés de Array.from para melhor performance
      const guestKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('wishlist_guest_')) {
          guestKeys.push(key);
        }
      }

      if (guestKeys.length === 0) return;

      // Processar em lote para melhor performance
      const allGuestItems = guestKeys.flatMap(key => {
        try {
          const items = JSON.parse(localStorage.getItem(key!) || '[]');
          localStorage.removeItem(key!); // Limpar imediatamente
          return items;
        } catch {
          return [];
        }
      });

      if (allGuestItems.length > 0) {
        const itemsToInsert = allGuestItems.map(item => ({
          ...item,
          user_id: loggedUser.id,
          id: crypto.randomUUID()
        }));

        // Inserção em lote otimizada
        const { error } = await supabase
          .from('wishlist_items')
          .insert(itemsToInsert);

        if (!error) {
          toast.success(`📋 ${itemsToInsert.length} itens migrados!`, { duration: 3000 });
        }
      }

      // Migrar créditos se existirem
      const guestData = localStorage.getItem('dreamlink_guest_data');
      if (guestData) {
        try {
          const { credits } = JSON.parse(guestData);
          if (credits > 0) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('credits')
              .eq('user_id', loggedUser.id)
              .single();

            if (profile) {
              await supabase
                .from('profiles')
                .update({ credits: (profile.credits || 0) + credits })
                .eq('user_id', loggedUser.id);

              toast.success(`💰 ${credits} créditos adicionados!`, { duration: 3000 });
            }
          }
        } catch (error) {
          console.error('Erro na migração de créditos:', error);
        }
        localStorage.removeItem('dreamlink_guest_data');
      }

    } catch (error) {
      console.error('Erro na fusão de dados:', error);
    }
  }, []);

  // Gerenciamento otimizado de autenticação
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user ?? null,
          isLoading: false 
        }));
        
        if (event === 'SIGNED_IN' && session?.user) {
          setState(prev => ({ ...prev, isGuest: false }));
          await mergeGuestDataToUser(session.user);
          toast.success('🎉 Login realizado!', { duration: 2000 });
          
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({ ...prev, isGuest: true }));
          clearUserData();
          
          // Configurar modo guest otimizado
          setSecureData('dreamlink_guest_data', {
            notifications: [],
            credits: 80,
            sessionId: crypto.randomUUID(),
            createdAt: Date.now()
          });
          
          toast.success('👤 Modo visitante ativo', { duration: 2000 });
        }
      }
    );

    // Verificação inicial otimizada
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          isGuest: !session
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [mergeGuestDataToUser, clearUserData, setSecureData]);

  const signInWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast.error('❌ Erro no login: ' + error.message);
      }
    } catch (error) {
      toast.error('❌ Erro inesperado no login');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('❌ Erro ao fazer logout');
      } else {
        toast.success('👋 Logout realizado!');
      }
    } catch (error) {
      toast.error('❌ Erro inesperado no logout');
    }
  }, []);

  return {
    ...state,
    signInWithGoogle,
    signOut
  };
};