import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGoogleAuth } from './useGoogleAuth';

interface MediaStats {
  likes_count: number;
  shares_count: number;
  views_count: number;
  clicks_count: number;
}

export const useMediaInteractions = () => {
  const [stats, setStats] = useState<{[mediaId: string]: MediaStats}>({});
  const { user } = useGoogleAuth();

  // Limpar stats quando o usuário muda
  useEffect(() => {
    setStats({});
  }, [user?.id]);

  const recordInteraction = async (
    mediaId: string, 
    interactionType: 'like' | 'share' | 'view' | 'click',
    userId?: string
  ) => {
    // Skip database operations for template data
    if (mediaId.startsWith('template-')) {
      // Show success message for template interactions
      const messages = {
        like: '❤️ Curtida registrada!',
        share: '📤 Compartilhamento registrado!',
        view: '👁️ Visualização registrada!',
        click: '🖱️ Click registrado!'
      };
      
      toast.success(messages[interactionType]);
      return;
    }

    try {
      // Get comprehensive user fingerprinting data
      let userIp = null;
      let userAgent = null;
      
      try {
        // Get IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userIp = ipData.ip;
        
        // Get user agent
        userAgent = navigator.userAgent;
        
        console.log('🔍 User tracking data:', {
          ip: userIp,
          userAgent: userAgent?.substring(0, 50) + '...',
          userId: userId || 'anonymous',
          interactionType,
          mediaId: mediaId.substring(0, 8) + '...'
        });
      } catch (error) {
        console.log('Could not get user tracking data:', error);
      }

      const interactionData = {
        media_id: mediaId,
        user_id: userId || null,
        interaction_type: interactionType,
        user_ip: userIp,
        user_agent: userAgent
      };

      console.log('📝 Recording interaction:', interactionData);

      const { error } = await supabase
        .from('media_interactions')
        .insert(interactionData);

      if (error) {
        // Handle specific constraint violations with user-friendly messages
        if (error.message.includes('limite de 2 likes')) {
          // Silently handle for users who already liked
          console.log('User already liked maximum times');
          return;
        }
        
        if (error.message.includes('já registrou esta interação hoje') || error.message.includes('Interação anônima já registrada hoje')) {
          // Silently handle already registered interactions
          console.log('Interaction already registered today');
          return;
        }

        if (error.message.includes('duplicate key') || error.message.includes('unique_user_media_like')) {
          console.log('Interaction already exists');
          return;
        }

        console.error('Error recording interaction:', error);
        toast.error('❌ Erro ao registrar interação');
        return;
      }

      // Update local stats
      await loadMediaStats(mediaId);

      // Show success message based on interaction type
      const messages = {
        like: '❤️ Curtida registrada!',
        share: '📤 Compartilhamento registrado!',
        view: '👁️ Visualização registrada!',
        click: '🖱️ Click registrado!'
      };
      
      toast.success(messages[interactionType]);
    } catch (error: any) {
      console.error('Error recording interaction:', error);
      
      // Handle specific database constraint errors
      if (error?.message?.includes('limite de 2 likes')) {
        toast.error('❤️ Você já curtiu esta mídia o máximo permitido');
      } else if (error?.message?.includes('já registrou esta interação hoje')) {
        toast.error('⚠️ Você já realizou esta ação hoje nesta mídia');
      } else {
        toast.error('❌ Erro ao registrar interação');
      }
    }
  };

  const loadMediaStats = async (mediaId: string) => {
    // Skip database operations for template data
    if (mediaId.startsWith('template-')) {
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_media_stats', { media_uuid: mediaId });

      if (error) {
        console.error('Error loading media stats:', error);
        return;
      }

      if (data && data.length > 0) {
        const statsData = data[0];
        setStats(prev => ({
          ...prev,
          [mediaId]: {
            likes_count: Number(statsData.likes_count) || 0,
            shares_count: Number(statsData.shares_count) || 0,
            views_count: Number(statsData.views_count) || 0,
            clicks_count: Number(statsData.clicks_count) || 0
          }
        }));
      }
    } catch (error) {
      console.error('Error loading media stats:', error);
    }
  };

  const getMediaStats = (mediaId: string): MediaStats => {
    return stats[mediaId] || {
      likes_count: 0,
      shares_count: 0,
      views_count: 0,
      clicks_count: 0
    };
  };

  return {
    recordInteraction,
    loadMediaStats,
    getMediaStats,
    stats
  };
};