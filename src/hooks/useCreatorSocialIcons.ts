import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { useSocialNetworks } from './useSocialNetworks';
import { useDataIsolation } from './useDataIsolation';

interface SocialIcon {
  id: string;
  icon_url: string;
  link: string;
  order_index: number;
}

export const useCreatorSocialIcons = (creatorId?: string) => {
  const [socialIcons, setSocialIcons] = useState<SocialIcon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isGuest } = useGoogleAuth();
  const { socialNetworks, updateSocialNetwork, addSocialNetwork, deleteSocialNetwork } = useSocialNetworks();
  const { currentUserId } = useDataIsolation();
  
  // Determinar qual usuário usar (parâmetro creatorId ou usuário logado)
  const targetUserId = creatorId || user?.id;
  const isViewingOtherCreator = creatorId && user?.id !== creatorId;

  // Limpar dados sociais quando o usuário muda
  useEffect(() => {
    setSocialIcons([]);
    setIsLoading(false);
    console.log('🔄 Creator social icons cleared for user:', targetUserId);
  }, [targetUserId]);

  // Listener para evento de isolamento de dados
  useEffect(() => {
    const handleDataIsolation = () => {
      setSocialIcons([]);
      setIsLoading(false);
      console.log('🔄 Creator social icons isolated due to user change');
    };

    window.addEventListener('user-data-isolation', handleDataIsolation);
    return () => window.removeEventListener('user-data-isolation', handleDataIsolation);
  }, []);

  // Carregar ícones sociais
  useEffect(() => {
    const loadSocialIcons = async () => {
      if (!targetUserId) {
        console.log('🚫 No targetUserId for social icons');
        return;
      }

      if (isGuest && !creatorId) {
        // Modo guest sem creatorId específico: usar hook local
        return;
      }

      // Buscar do Supabase (tanto para usuário logado quanto para visualizar criador)
      setIsLoading(true);
      try {
        console.log('📱 Loading social icons for user:', targetUserId);
        const { data, error } = await supabase
          .from('social_icons')
          .select('*')
          .eq('user_id', targetUserId)
          .order('order_index');

        if (error) {
          console.error('Erro ao carregar ícones sociais:', error);
          return;
        }

        setSocialIcons(data || []);
        console.log('✅ Social icons loaded:', data?.length || 0);
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialIcons();
  }, [targetUserId, isGuest, creatorId]);

  const updateSocialIcon = async (id: string, iconUrl: string, link: string) => {
    if (isViewingOtherCreator) {
      // Não permitir edição se estiver visualizando página de outro criador
      console.log('🚫 Cannot edit other creator social icons');
      return;
    }

    // Verificar se é usuário autenticado e se é o próprio criador
    if (!user || user.id !== targetUserId) {
      console.log('🚫 Cannot edit social icons - not the creator');
      return;
    }

    if (isGuest || !user) {
      // Modo guest: usar hook local
      updateSocialNetwork(id, { customIcon: iconUrl, url: link });
      return;
    }

    // Usuário logado: atualizar no Supabase
    try {
      const { error } = await supabase
        .from('social_icons')
        .update({ icon_url: iconUrl, link })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar ícone social:', error);
        return;
      }

      setSocialIcons(prev => prev.map(icon => 
        icon.id === id ? { ...icon, icon_url: iconUrl, link } : icon
      ));
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const addSocialIcon = async (iconUrl: string, link: string) => {
    if (isViewingOtherCreator) {
      // Não permitir edição se estiver visualizando página de outro criador
      console.log('🚫 Cannot add social icons to other creator');
      return;
    }

    if (isGuest || !user) {
      // Modo guest: usar hook local
      addSocialNetwork({ customIcon: iconUrl, url: link });
      return;
    }

    // Usuário logado: adicionar no Supabase
    try {
      const { data, error } = await supabase
        .from('social_icons')
        .insert({
          user_id: user.id,
          icon_url: iconUrl,
          link,
          order_index: socialIcons.length
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar ícone social:', error);
        return;
      }

      setSocialIcons(prev => [...prev, data]);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const deleteSocialIcon = async (id: string) => {
    if (isViewingOtherCreator) {
      // Não permitir edição se estiver visualizando página de outro criador
      console.log('🚫 Cannot delete other creator social icons');
      return;
    }

    if (isGuest || !user) {
      // Modo guest: usar hook local
      deleteSocialNetwork(id);
      return;
    }

    // Usuário logado: deletar do Supabase
    try {
      const { error } = await supabase
        .from('social_icons')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar ícone social:', error);
        return;
      }

      setSocialIcons(prev => prev.filter(icon => icon.id !== id));
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  // Retornar dados conforme o modo
  // Se há creatorId (visualizando página de criador), sempre usar dados do Supabase
  // Se é guest sem creatorId, usar dados locais
  const effectiveSocialData = creatorId ? socialIcons.map(icon => ({
    id: icon.id,
    name: 'Custom',
    defaultIcon: icon.icon_url,
    customIcon: icon.icon_url,
    url: icon.link
  })) : (isGuest ? socialNetworks : socialIcons.map(icon => ({
    id: icon.id,
    name: 'Custom',
    defaultIcon: icon.icon_url,
    customIcon: icon.icon_url,
    url: icon.link
  })));

  const effectiveUpdateFunction = creatorId ? (id: string, updates: any) => {
    if (updates.customIcon || updates.url) {
      updateSocialIcon(id, updates.customIcon || '', updates.url || '');
    }
  } : (isGuest ? updateSocialNetwork : (id: string, updates: any) => {
    if (updates.customIcon || updates.url) {
      updateSocialIcon(id, updates.customIcon || '', updates.url || '');
    }
  });

  const effectiveAddFunction = creatorId ? (network: any) => {
    if (network.customIcon || network.url) {
      addSocialIcon(network.customIcon || '', network.url || '');
    }
  } : (isGuest ? addSocialNetwork : (network: any) => {
    if (network.customIcon || network.url) {
      addSocialIcon(network.customIcon || '', network.url || '');
    }
  });

  const effectiveDeleteFunction = creatorId ? (id: string) => {
    deleteSocialIcon(id);
  } : (isGuest ? deleteSocialNetwork : (id: string) => {
    deleteSocialIcon(id);
  });

  return {
    socialNetworks: effectiveSocialData,
    updateSocialNetwork: effectiveUpdateFunction,
    addSocialNetwork: effectiveAddFunction,
    deleteSocialNetwork: effectiveDeleteFunction,
    isLoading
  };
};