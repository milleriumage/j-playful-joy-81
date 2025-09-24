import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { toast } from 'sonner';

export const useUserInitialization = () => {
  const { user, session } = useGoogleAuth();

  useEffect(() => {
    const initializeUser = async () => {
      if (!user || !session) return;

      try {
        // Verificar se o usuário já foi inicializado
        const { data: userSettings, error: settingsError } = await supabase
          .from('user_settings')
          .select('initialized')
          .eq('user_id', user.id)
          .maybeSingle();

        // Se já foi inicializado, não fazer nada
        if (userSettings?.initialized) {
          return;
        }

        // Se não foi inicializado ou não existe, chamar a RPC
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('initialize_user_from_template');

        if (rpcError) {
          console.error('Erro ao inicializar usuário:', rpcError);
          toast.error('Erro ao configurar conta: ' + rpcError.message);
          return;
        }

        if (rpcResult && typeof rpcResult === 'object' && 'success' in rpcResult && rpcResult.success) {
          toast.success('🎉 Conta configurada com dados padrão!');
          console.log('Usuário inicializado com sucesso:', rpcResult);
        }

      } catch (error) {
        console.error('Erro inesperado na inicialização:', error);
        // Não mostrar toast de erro para não confundir o usuário
      }
    };

    // Aguardar um pouco para garantir que a sessão está estável
    const timer = setTimeout(initializeUser, 1000);
    
    return () => clearTimeout(timer);
  }, [user, session]);

  return { user, session };
};