import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePageVisibility = () => {
  const [isPagePublic, setIsPagePublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const loadPageVisibility = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading page visibility:', error);
        return;
      }

      const settings = (data?.settings as any) || {};
      setIsPagePublic(settings.pagePublic !== false); // Default to true
    } catch (error) {
      console.error('Error loading page visibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePageVisibility = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("❌ Faça login para alterar visibilidade");
        return;
      }

      const newVisibility = !isPagePublic;
      
      // Get current settings
      const { data: currentData } = await supabase
        .from('profiles')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      const currentSettings = (currentData?.settings as any) || {};
      
      const updatedSettings = {
        ...currentSettings,
        pagePublic: newVisibility,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          settings: updatedSettings,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating page visibility:', error);
        toast.error("❌ Erro ao alterar visibilidade");
        return;
      }

      setIsPagePublic(newVisibility);
      toast.success(
        newVisibility 
          ? "✅ Página agora é pública" 
          : "🔒 Página agora é privada"
      );
    } catch (error) {
      console.error('Error updating page visibility:', error);
      toast.error("❌ Erro ao alterar visibilidade");
    }
  };

  useEffect(() => {
    loadPageVisibility();
  }, []);

  return {
    isPagePublic,
    isLoading,
    togglePageVisibility,
  };
};