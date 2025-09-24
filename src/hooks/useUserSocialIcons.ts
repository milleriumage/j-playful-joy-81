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

export const useUserSocialIcons = () => {
  const [socialIcons, setSocialIcons] = useState<SocialIcon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isGuest } = useGoogleAuth();
  const { socialNetworks, updateSocialNetwork, addSocialNetwork, deleteSocialNetwork } = useSocialNetworks();
  const { currentUserId } = useDataIsolation();

  // Limpar dados sociais quando o usuário muda - usando isolamento de dados
  useEffect(() => {
    setSocialIcons([]);
    setIsLoading(false);
    console.log('🔄 Social icons cleared for user:', currentUserId);
  }, [currentUserId]);

  // Listener para evento de isolamento de dados
  useEffect(() => {
    const handleDataIsolation = () => {
      setSocialIcons([]);
      setIsLoading(false);
      console.log('🔄 Social icons isolated due to user change');
    };

    window.addEventListener('user-data-isolation', handleDataIsolation);
    return () => window.removeEventListener('user-data-isolation', handleDataIsolation);
  }, []);

  // Carregar ícones sociais
  useEffect(() => {
    const loadSocialIcons = async () => {
      if (isGuest || !user) {
        // Modo guest: usar hook local
        return;
      }

      // Usuário logado: buscar do Supabase
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('social_icons')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index');

        if (error) {
          console.error('Erro ao carregar ícones sociais:', error);
          return;
        }

        setSocialIcons(data || []);
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialIcons();
  }, [user, isGuest]);

  const updateSocialIcon = async (id: string, iconUrl: string, link: string) => {
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

  // Retornar dados conforme o modo (guest ou logado)
  const effectiveSocialData = isGuest || !user ? socialNetworks : socialIcons.map(icon => ({
    id: icon.id,
    name: 'Custom',
    defaultIcon: icon.icon_url,
    customIcon: icon.icon_url,
    url: icon.link
  }));

  const effectiveUpdateFunction = isGuest || !user ? updateSocialNetwork : (id: string, updates: any) => {
    if (updates.customIcon || updates.url) {
      updateSocialIcon(id, updates.customIcon || '', updates.url || '');
    }
  };

  const effectiveAddFunction = isGuest || !user ? addSocialNetwork : (network: any) => {
    if (network.customIcon || network.url) {
      addSocialIcon(network.customIcon || '', network.url || '');
    }
  };

  const effectiveDeleteFunction = isGuest || !user ? deleteSocialNetwork : (id: string) => {
    deleteSocialIcon(id);
  };

  return {
    socialNetworks: effectiveSocialData,
    updateSocialNetwork: effectiveUpdateFunction,
    addSocialNetwork: effectiveAddFunction,
    deleteSocialNetwork: effectiveDeleteFunction,
    isLoading
  };
};