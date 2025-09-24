import { useState, useEffect, useCallback } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { validateCredits, validateGuestData, safeJSONParse } from '@/utils/dataValidation';
import { supabase } from '@/integrations/supabase/client';

interface GuestNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  credits_amount?: number;
  created_at: string;
}

interface GuestData {
  notifications: GuestNotification[];
  credits: number;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  displayName?: string;
  avatarUrl?: string;
}

const GUEST_DATA_KEY = 'dreamlink_guest_data';
const GUEST_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Gerar ou recuperar sessão guest única
const getGuestSessionId = (): string => {
  const savedResult = safeJSONParse(localStorage.getItem(GUEST_DATA_KEY), null);
  
  if (savedResult.isValid && savedResult.data) {
    const validation = validateGuestData(savedResult.data);
    if (validation.isValid && Date.now() < validation.data!.expiresAt) {
      return validation.data!.sessionId;
    }
  }
  
  // Sessão expirada ou inválida - criar nova
  localStorage.removeItem(GUEST_DATA_KEY);
  const newSessionId = crypto.randomUUID();
  console.log('🆔 Nova sessão guest criada:', newSessionId);
  return newSessionId;
};

export const useGuestData = () => {
  const [guestData, setGuestData] = useState<GuestData>({
    notifications: [],
    credits: 40,
    sessionId: getGuestSessionId(),
    createdAt: Date.now(),
    expiresAt: Date.now() + GUEST_SESSION_DURATION,
    displayName: undefined,
    avatarUrl: undefined
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const saved = localStorage.getItem(GUEST_DATA_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verificar se a sessão não expirou
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setGuestData(parsed);
          console.log('✅ Sessão guest válida carregada:', parsed.sessionId);
        } else {
          // Sessão expirada - criar nova
          console.log('🕒 Sessão guest expirada - criando nova');
          const newData = {
            notifications: [],
            credits: 40,
            sessionId: getGuestSessionId(),
            createdAt: Date.now(),
            expiresAt: Date.now() + GUEST_SESSION_DURATION
          };
          setGuestData(newData);
          localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newData));
        }
      } catch (error) {
        console.error('Erro ao carregar dados guest:', error);
        // Criar nova sessão em caso de erro
        const newData = {
          notifications: [],
          credits: 40,
          sessionId: getGuestSessionId(),
          createdAt: Date.now(),
          expiresAt: Date.now() + GUEST_SESSION_DURATION
        };
        setGuestData(newData);
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newData));
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(guestData));
  }, [guestData]);

  const addGuestNotification = (notification: Omit<GuestNotification, 'id' | 'created_at'>) => {
    const newNotification: GuestNotification = {
      ...notification,
      id: `guest-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setGuestData(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications].slice(0, 50) // Manter apenas 50 notificações
    }));
  };

  const updateGuestCredits = (credits: number) => {
    const validation = validateCredits(credits);
    
    if (!validation.isValid) {
      console.error('Créditos inválidos:', validation.error);
      return;
    }

    setGuestData(prev => ({
      ...prev,
      credits: validation.data!
    }));
  };

  const removeGuestNotification = (notificationId: string) => {
    setGuestData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId)
    }));
  };

  const clearGuestNotifications = () => {
    setGuestData(prev => ({
      ...prev,
      notifications: []
    }));
  };

  const updateGuestProfile = useCallback(async (updates: Partial<Pick<GuestData, 'displayName' | 'avatarUrl'>>) => {
    setGuestData(prev => {
      const updated = { ...prev, ...updates };
      
      // Sincronizar com a tabela guest_profiles no Supabase
      if (prev.sessionId) {
        supabase
          .from('guest_profiles')
          .upsert({
            session_id: prev.sessionId,
            display_name: updated.displayName || null,
            avatar_url: updated.avatarUrl || null
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error syncing guest profile to Supabase:', error);
            }
          });
      }
      
      return updated;
    });
  }, []);

  const clearGuestData = () => {
    const initialData = { 
      notifications: [], 
      credits: 40,
      sessionId: getGuestSessionId(),
      createdAt: Date.now(),
      expiresAt: Date.now() + GUEST_SESSION_DURATION,
      displayName: undefined,
      avatarUrl: undefined
    };
    setGuestData(initialData);
    localStorage.removeItem(GUEST_DATA_KEY);
  };

  // Função para obter dados para fusão (antes do login)
  const getGuestDataForMerge = () => ({
    wishlist: localStorage.getItem(`wishlist_guest_${guestData.sessionId}`),
    credits: guestData.credits,
    notifications: guestData.notifications,
    sessionId: guestData.sessionId
  });

  return {
    guestData,
    addGuestNotification,
    removeGuestNotification,
    updateGuestCredits,
    updateGuestProfile,
    clearGuestNotifications,
    clearGuestData,
    getGuestDataForMerge
  };
};