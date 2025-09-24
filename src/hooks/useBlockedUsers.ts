import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGoogleAuth } from './useGoogleAuth';

export interface BlockedUser {
  id: string;
  creator_id: string;
  blocked_user_id: string;
  created_at: string;
  expires_at?: string;
  user_email?: string;
  user_name?: string;
}

export const useBlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useGoogleAuth();

  const loadBlockedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('creator_id', user.id);

      if (error) {
        console.error('Erro ao carregar usuários bloqueados:', error);
        return;
      }

      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários bloqueados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userId: string, durationHours: number = 24) => {
    if (!user) {
      toast.error('❌ Você precisa estar logado para bloquear usuários');
      return false;
    }

    if (userId === user.id) {
      toast.error('❌ Você não pode bloquear a si mesmo');
      return false;
    }

    // Não permitir bloquear guests
    if (userId.startsWith('guest_')) {
      toast.error('❌ Não é possível bloquear visitantes anônimos');
      return false;
    }

    try {
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + durationHours);

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          creator_id: user.id,
          blocked_user_id: userId,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Erro ao bloquear usuário:', error);
        toast.error('❌ Erro ao bloquear usuário');
        return false;
      }

      toast.success(`✅ Usuário pausado por ${durationHours}h`);
      await loadBlockedUsers();
      return true;
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      toast.error('❌ Erro ao bloquear usuário');
      return false;
    }
  };

  const unblockUser = async (userId: string) => {
    if (!user) {
      toast.error('❌ Você precisa estar logado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('creator_id', user.id)
        .eq('blocked_user_id', userId);

      if (error) {
        console.error('Erro ao desbloquear usuário:', error);
        toast.error('❌ Erro ao desbloquear usuário');
        return false;
      }

      toast.success('✅ Usuário despausado com sucesso');
      await loadBlockedUsers();
      return true;
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      toast.error('❌ Erro ao desbloquear usuário');
      return false;
    }
  };

  const isUserBlocked = async (creatorId: string, userId: string): Promise<boolean> => {
    if (!userId || !creatorId) return false;

    try {
      // Clean expired blocks first
      await supabase.rpc('clean_expired_blocks');
      
      // Check if user is currently blocked (considering expiration)
      const { data } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('blocked_user_id', userId)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .maybeSingle();

      return !!data;
    } catch (error) {
      // If no data found or error, user is not blocked
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadBlockedUsers();
    }
  }, [user]);

  return {
    blockedUsers,
    isLoading,
    blockUser,
    unblockUser,
    isUserBlocked,
    refreshBlockedUsers: loadBlockedUsers
  };
};