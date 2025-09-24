import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MediaLikesCountProps {
  mediaId: string;
}

export const MediaLikesCount: React.FC<MediaLikesCountProps> = ({ mediaId }) => {
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    const loadTotalLikes = async () => {
      try {
        // Contar likes da tabela media_likes (sistema antigo)
        const { data: likesCount } = await supabase
          .rpc('get_media_likes_count', { media_uuid: mediaId });
        
        // Contar likes da tabela media_interactions (sistema novo)
        const { count: interactionLikes } = await supabase
          .from('media_interactions')
          .select('*', { count: 'exact', head: true })
          .eq('media_id', mediaId)
          .eq('interaction_type', 'like');
        
        const likesFromOldSystem = likesCount || 0;
        const likesFromNewSystem = interactionLikes || 0;
        
        setTotalLikes(likesFromOldSystem + likesFromNewSystem);
      } catch (error) {
        console.error('Error loading total likes:', error);
      }
    };

    loadTotalLikes();

    // Subscription para atualizações em tempo real
    const channel = supabase
      .channel(`media-likes-${mediaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_likes',
          filter: `media_id=eq.${mediaId}`
        },
        loadTotalLikes
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_interactions',
          filter: `media_id=eq.${mediaId} AND interaction_type=eq.like`
        },
        loadTotalLikes
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mediaId]);
  
  return <span>{totalLikes}</span>;
};