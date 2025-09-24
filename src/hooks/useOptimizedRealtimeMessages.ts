import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Message = Database['public']['Tables']['messages']['Row'];

interface UseOptimizedRealtimeMessagesProps {
  creatorId?: string;
  userId?: string;
  temporaryMode?: boolean;
  hideHistoryFromVisitors?: boolean;
}

export const useOptimizedRealtimeMessages = ({
  creatorId,
  userId,
  temporaryMode = false,
  hideHistoryFromVisitors = false
}: UseOptimizedRealtimeMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função otimizada para buscar mensagens
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (temporaryMode) {
        setMessages([]);
        setIsLoading(false);
        return;
      }
      
      const targetUserId = creatorId || userId;
      if (!targetUserId) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const isVisitor = !userId || (creatorId && userId !== creatorId);
      const limit = isVisitor && hideHistoryFromVisitors ? 3 : undefined;
      
      let query = supabase
        .from('messages')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: !limit });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
        toast.error('❌ Erro ao carregar mensagens');
      } else if (data) {
        const sortedMessages = limit 
          ? [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          : data;
        setMessages(sortedMessages);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [creatorId, userId, temporaryMode, hideHistoryFromVisitors]);

  // Setup realtime subscription otimizada
  useEffect(() => {
    fetchMessages();

    const targetUserId = creatorId || userId;
    if (!targetUserId || temporaryMode) return;

    const channel = supabase
      .channel('messages-optimized')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${targetUserId}`
      }, (payload) => {
        const isVisitor = !userId || (creatorId && userId !== creatorId);
        
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // OTIMIZAÇÃO: Usar Set para verificação O(1) ao invés de some() O(n)
            const messageIds = new Set(prev.map(m => m.id));
            if (messageIds.has(newMessage.id)) return prev;
            const next = [...prev, newMessage];
            return isVisitor && hideHistoryFromVisitors ? next.slice(-3) : next;
          });
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(msg => 
            msg.id === (payload.new as Message).id ? payload.new as Message : msg
          ));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== (payload.old as Message).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, creatorId, userId, temporaryMode]);

  return {
    messages,
    isLoading,
    error,
    refetch: fetchMessages
  };
};