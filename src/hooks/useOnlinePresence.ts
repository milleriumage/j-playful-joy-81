import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { useGuestData } from './useGuestData';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'guest';
  online_at: string;
}

export const useOnlinePresence = (roomId: string = 'global') => {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [usersList, setUsersList] = useState<OnlineUser[]>([]);
  const { user } = useGoogleAuth();
  const { guestData } = useGuestData();

  useEffect(() => {
    if (!roomId) return;

    const userId = user?.id || `guest_${guestData.sessionId}`;
    const channel = supabase.channel(`presence-${roomId}`, {
      config: {
        presence: { key: userId }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).length;
        setOnlineUsers(users);
        
        // Extrair lista de usuários com informações
        const onlineUsersList: OnlineUser[] = Object.entries(state).map(([key, presences]) => {
          const presence = presences[0] as any;
          return {
            id: key,
            name: presence.name || (key.startsWith('guest_') ? `Guest ${key.slice(-4)}` : 'Usuário'),
            avatar: presence.avatar,
            type: key.startsWith('guest_') ? 'guest' : 'user',
            online_at: presence.online_at
          };
        });
        
        setUsersList(onlineUsersList);
        console.log('👥 Usuários online:', users, onlineUsersList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('✅ Usuário entrou:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('❌ Usuário saiu:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence with profile info
          const userStatus = {
            user: userId,
            name: user 
              ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário')
              : (guestData.displayName || `Guest ${guestData.sessionId.slice(-4)}`),
            avatar: user?.user_metadata?.avatar_url || guestData.avatarUrl,
            online_at: new Date().toISOString(),
          };

          await channel.track(userStatus);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id, guestData.sessionId, guestData.displayName, guestData.avatarUrl]);

  return { onlineUsers, usersList };
};