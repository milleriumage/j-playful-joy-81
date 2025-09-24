import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MediaItem {
  id: string;
}

export const useTotalLikes = (mediaItems: MediaItem[]) => {
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    const loadTotalLikes = async () => {
      let total = 0;
      
      for (const item of mediaItems) {
        try {
          // Contar likes da tabela media_likes (sistema antigo)
          const { data: likesCount } = await supabase
            .rpc('get_media_likes_count', { media_uuid: item.id });
          
          // Contar likes da tabela media_interactions (sistema novo)
          const { count: interactionLikes } = await supabase
            .from('media_interactions')
            .select('*', { count: 'exact', head: true })
            .eq('media_id', item.id)
            .eq('interaction_type', 'like');
           
          const likesFromOldSystem = likesCount || 0;
          const likesFromNewSystem = interactionLikes || 0;
          
          // Somar ambos os sistemas
          total += likesFromOldSystem + likesFromNewSystem;
          
          console.log(`📊 Total likes for ${item.id}:`, {
            oldSystem: likesFromOldSystem,
            newSystem: likesFromNewSystem,
            total: likesFromOldSystem + likesFromNewSystem
          });
        } catch (error) {
          console.error('Error loading likes for media:', item.id, error);
        }
      }
      
      setTotalLikes(total);
    };

    if (mediaItems.length > 0) {
      loadTotalLikes();

      // Set up real-time subscription for likes changes
      const channel = supabase
        .channel('total-likes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'media_likes'
          },
          () => {
            // Recarregar total quando houver mudanças
            loadTotalLikes();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'media_interactions',
            filter: 'interaction_type=eq.like'
          },
          () => {
            // Recarregar total quando houver mudanças nas interações de like
            loadTotalLikes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [mediaItems]);

  return totalLikes;
};