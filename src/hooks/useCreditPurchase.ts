import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserCredits } from './useUserCredits';
import { useGoogleAuth } from './useGoogleAuth';
import { toast } from 'sonner';
import { useSalesHistory } from './useSalesHistory';

interface CreditPurchaseData {
  mediaId: string;
  creatorId: string;
  creditPrice: number;
  mediaTitle?: string;
}

export const useCreditPurchase = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { subtractCredits } = useUserCredits();
  const { user } = useGoogleAuth();
  const { trackSale } = useSalesHistory();

  const processCreditPurchase = async ({
    mediaId,
    creatorId,
    creditPrice,
    mediaTitle = "conteúdo"
  }: CreditPurchaseData) => {
    setIsProcessing(true);
    
    try {
      // 1. Processar dedução dos créditos do comprador
      const purchaseSuccess = await subtractCredits(creditPrice, `Compra de ${mediaTitle}`);
      
      if (!purchaseSuccess) {
        throw new Error('Falha ao processar pagamento');
      }

      // 2. Calcular comissão do criador (70%)
      const creatorCredits = Math.floor(creditPrice * 0.7);
      
      // 3. Creditar o criador se ele for um usuário autenticado
      if (creatorId && creatorId !== 'template-user') {
        try {
          const { error: creatorError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('user_id', creatorId)
            .single();

          if (!creatorError) {
            // Atualizar créditos do criador
            const { error: updateError } = await supabase.rpc('add_credits', {
              p_user_id: creatorId,
              p_amount: creatorCredits
            });

            if (updateError) {
              console.error('Erro ao creditar criador:', updateError);
            } else {
              console.log(`Criador creditado com ${creatorCredits} créditos`);
            }
          }
        } catch (error) {
          console.error('Erro ao processar créditos do criador:', error);
        }
      }

      // 4. Desbloquear mídia automaticamente
      if (user) {
        try {
          const { error: unlockError } = await supabase
            .from('user_unlocks')
            .insert({
              user_id: user.id,
              media_id: mediaId,
              unlock_type: 'credit_purchase',
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
              credits_spent: creditPrice
            });

          if (unlockError) {
            console.error('Erro ao registrar desbloqueio:', unlockError);
          }
        } catch (error) {
          console.error('Erro ao desbloquear mídia:', error);
        }
      }

      // 5. Track sale in sales history
      if (user && creatorId !== user.id) {
        await trackSale(user.id, mediaId, creditPrice, mediaTitle);
      }

      // 6. Mostrar notificação de sucesso com força de atualização
      toast.success('✅ Conteúdo desbloqueado com sucesso!');
      
      // Forçar atualização imediata do saldo de créditos
      window.dispatchEvent(new CustomEvent('credits-updated', { 
        detail: { newCredits: 'force-refresh' } 
      }));
      
      return {
        success: true,
        unlockedMediaId: mediaId,
        creditsSpent: creditPrice,
        creatorCredits
      };

    } catch (error) {
      console.error('Erro ao processar compra por créditos:', error);
      toast.error('❌ Erro ao processar compra. Tente novamente.');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCreditPurchase,
    isProcessing
  };
};