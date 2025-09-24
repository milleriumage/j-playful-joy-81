import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGuestData } from './useGuestData';

// Helper function to record like interaction  
const recordLikeInteraction = async (mediaId: string, userId?: string) => {
  try {
    let userIp = null;
    let userAgent = null;
    
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      userIp = ipData.ip;
      userAgent = navigator.userAgent;
    } catch (error) {
      console.log('Could not get user tracking data:', error);
    }

    const { error } = await supabase
      .from('media_interactions')
      .insert({
        media_id: mediaId,
        user_id: userId || null,
        interaction_type: 'like',
        user_ip: userIp,
        user_agent: userAgent
      });

    if (!error) {
      console.log('✅ Like interaction recorded');
    }
  } catch (error) {
    console.error('Error recording like interaction:', error);
  }
};

export const useMediaLikes = (mediaId?: string) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { guestData } = useGuestData();

  // Carregar status de curtida e contagem
  useEffect(() => {
    if (!mediaId) return;

    const loadLikesData = async () => {
      try {
        // Contar curtidas
        const { data: countData } = await supabase
          .rpc('get_media_likes_count', { media_uuid: mediaId });
        
        setLikesCount(countData || 0);

        // Verificar se usuário atual curtiu
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        const guestSession = guestData.sessionId;
        
        if (userId || guestSession) {
          const { data: likedData } = await supabase
            .rpc('check_user_liked_media', { 
              media_uuid: mediaId,
              user_uuid: userId || null,
              guest_session: guestSession || null
            });

          setIsLiked(!!likedData);
        }
      } catch (error) {
        console.error('Error loading likes data:', error);
      }
    };

    loadLikesData();

    // Set up real-time subscription for likes changes
    const channel = supabase
      .channel('media-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_likes',
          filter: `media_id=eq.${mediaId}`
        },
        () => {
          // Reload likes data when likes change
          loadLikesData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mediaId, guestData.sessionId]);

  // Curtir/Descurtir mídia
  const toggleLike = async () => {
    if (!mediaId) return;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const guestSession = guestData.sessionId;
    
    if (!userId && !guestSession) {
      toast.error('Erro ao identificar usuário');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Descurtir
        const { error } = await supabase
          .from('media_likes')
          .delete()
          .eq('media_id', mediaId)
          .eq(userId ? 'user_id' : 'guest_session_id', userId || guestSession);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast.success('Curtida removida');
      } else {
        // Curtir
        const { error } = await supabase
          .from('media_likes')
          .insert({
            media_id: mediaId,
            user_id: userId || null,
            guest_session_id: guestSession || null,
            user_ip: null // Pode ser adicionado se necessário
          });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        
        // Registrar como interação no sistema de estatísticas
        await recordLikeInteraction(mediaId, userId);
        
        toast.success('Mídia curtida!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Erro ao processar curtida');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likesCount,
    isLiked,
    isLoading,
    toggleLike
  };
};