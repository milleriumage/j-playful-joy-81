import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useGoogleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          setIsGuest(false);
          // Executar fusão de dados guest
          mergeGuestDataToUser(session?.user);
          toast.success('🎉 Login realizado com sucesso!');
        } else if (event === 'SIGNED_OUT') {
          // Limpar todos os dados locais quando deslogar
          setSession(null);
          setUser(null);
          
      // Limpar TODOS os dados locais relacionados ao usuário - OTIMIZADO
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('user_credits_') || 
          key.startsWith('dreamlink_guest_data') ||
          key.startsWith('ryan_test_credits')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Resetar para dados guest limpos
      localStorage.setItem('dreamlink_guest_data', JSON.stringify({
        notifications: [],
        credits: 80
      }));
      
      // Ativar modo guest automaticamente
      setIsGuest(true);
      console.log('🧹 Dados limpos - modo guest ativo');
        }
      }
    );

  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setIsLoading(false);
    // Se não há sessão, ativar modo guest
    if (!session) {
      setIsGuest(true);
    }
  });

    return () => subscription.unsubscribe();
  }, []);

  // Função para fusão de dados guest com usuário logado
  const mergeGuestDataToUser = async (loggedUser: User | null | undefined) => {
    if (!loggedUser) return;

    try {
      console.log('🔄 Iniciando fusão de dados guest para usuário:', loggedUser.id);
      
      // Buscar dados guest de todas as sessões
      const guestKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('wishlist_guest_')) {
          guestKeys.push(key);
        }
      }

      if (guestKeys.length === 0) {
        console.log('📝 Nenhum dado guest encontrado para fusão');
        return;
      }

      // Coletar todos os itens da wishlist guest
      const allGuestItems = [];
      guestKeys.forEach(key => {
        try {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          allGuestItems.push(...items);
          // Limpar dados guest após coleta
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Erro ao processar dados guest:', error);
        }
      });

      // Buscar dados de créditos guest
      const guestData = localStorage.getItem('dreamlink_guest_data');
      let guestCredits = 0;
      if (guestData) {
        try {
          const parsed = JSON.parse(guestData);
          guestCredits = parsed.credits || 0;
        } catch (error) {
          console.error('Erro ao processar créditos guest:', error);
        }
      }

      if (allGuestItems.length > 0) {
        // Migrar wishlist para o banco de dados
        const itemsToInsert = allGuestItems.map(item => ({
          ...item,
          user_id: loggedUser.id,
          id: crypto.randomUUID() // Novo ID para evitar conflitos
        }));

        const { error: wishlistError } = await supabase
          .from('wishlist_items')
          .insert(itemsToInsert);

        if (wishlistError) {
          console.error('Erro ao migrar wishlist:', wishlistError);
        } else {
          console.log('✅ Wishlist guest migrada com sucesso:', itemsToInsert.length, 'itens');
          toast.success(`📋 ${itemsToInsert.length} itens da wishlist foram migrados para sua conta!`);
        }
      }

      if (guestCredits > 0) {
        // Migrar créditos - adicionar aos créditos existentes do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('user_id', loggedUser.id)
          .single();

        if (!profileError) {
          const currentCredits = profile?.credits || 0;
          const totalCredits = currentCredits + guestCredits;

          const { error: creditsError } = await supabase
            .from('profiles')
            .update({ credits: totalCredits })
            .eq('user_id', loggedUser.id);

          if (!creditsError) {
            console.log('✅ Créditos guest migrados:', guestCredits, '→ Total:', totalCredits);
            toast.success(`💰 ${guestCredits} créditos foram adicionados à sua conta!`);
          }
        }
      }

      // Limpar dados guest após fusão bem-sucedida
      localStorage.removeItem('dreamlink_guest_data');
      console.log('🧹 Dados guest limpos após fusão');

    } catch (error) {
      console.error('Erro na fusão de dados guest:', error);
      toast.error('⚠️ Erro ao migrar dados temporários');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Google Auth Error:', error);
        toast.error('❌ Erro no login: ' + error.message);
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast.error('❌ Erro inesperado no login');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('❌ Erro ao fazer logout: ' + error.message);
      } else {
        toast.success('👋 Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('Logout Error:', error);
      toast.error('❌ Erro inesperado no logout');
    }
  };

  return {
    user,
    session,
    isLoading,
    isGuest,
    signInWithGoogle,
    signOut
  };
};