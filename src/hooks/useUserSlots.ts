import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { toast } from 'sonner';

interface SlotsState {
  image: number;
  video: number;
}

export const useUserSlots = () => {
  const { user, isGuest } = useGoogleAuth();
  const [slots, setSlots] = useState<SlotsState>({
    image: 3, // Updated for new free plan
    video: 1  // Updated for new free plan
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar slots do usuário do banco
  const loadUserSlots = useCallback(async () => {
    if (!user) {
      // Para usuários não logados, usar valores padrão do localStorage
      const guestImageSlots = localStorage.getItem('guest_image_slots');
      const guestVideoSlots = localStorage.getItem('guest_video_slots');
      
      setSlots({
        image: guestImageSlots ? parseInt(guestImageSlots) : 3, // Updated default
        video: guestVideoSlots ? parseInt(guestVideoSlots) : 1  // Updated default
      });
      setIsLoading(false);
      return;
    }

    try {
      // Para usuários logados, carregar do banco
      const { data, error } = await supabase
        .from('subscriptions')
        .select('image_slots, video_slots')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar slots:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setSlots({
          image: data.image_slots || 3, // Updated default
          video: data.video_slots || 1  // Updated default
        });
      } else {
        // Criar registro de subscription se não existir
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            status: 'active',
            credits: 80,
            image_slots: 3, // Updated default
            video_slots: 1  // Updated default
          });

        if (insertError) {
          console.error('Erro ao criar subscription:', insertError);
        } else {
          setSlots({ image: 3, video: 1 }); // Updated default
        }
      }
    } catch (err) {
      console.error('Erro ao carregar slots do usuário:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Efeito para carregar slots quando usuário muda
  useEffect(() => {
    loadUserSlots();
  }, [loadUserSlots]);

  // Limpar dados quando usuário muda (isolamento de dados)
  useEffect(() => {
    const handleUserDataIsolation = () => {
      setSlots({ image: 3, video: 1 }); // Updated default
      setIsLoading(true);
    };

    window.addEventListener('user-data-isolation', handleUserDataIsolation);
    return () => window.removeEventListener('user-data-isolation', handleUserDataIsolation);
  }, []);

  // Comprar slot
  const purchaseSlot = useCallback(async (type: 'image' | 'video', onSubtractCredits: (amount: number, description: string) => Promise<boolean>) => {
    const cost = type === 'image' ? 50 : 80;
    const success = await onSubtractCredits(cost, `Compra de slot VIP para upload de ${type === 'image' ? 'imagem' : 'vídeo'}`);
    
    if (!success) {
      return false;
    }

    const newSlots = {
      ...slots,
      [type]: slots[type] + 1
    };

    try {
      if (user) {
        // Para usuários logados, atualizar no banco
        const { error } = await supabase
          .from('subscriptions')
          .update({
            [`${type}_slots`]: newSlots[type]
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao atualizar slots no banco:', error);
          toast.error('❌ Erro ao salvar slot no servidor');
          return false;
        }

        toast.success(`🎉 Slot VIP de ${type === 'image' ? 'imagem' : 'vídeo'} desbloqueado e salvo!`);
      } else {
        // Para usuários não logados, salvar no localStorage
        localStorage.setItem(`guest_${type}_slots`, newSlots[type].toString());
        toast.success(`🎉 Slot VIP de ${type === 'image' ? 'imagem' : 'vídeo'} desbloqueado localmente!`);
      }

      setSlots(newSlots);
      return true;
    } catch (error) {
      console.error('Erro ao comprar slot:', error);
      toast.error('❌ Erro ao comprar slot');
      return false;
    }
  }, [slots, user]);

  // Verificar se pode fazer upload
  const canUpload = useCallback((type: 'image' | 'video', currentCount: number): boolean => {
    return currentCount < slots[type];
  }, [slots]);

  // Obter slots totais
  const getTotalSlots = useCallback(() => {
    return slots.image + slots.video;
  }, [slots]);

  return {
    slots,
    isLoading,
    purchaseSlot,
    canUpload,
    getTotalSlots,
    loadUserSlots
  };
};