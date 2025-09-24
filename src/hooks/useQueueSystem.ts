import { useState, useEffect, useCallback } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { useGuestData } from './useGuestData';
import { toast } from 'sonner';

interface QueueUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'guest';
  joined_at: string;
  bypass_queue: boolean;
}

interface QueueSettings {
  enabled: boolean;
  wait_time_minutes: number; // 5, 10, 20, 40
  current_user_id?: string;
  queue_expires_at?: string;
}

export const useQueueSystem = (creatorId?: string) => {
  const [queueSettings, setQueueSettings] = useState<QueueSettings>({
    enabled: false,
    wait_time_minutes: 10
  });
  const [queueUsers, setQueueUsers] = useState<QueueUser[]>([]);
  const [isInQueue, setIsInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canEnterRoom, setCanEnterRoom] = useState(true);
  
  const { user } = useGoogleAuth();
  const { guestData } = useGuestData();
  
  const currentUserId = user?.id || `guest_${guestData.sessionId}`;
  const currentUserName = user 
    ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário')
    : (guestData.displayName || `Guest ${guestData.sessionId.slice(-4)}`);

  // Load queue settings from localStorage
  const loadQueueSettings = useCallback(() => {
    if (!creatorId) return;
    
    try {
      const stored = localStorage.getItem(`queue_settings_${creatorId}`);
      if (stored) {
        const settings = JSON.parse(stored);
        setQueueSettings(settings);
      }
    } catch (error) {
      console.error('Error loading queue settings:', error);
    }
  }, [creatorId]);

  // Save queue settings to localStorage
  const updateQueueSettings = useCallback((settings: Partial<QueueSettings>) => {
    if (!creatorId) return;
    
    try {
      const newSettings = { ...queueSettings, ...settings };
      localStorage.setItem(`queue_settings_${creatorId}`, JSON.stringify(newSettings));
      setQueueSettings(newSettings);
      toast.success('Configurações da fila atualizadas');
    } catch (error) {
      console.error('Error saving queue settings:', error);
      toast.error('Erro ao salvar configurações da fila');
    }
  }, [creatorId, queueSettings]);

  // Join queue
  const joinQueue = useCallback(() => {
    if (!creatorId || !queueSettings.enabled) return;
    
    try {
      const queueKey = `queue_users_${creatorId}`;
      const existing = localStorage.getItem(queueKey);
      const queueList = existing ? JSON.parse(existing) : [];
      
      const userInQueue = queueList.find((u: any) => u.id === currentUserId);
      if (userInQueue) return; // Already in queue
      
      const newUser = {
        id: currentUserId,
        name: currentUserName,
        avatar: user?.user_metadata?.avatar_url || guestData.avatarUrl,
        type: user ? 'user' : 'guest',
        joined_at: new Date().toISOString(),
        bypass_queue: false
      };
      
      queueList.push(newUser);
      localStorage.setItem(queueKey, JSON.stringify(queueList));
      setQueueUsers(queueList);
      setIsInQueue(true);
      toast.info('Você entrou na fila de espera');
    } catch (error) {
      console.error('Error joining queue:', error);
    }
  }, [creatorId, queueSettings.enabled, currentUserId, currentUserName, user, guestData]);

  // Leave queue
  const leaveQueue = useCallback(() => {
    if (!creatorId) return;
    
    try {
      const queueKey = `queue_users_${creatorId}`;
      const existing = localStorage.getItem(queueKey);
      const queueList = existing ? JSON.parse(existing) : [];
      
      const filteredQueue = queueList.filter((u: any) => u.id !== currentUserId);
      localStorage.setItem(queueKey, JSON.stringify(filteredQueue));
      setQueueUsers(filteredQueue);
      setIsInQueue(false);
      setQueuePosition(0);
      setTimeRemaining(0);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  }, [creatorId, currentUserId]);

  // Set user bypass status
  const setUserBypass = useCallback((userId: string, bypass: boolean) => {
    if (!creatorId) return;
    
    try {
      const queueKey = `queue_users_${creatorId}`;
      const existing = localStorage.getItem(queueKey);
      const queueList = existing ? JSON.parse(existing) : [];
      
      const updatedQueue = queueList.map((u: any) => 
        u.id === userId ? { ...u, bypass_queue: bypass } : u
      );
      
      localStorage.setItem(queueKey, JSON.stringify(updatedQueue));
      setQueueUsers(updatedQueue);
      toast.success(`Usuário ${bypass ? 'liberado' : 'adicionado'} ${bypass ? 'da' : 'à'} fila`);
    } catch (error) {
      console.error('Error updating user bypass:', error);
    }
  }, [creatorId]);

  // Check if user can enter room
  const checkRoomAccess = useCallback(() => {
    if (!queueSettings.enabled) {
      setCanEnterRoom(true);
      return;
    }
    
    // Check if user has bypass
    const userInQueue = queueUsers.find(u => u.id === currentUserId);
    if (userInQueue?.bypass_queue) {
      setCanEnterRoom(true);
      return;
    }
    
    // Check if room is occupied
    const roomOccupied = queueSettings.current_user_id && 
                        queueSettings.queue_expires_at && 
                        new Date(queueSettings.queue_expires_at) > new Date();
    
    if (!roomOccupied) {
      setCanEnterRoom(true);
      return;
    }
    
    // Check if user is first in queue
    const sortedQueue = queueUsers
      .filter(u => !u.bypass_queue)
      .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
    
    const firstInQueue = sortedQueue[0];
    setCanEnterRoom(firstInQueue?.id === currentUserId);
    
    // Set position in queue
    const position = sortedQueue.findIndex(u => u.id === currentUserId);
    setQueuePosition(position >= 0 ? position + 1 : 0);
  }, [queueSettings, queueUsers, currentUserId]);

  // Load queue users from localStorage
  const loadQueueUsers = useCallback(() => {
    if (!creatorId) return;
    
    try {
      const queueKey = `queue_users_${creatorId}`;
      const existing = localStorage.getItem(queueKey);
      const queueList = existing ? JSON.parse(existing) : [];
      setQueueUsers(queueList);
      
      // Check if current user is in queue
      const userInQueue = queueList.find((u: any) => u.id === currentUserId);
      setIsInQueue(!!userInQueue);
    } catch (error) {
      console.error('Error loading queue users:', error);
    }
  }, [creatorId, currentUserId]);

  // Timer countdown
  useEffect(() => {
    if (!queueSettings.enabled || canEnterRoom || !isInQueue) {
      setTimeRemaining(0);
      return;
    }
    
    const calculateTimeRemaining = () => {
      if (queueSettings.queue_expires_at) {
        const expiresAt = new Date(queueSettings.queue_expires_at).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeRemaining(remaining);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [queueSettings, canEnterRoom, isInQueue]);

  // Check room access when dependencies change
  useEffect(() => {
    checkRoomAccess();
  }, [checkRoomAccess]);

  // Initialize
  useEffect(() => {
    loadQueueSettings();
    loadQueueUsers();
  }, [loadQueueSettings, loadQueueUsers]);

  return {
    queueSettings,
    queueUsers,
    isInQueue,
    queuePosition,
    timeRemaining,
    canEnterRoom,
    updateQueueSettings,
    joinQueue,
    leaveQueue,
    setUserBypass
  };
};