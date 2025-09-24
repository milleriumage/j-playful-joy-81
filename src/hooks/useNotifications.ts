import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { useGuestData } from './useGuestData';
import { useDataIsolation } from './useDataIsolation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  credits_amount?: number;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isGuest } = useGoogleAuth();
  const { guestData, addGuestNotification, removeGuestNotification, clearGuestNotifications } = useGuestData();
  const { currentUserId } = useDataIsolation();

  // Limpar notificações quando o usuário muda
  useEffect(() => {
    setNotifications([]);
    setIsLoading(false);
    console.log('🔄 Notifications cleared for user:', currentUserId);
  }, [currentUserId]);

  // Listener para evento de isolamento de dados
  useEffect(() => {
    const handleDataIsolation = () => {
      setNotifications([]);
      setIsLoading(false);
      console.log('🔄 Notifications isolated due to user change');
    };

    window.addEventListener('user-data-isolation', handleDataIsolation);
    return () => window.removeEventListener('user-data-isolation', handleDataIsolation);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      console.log('🔍 Buscando notificações para usuário:', user?.id || 'guest', isGuest);
      
      // CRÍTICO: Sempre limpar notificações primeiro para evitar contaminação entre usuários
      setNotifications([]);
      setIsLoading(false);
      
      if (isGuest) {
        // Modo guest: usar dados locais
        console.log('📱 Modo guest - usando dados locais:', guestData.notifications.length);
        setNotifications(guestData.notifications as Notification[]);
        return;
      }

      if (!user?.id) {
        // Se não há usuário logado, garantir que não há notificações
        console.log('❌ Sem usuário logado - limpando notificações');
        setNotifications([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('📡 Chamando RPC get_notifications para usuário:', user.id);
        const { data, error } = await supabase.rpc('get_notifications');

        if (error) {
          console.error('❌ Erro ao buscar notificações:', error);
          setNotifications([]);
        } else {
          console.log('✅ Notificações recebidas:', data?.length || 0, data);
          setNotifications(data || []);
        }
      } catch (err) {
        console.error('💥 Erro inesperado:', err);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id, isGuest, guestData.notifications]);

  const createNotification = async (
    type: string,
    title: string, 
    message: string,
    creditsAmount?: number
  ) => {
    if (isGuest) {
      // Modo guest: adicionar apenas localmente
      addGuestNotification({
        type,
        title,
        message,
        credits_amount: creditsAmount
      });
      return true;
    }

    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: user?.id || null,
        p_type: type,
        p_title: title,
        p_message: message,
        p_credits_amount: creditsAmount
      });

      if (error) {
        console.error('Erro ao criar notificação:', error);
        return false;
      }

      // Atualizar a lista local
      const newNotification: Notification = {
        id: crypto.randomUUID(),
        type,
        title,
        message,
        credits_amount: creditsAmount,
        created_at: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      return true;
    } catch (err) {
      console.error('Erro inesperado ao criar notificação:', err);
      return false;
    }
  };

  const clearNotifications = async () => {
    if (isGuest) {
      // Modo guest: usar a função do hook para atualizar o estado corretamente
      clearGuestNotifications();
      setNotifications([]);
      return true;
    }

    if (!user) {
      return false;
    }

    try {
      // Limpar apenas as notificações do usuário atual
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao limpar notificações:', error);
        return false;
      }

      setNotifications([]);
      return true;
    } catch (err) {
      console.error('Erro inesperado ao limpar notificações:', err);
      return false;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (isGuest) {
      // Modo guest: usar função do hook para atualizar estado corretamente
      removeGuestNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return true;
    }

    if (!user) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar notificação:', error);
        return false;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return true;
    } catch (err) {
      console.error('Erro inesperado ao deletar notificação:', err);
      return false;
    }
  };

  return {
    notifications,
    isLoading,
    createNotification,
    clearNotifications,
    deleteNotification
  };
};