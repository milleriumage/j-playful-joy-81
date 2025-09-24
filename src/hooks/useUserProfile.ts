import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { toast } from 'sonner';
import { useDataIsolation } from './useDataIsolation';

interface ProfileData {
  fullName: string;
  email: string;
  secondEmail: string;
  primaryEmail: 'first' | 'second';
  birthDate: string;
  phone: string;
  profileImage?: string;
}

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    secondEmail: "",
    primaryEmail: 'first',
    birthDate: "",
    phone: "",
    profileImage: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, isGuest } = useGoogleAuth();
  const { currentUserId } = useDataIsolation();

  // Limpar dados do perfil quando o usuário muda
  useEffect(() => {
    setProfileData({
      fullName: "",
      email: "",
      secondEmail: "",
      primaryEmail: 'first',
      birthDate: "",
      phone: "",
      profileImage: ""
    });
    console.log('🔄 Profile data cleared for user:', currentUserId);
  }, [currentUserId]);

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (isGuest || !user) {
        // Modo guest: usar localStorage
        const savedProfile = localStorage.getItem('profileData');
        if (savedProfile) {
          try {
            setProfileData(JSON.parse(savedProfile));
          } catch (error) {
            console.error('Erro ao carregar perfil guest:', error);
          }
        }
        return;
      }

      // Usuário logado: buscar do Supabase
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, bio, settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao carregar perfil:', error);
          return;
        }

        if (data?.settings) {
          const settings = data.settings as any;
          setProfileData({
            fullName: data.display_name || '',
            email: settings.email || user.email || '', // Use email from settings first, then fallback to user.email
            secondEmail: settings.secondEmail || '',
            primaryEmail: settings.primaryEmail || 'first',
            birthDate: settings.birthDate || '',
            phone: settings.phone || '',
            profileImage: data.avatar_url || ''
          });
        } else {
          // If no settings, use user.email as default
          setProfileData({
            fullName: data?.display_name || '',
            email: user.email || '',
            secondEmail: '',
            primaryEmail: 'first',
            birthDate: '',
            phone: '',
            profileImage: data?.avatar_url || ''
          });
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, isGuest]);

  const saveProfile = async () => {
    if (isGuest || !user) {
      // Modo guest: salvar no localStorage
      localStorage.setItem('profileData', JSON.stringify(profileData));
      toast.success("✅ Profile updated successfully!");
      return;
    }

    // Usuário logado: salvar no Supabase
    setIsLoading(true);
    try {
      // Save profile data
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profileData.fullName,
          avatar_url: profileData.profileImage,
          settings: {
            email: profileData.email, // Save email in settings
            secondEmail: profileData.secondEmail,
            primaryEmail: profileData.primaryEmail,
            birthDate: profileData.birthDate,
            phone: profileData.phone
          }
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast.error('❌ Erro ao salvar perfil');
        return;
      }

      // Manage second email alias for login
      if (profileData.secondEmail && profileData.secondEmail.trim() !== '') {
        // First, deactivate any existing aliases for this user
        await supabase
          .from('user_email_aliases')
          .update({ is_active: false })
          .eq('user_id', user.id);

        // Then create new alias for second email
        const { error: aliasError } = await supabase
          .from('user_email_aliases')
          .upsert({
            user_id: user.id,
            alias_email: profileData.secondEmail.trim().toLowerCase(),
            is_active: true
          });

        if (aliasError) {
          console.error('Erro ao salvar alias de email:', aliasError);
          // Don't throw error, just log it
        }
      } else {
        // If no second email, deactivate all aliases
        await supabase
          .from('user_email_aliases')
          .update({ is_active: false })
          .eq('user_id', user.id);
      }

      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      console.error('Erro inesperado ao salvar:', err);
      toast.error('❌ Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return {
    profileData,
    updateProfile,
    saveProfile,
    isLoading
  };
};