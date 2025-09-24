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
          const { data: likesCount } = await supabase
            .rpc('get_media_likes_count', { media_uuid: item.id });
          
          total += (likesCount || 0);
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
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [mediaItems]);

  return totalLikes;
};