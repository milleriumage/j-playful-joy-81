import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VisibilitySettings {
  showMediaToVisitors: boolean;
  showVitrine: boolean;
  showEditIcons: boolean;
  showSocialEditIcons: boolean;
  showSettingsButton: boolean;
  showUploadButtons: boolean;
  showPremiumDialog: boolean;
  showPasswordProtection: boolean;
  showMenuDropdown: boolean;
  showChatCloseIcon: boolean;
  showChatMessageEdit: boolean;
  showChatEditing: boolean;
  showMediaActions: boolean;
  showMediaInteractionStats: boolean;
  showChat: boolean;
  showMainScreen: boolean;
  showActiveSlotsIndicator: boolean;
  showMainMediaDisplay: boolean;
  showVitrineTextEdit: boolean;
  showVitrineBackgroundEdit: boolean;
  showGalleryButton: boolean; // Controla visibilidade do botão Galeria
}

const defaultSettings: VisibilitySettings = {
  showMediaToVisitors: true,
  showVitrine: true,
  showEditIcons: true,
  showSocialEditIcons: true,
  showSettingsButton: true,
  showUploadButtons: true,
  showPremiumDialog: true,
  showPasswordProtection: true,
  showMenuDropdown: true,
  showChatCloseIcon: true,
  showChatMessageEdit: true,
  showChatEditing: true,
  showMediaActions: true,
  showMediaInteractionStats: true,
  showChat: true,
  showMainScreen: true,
  showActiveSlotsIndicator: true,
  showMainMediaDisplay: true,
  showVitrineTextEdit: true,
  showVitrineBackgroundEdit: true,
  showGalleryButton: true, // Botão Galeria visível por padrão
};

export const useVisibilitySettings = (creatorId?: string, visitorMode?: boolean) => {
  const [settings, setSettings] = useState<VisibilitySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      // Determinar se estamos em modo visitante automaticamente
      const { data: { user } } = await supabase.auth.getUser();
      const isViewingAsVisitor = creatorId && (!user || user.id !== creatorId);
      
      // When viewing a creator's shared page, load that creator's settings
      if (creatorId) {
        console.log('⚙️ DEBUG: Loading visibility settings for creator:', creatorId, 'as visitor:', isViewingAsVisitor);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('settings')
          .eq('user_id', creatorId)
          .single();

        if (error) {
          console.error('❌ DEBUG: Error loading visibility settings for creator:', error);
          console.log('🔍 DEBUG: Visibility settings error details:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
          // Se não encontrar perfil, usar configurações padrão
          const visitorSafeSettings = isViewingAsVisitor ? {
            ...defaultSettings,
            showEditIcons: false,
            showSocialEditIcons: false,
            showSettingsButton: false,
            showUploadButtons: false,
            showMenuDropdown: false,
            showPasswordProtection: false,
            showChatEditing: false,
            showChatMessageEdit: false,
          } : defaultSettings;
          console.log('📋 DEBUG: Using visitor-safe default settings');
          setSettings(visitorSafeSettings);
        } else if (data) {
          const profileSettings = (data as any).settings || {};
          const settingsKey = visitorMode ? 'visitorVisibilitySettings' : 'visibilitySettings';
          const visibilitySettings = profileSettings[settingsKey] || {};
          let mergedSettings = {
            ...defaultSettings,
            ...visibilitySettings,
          };
          
          // Garantir que visitantes nunca vejam controles de edição
          if (isViewingAsVisitor) {
            mergedSettings = {
              ...mergedSettings,
              showEditIcons: false,
              showSocialEditIcons: false,
              showSettingsButton: false,
              showUploadButtons: false,
              showMenuDropdown: false,
              showPasswordProtection: false,
              showChatEditing: false,
              showChatMessageEdit: false,
            };
          }
          
          console.log('✅ DEBUG: Visibility settings loaded:', {
            mode: isViewingAsVisitor ? 'visitor' : 'creator',
            raw: visibilitySettings,
            merged: mergedSettings,
            showMediaToVisitors: mergedSettings.showMediaToVisitors
          });
          setSettings(mergedSettings);
        } else {
          // Se não há dados, usar configurações seguras para visitantes
          const visitorSafeSettings = isViewingAsVisitor ? {
            ...defaultSettings,
            showEditIcons: false,
            showSocialEditIcons: false,
            showSettingsButton: false,
            showUploadButtons: false,
            showMenuDropdown: false,
            showPasswordProtection: false,
            showChatEditing: false,
            showChatMessageEdit: false,
          } : defaultSettings;
          console.log('📋 DEBUG: No settings data found, using visitor-safe defaults');
          setSettings(visitorSafeSettings);
        }
        return;
      }

      // Fallback to current authenticated user's settings
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', currentUser.id)
        .single();

      if (error) {
        console.error('Error loading visibility settings:', error);
        setSettings(defaultSettings);
      } else if (data) {
        const profileSettings = (data as any).settings || {};
        const settingsKey = visitorMode ? 'visitorVisibilitySettings' : 'visibilitySettings';
        const mergedSettings = {
          ...defaultSettings,
          ...profileSettings[settingsKey],
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Error loading visibility settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<VisibilitySettings>) => {
    try {
      const { data: { user: updateUser } } = await supabase.auth.getUser();
      if (!updateUser) {
        toast.error("❌ Faça login para salvar configurações");
        return;
      }

      // Prevent updating someone else's settings
      if (creatorId && updateUser.id !== creatorId) {
        toast.error("❌ Somente o criador pode alterar estas configurações");
        return;
      }

      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Buscar settings atual
      const { data: currentData } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', updateUser.id)
        .single();

      const currentSettings = (currentData?.settings as any) || {};
      const settingsKey = visitorMode ? 'visitorVisibilitySettings' : 'visibilitySettings';
      
      const updatedProfileSettings = {
        ...currentSettings,
        [settingsKey]: updatedSettings,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          settings: updatedProfileSettings,
        })
        .eq('user_id', updateUser.id);

      if (error) {
        console.error('Error updating visibility settings:', error);
        toast.error("❌ Erro ao salvar configurações");
        // Reverter mudanças locais em caso de erro
        setSettings(settings);
      } else {
        toast.success("✅ Configurações de visibilidade atualizadas!");
      }
    } catch (error) {
      console.error('Error updating visibility settings:', error);
      toast.error("❌ Erro ao salvar configurações");
      setSettings(settings);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [creatorId, visitorMode]);

  return {
    settings,
    updateSettings,
    isLoading,
    refreshSettings: loadSettings,
  };
};