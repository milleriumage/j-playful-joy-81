
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useGoogleAuth } from './useGoogleAuth';
import { ensureMediaBucket } from '@/lib/mediaUtils';
import { useTemplateData } from './useTemplateData';
import { useDataIsolation } from './useDataIsolation';

type MediaItem = Database['public']['Tables']['media_items']['Row'] & {
  type: 'image' | 'video';
  linkButtonConfig?: {
    showButton: boolean;
    buttonText?: string;
  };
  priceConfig?: {
    text: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    isTransparent: boolean;
    hasBlinkAnimation: boolean;
    movementType: 'none' | 'horizontal' | 'vertical';
  };
  hover_unblur?: boolean;
};

export const useRealtimeMedia = () => {
  const { user } = useGoogleAuth();
  const { getTemplateMediaItems } = useTemplateData();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUserId } = useDataIsolation();

  // Ao mudar usuário, não limpar imediatamente as mídias; manter até novo carregamento para evitar tela vazia
  useEffect(() => {
    setError(null);
    console.log('🔄 User changed, keeping previous media while reloading for:', currentUserId);
  }, [currentUserId]);

  // Listener para evento de isolamento de dados
  useEffect(() => {
    const handleDataIsolation = () => {
      // Evitar limpar imediatamente para não exibir fallback em branco
      setError(null);
      console.log('🔄 Data isolation event: keeping current media until fetch completes');
    };

    window.addEventListener('user-data-isolation', handleDataIsolation);
    return () => window.removeEventListener('user-data-isolation', handleDataIsolation);
  }, []);

  const fetchMediaItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎬 DEBUG: fetchMediaItems called with user:', {
        hasUser: !!user,
        userId: user?.id,
        currentUserId: currentUserId
      });
      
      // Se usuário não está logado, usar dados template
      if (!user) {
        console.log('👤 DEBUG: No user logged in, using template media items');
        const templateItems = getTemplateMediaItems();
        // OTIMIZAÇÃO: Remover mapeamento desnecessário em produção
        console.log('📋 DEBUG: Template items loaded:', {
          count: templateItems.length,
          items: templateItems.length > 0 ? 'Items loaded successfully' : 'No items'
        });
        setMediaItems(templateItems as MediaItem[]);
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 DEBUG: Fetching media items from Supabase for user:', user.id);
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ DEBUG: Error fetching media items:', error);
        console.log('🔍 DEBUG: Media fetch error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Verificar se é erro de RLS
        if (error.code === '42501' || error.message?.includes('policy')) {
          console.log('🚫 DEBUG: RLS policy blocking media access');
          setError('RLS policy blocking access');
        } else {
          setError('Failed to load media items');
        }
        toast.error('❌ Erro ao carregar mídia');
      } else if (data) {
        console.log('✅ DEBUG: Media items fetched successfully:', {
          count: data.length,
          items: data.map(item => ({
            id: item.id,
            type: item.type,
            is_main: item.is_main,
            storage_path: item.storage_path?.substring(0, 50) + '...'
          }))
        });
        setMediaItems(data as MediaItem[]);

        // Quick storage existence validation for the main media (tests cause #1)
        try {
          const main = (data as MediaItem[]).find(i => i.is_main) || (data as MediaItem[])[0];
          if (main?.storage_path) {
            const { error: signErr } = await supabase.storage
              .from('media')
              .createSignedUrl(main.storage_path, 60);

            if (signErr) {
              console.warn('🟠 Storage validation failed for main media. Likely broken URL/path.', {
                media_id: main.id,
                storage_path: main.storage_path,
                error: signErr.message
              });
              toast.error('Arquivo da mídia principal não existe no Storage (URL quebrada)');
            } else {
              console.log('🟢 Storage validation OK for main media:', {
                media_id: main.id,
                storage_path: main.storage_path
              });
            }
          }
        } catch (vErr) {
          console.log('Storage validation skipped due to unexpected error:', vErr);
        }
      }
    } catch (err) {
      console.error('💥 DEBUG: Unexpected error in fetchMediaItems:', err);
      setError('Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaItems();

    // Se não há usuário logado, não configurar real-time
    if (!user) {
      return;
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('media_items', {
        config: {
          broadcast: { self: false },
          presence: { key: user.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_items',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time media update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setMediaItems(prev => {
              if (prev.length > 0) {
                return [prev[0], payload.new as MediaItem, ...prev.slice(1)];
              }
              return [payload.new as MediaItem];
            });
          } else if (payload.eventType === 'UPDATE') {
            setMediaItems(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as MediaItem : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setMediaItems(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Media subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          // Fallback to periodic refresh without logging errors
          setTimeout(fetchMediaItems, 5000);
        }
      });

    // Fallback: refresh data every 30 seconds if there are connection issues
    const intervalId = setInterval(() => {
      if (error === 'Real-time connection failed') {
        console.log('Refreshing media data due to connection issues');
        fetchMediaItems();
      }
    }, 30000);

    return () => {
      console.log('Cleaning up media subscription');
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]);

  const uploadMedia = async (file: File, type: 'image' | 'video') => {
    // Verificar se o usuário está logado
    if (!user) {
      toast.error('❌ Faça login para fazer upload de mídia');
      return false;
    }

    try {
      // Check storage bucket (simplified)
      console.log('Checking media bucket...');
      await ensureMediaBucket();
      // Validate file
      if (!file) {
        toast.error('❌ Nenhum arquivo selecionado');
        return false;
      }

      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('❌ Arquivo muito grande (máximo 50MB)');
        return false;
      }

      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      
      if (type === 'image' && !validImageTypes.includes(file.type)) {
        toast.error('❌ Tipo de imagem não suportado');
        return false;
      }
      
      if (type === 'video' && !validVideoTypes.includes(file.type)) {
        toast.error('❌ Tipo de vídeo não suportado');
        return false;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        toast.error('❌ Erro ao fazer upload do arquivo');
        return false;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      
      const { error } = await supabase
        .from('media_items')
        .insert({
          type,
          storage_path: filePath,
          user_id: user.id,
          is_locked: false,
          is_blurred: false,
          is_main: false
        });

      if (error) {
        console.error('Error uploading media:', error);
        toast.error('❌ Erro ao fazer upload da mídia');
        return false;
      }
      
      // Force refresh if real-time is having issues
      setTimeout(() => {
        fetchMediaItems();
      }, 1000);
      
      toast.success(`✅ ${type === 'image' ? 'Imagem' : 'Vídeo'} carregada com sucesso!`);
      return true;
    } catch (err) {
      console.error('Unexpected error uploading media:', err);
      toast.error('❌ Erro inesperado no upload');
      return false;
    }
  };

  const updateMedia = async (id: string, updates: Partial<MediaItem>) => {

    try {
      // Handle special serializations
      const serializedUpdates = {
        ...updates,
        linkButtonConfig: updates.linkButtonConfig ? JSON.stringify(updates.linkButtonConfig) : undefined
      };

      // If priceConfig is provided, serialize it and store in the price column
      if ((updates as any).priceConfig) {
        serializedUpdates.price = JSON.stringify((updates as any).priceConfig);
        delete (serializedUpdates as any).priceConfig;
      }

      const { error } = await supabase
        .from('media_items')
        .update(serializedUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating media:', error);
        toast.error('❌ Erro ao atualizar mídia');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error updating media:', err);
      toast.error('❌ Erro inesperado ao atualizar mídia');
      return false;
    }
  };

  const deleteMedia = async (id: string) => {

    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting media:', error);
        toast.error('❌ Erro ao deletar mídia');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error deleting media:', err);
      toast.error('❌ Erro inesperado ao deletar mídia');
      return false;
    }
  };

  const setAsMain = async (id: string) => {

    try {
      // First, unset all other main items
      const { error: unsetError } = await supabase
        .from('media_items')
        .update({ is_main: false })
        .neq('id', id);

      if (unsetError) {
        console.error('Error unsetting main items:', unsetError);
        toast.error('❌ Erro ao redefinir mídia principal');
        return false;
      }

      // Then set the selected item as main
      const success = await updateMedia(id, { is_main: true });
      
      if (success) {
        toast.success('👑 Mídia definida como principal');
      }
      
      return success;
    } catch (err) {
      console.error('Unexpected error setting main media:', err);
      toast.error('❌ Erro inesperado ao definir mídia principal');
      return false;
    }
  };

  return { 
    mediaItems, 
    uploadMedia, 
    updateMedia, 
    deleteMedia, 
    setAsMain,
    isLoading,
    error
  };
};
