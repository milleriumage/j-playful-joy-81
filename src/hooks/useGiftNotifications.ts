import { useState, useEffect } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { supabase } from '@/integrations/supabase/client';

interface GiftNotification {
  id: string;
  creator_name: string;
  credits_amount: number;
  message: string;
  sent_at: string;
}

export const useGiftNotifications = () => {
  const [pendingGifts, setPendingGifts] = useState<GiftNotification[]>([]);
  const { user } = useGoogleAuth();

  const checkForNewGifts = async () => {
    if (!user) return;

    try {
      // Buscar presentes não agradecidos
      const { data: gifts, error } = await supabase
        .from('referral_gifts')
        .select(`
          id,
          credits_amount,
          message,
          sent_at,
          creator_id
        `)
        .eq('recipient_user_id', user.id)
        .eq('thanked', false)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      // Buscar nomes dos criadores separadamente
      const creatorIds = gifts?.map(g => g.creator_id) || [];
      const { data: creators } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', creatorIds);

      const formattedGifts = gifts?.map(gift => {
        const creator = creators?.find(c => c.user_id === gift.creator_id);
        return {
          id: gift.id,
          creator_name: creator?.display_name || 'Criador Anônimo',
          credits_amount: gift.credits_amount,
          message: gift.message || 'Seja bem-vindo(a)!',
          sent_at: gift.sent_at
        };
      }) || [];

      setPendingGifts(formattedGifts);
    } catch (error) {
      console.error('Erro ao verificar presentes:', error);
    }
  };

  const markGiftAsShown = (giftId: string) => {
    setPendingGifts(prev => prev.filter(gift => gift.id !== giftId));
  };

  useEffect(() => {
    if (user) {
      checkForNewGifts();
      
      // Configurar listener em tempo real para novos presentes
      const channel = supabase
        .channel('referral_gifts_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'referral_gifts',
            filter: `recipient_user_id=eq.${user.id}`
          },
          () => {
            checkForNewGifts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    pendingGifts,
    markGiftAsShown,
    checkForNewGifts
  };
};