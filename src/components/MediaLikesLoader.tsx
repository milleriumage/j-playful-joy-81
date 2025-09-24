import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MediaLikesLoaderProps {
  mediaItems: Array<{ id: string }>;
}

export const MediaLikesLoader: React.FC<MediaLikesLoaderProps> = ({ mediaItems }) => {
  useEffect(() => {
    const loadLikesForAllMedia = async () => {
      for (const item of mediaItems) {
        try {
          const { data: likesCount } = await supabase
            .rpc('get_media_likes_count', { media_uuid: item.id });
          
          // Atualizar o contador no DOM
          const element = document.getElementById(`likes-count-${item.id}`);
          if (element) {
            element.textContent = (likesCount || 0).toString();
          }
        } catch (error) {
          console.error('Error loading likes for media:', item.id, error);
        }
      }
    };

    if (mediaItems.length > 0) {
      loadLikesForAllMedia();

      // Set up real-time subscription for likes changes
      const channel = supabase
        .channel('all-media-likes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'media_likes'
          },
          (payload) => {
            // Recarregar contagem para a mídia específica
            if (payload.new && (payload.new as any).media_id) {
              loadLikesForSpecificMedia((payload.new as any).media_id);
            } else if (payload.old && (payload.old as any).media_id) {
              loadLikesForSpecificMedia((payload.old as any).media_id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [mediaItems]);

  const loadLikesForSpecificMedia = async (mediaId: string) => {
    try {
      const { data: likesCount } = await supabase
        .rpc('get_media_likes_count', { media_uuid: mediaId });
      
      const element = document.getElementById(`likes-count-${mediaId}`);
      if (element) {
        element.textContent = (likesCount || 0).toString();
      }
    } catch (error) {
      console.error('Error loading likes for specific media:', mediaId, error);
    }
  };

  return null; // Componente não renderiza nada
};