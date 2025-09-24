import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { useDataIsolation } from './useDataIsolation';

interface ChatConfig {
  userName: string;
  userAvatar: string;
  chatColor: string;
  glassMorphism: boolean;
  fleffyMode: boolean;
  showCreatorName: boolean;
  hideHistoryFromVisitors: boolean;
  chatSize: number;
  chatBackgroundColor: string;
}

const defaultConfig: ChatConfig = {
  userName: "João",
  userAvatar: "",
  chatColor: "#4A90E2",
  glassMorphism: false,
  fleffyMode: false,
  showCreatorName: true,
  hideHistoryFromVisitors: false,
  chatSize: 50,
  chatBackgroundColor: "transparent"
};

export const useChatConfiguration = () => {
  const [config, setConfig] = useState<ChatConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isGuest } = useGoogleAuth();
  const { currentUserId } = useDataIsolation();

  // Load configuration
  useEffect(() => {
    const loadConfig = async () => {
      if (isGuest || !user) {
        // Guest mode: use localStorage
        const savedConfig = localStorage.getItem('chatConfig');
        if (savedConfig) {
          try {
            setConfig(JSON.parse(savedConfig));
          } catch (error) {
            console.error('Error loading guest chat config:', error);
          }
        }
        return;
      }

      // Logged user: load from Supabase
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading chat config:', error);
          return;
        }

        if (data?.settings && typeof data.settings === 'object') {
          const settings = data.settings as any;
          if (settings.chatConfig) {
            setConfig(settings.chatConfig);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [user, isGuest, currentUserId]);

  const saveConfig = async (newConfig: Partial<ChatConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    if (isGuest || !user) {
      // Guest mode: save to localStorage
      localStorage.setItem('chatConfig', JSON.stringify(updatedConfig));
      return;
    }

    // Logged user: save to Supabase
    setIsLoading(true);
    try {
      // Primeiro, obter as configurações existentes
      const { data: currentData } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentSettings = (currentData?.settings && typeof currentData.settings === 'object') 
        ? currentData.settings as any 
        : {};
      
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: {
            ...currentSettings,
            chatConfig: updatedConfig
          }
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving chat config:', error);
        throw error;
      }
    } catch (err) {
      console.error('Unexpected error saving config:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    config,
    saveConfig,
    isLoading
  };
};