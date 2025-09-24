import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { toast } from 'sonner';

export const useUserReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { user } = useGoogleAuth();

  const resetUserData = async () => {
    if (!user) {
      toast.error('❌ Usuário não autenticado');
      return false;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.rpc('reset_user_data');
      
      if (error) {
        console.error('Erro ao resetar dados:', error);
        toast.error('❌ Erro ao resetar dados: ' + error.message);
        return false;
      }
      
      toast.success('🔄 Dados resetados com sucesso! Atualizando interface...');
      
      // Ao invés de recarregar, disparar evento para re-sincronizar dados
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('user-data-reset'));
        toast.success('✅ Interface atualizada com sucesso!');
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('Erro inesperado ao resetar:', err);
      toast.error('❌ Erro inesperado ao resetar dados');
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetUserData,
    isResetting
  };
};