import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';

interface UserUnlock {
  id: string;
  media_id: string;
  unlock_type: string;
  unlocked_at: string;
  expires_at: string;
  credits_spent: number;
  media_items?: {
    id: string;
    name: string;
    type: string;
    storage_path: string;
    description: string;
    user_id: string;
  } | null;
}

export const useUserUnlocks = () => {
  const [unlockedMedia, setUnlockedMedia] = useState<UserUnlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useOptimizedAuth();

  const fetchUserUnlocks = async () => {
    if (!user) {
      setUnlockedMedia([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Buscar desbloqueios ativos do usuário
      const { data: unlocksData, error: unlocksError } = await supabase
        .from('user_unlocks')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString()) // Apenas não expirados
        .order('unlocked_at', { ascending: false });

      if (unlocksError) {
        console.error('Erro ao buscar desbloqueios:', unlocksError);
        return;
      }

      if (!unlocksData || unlocksData.length === 0) {
        setUnlockedMedia([]);
        return;
      }

      // Buscar dados das mídias separadamente
      const mediaIds = unlocksData.map(unlock => unlock.media_id);
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_items')
        .select('id, name, type, storage_path, description, user_id')
        .in('id', mediaIds);

      if (mediaError) {
        console.error('Erro ao buscar dados das mídias:', mediaError);
        setUnlockedMedia(unlocksData.map(unlock => ({ ...unlock, media_items: null })));
        return;
      }

      // Combinar dados
      const combinedData = unlocksData.map(unlock => {
        const mediaItem = mediaData?.find(media => media.id === unlock.media_id);
        return {
          ...unlock,
          media_items: mediaItem || null
        };
      });

      setUnlockedMedia(combinedData);
    } catch (error) {
      console.error('Erro ao carregar mídias desbloqueadas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserUnlocks();
  }, [user]);

  // Refresh quando houver novas compras
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-unlocks-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_unlocks',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Nova mídia desbloqueada detectada, atualizando lista...');
          fetchUserUnlocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    unlockedMedia,
    isLoading,
    refetch: fetchUserUnlocks
  };
};