
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useGoogleAuth } from './useGoogleAuth';
import { useChatControls } from './useChatControls';
import { useChatConfiguration } from './useChatConfiguration';

type Message = Database['public']['Tables']['messages']['Row'];

export const useRealtimeMessages = (creatorId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useGoogleAuth();
  const { controls } = useChatControls();
  const { config } = useChatConfiguration();

  useEffect(() => {
    // Só limpar mensagens se realmente mudou o contexto (não apenas carregou)
    if (user?.id || creatorId) {
      setMessages([]);
    }
    
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Se modo temporário ativo, não carregar mensagens do banco
        if (controls.temporaryMessages) {
          console.log('Temporary mode enabled, skipping database fetch');
          setMessages([]);
          setIsLoading(false);
          return;
        }
        
        // Verificar se é visitante e se deve ocultar histórico
        const isVisitor = !user || (creatorId && user.id !== creatorId);
        
        // Se não há usuário autenticado e não é criador, também não carregar histórico antigo
        if (!user && !creatorId) {
          console.log('No authenticated user and no creator ID, skipping message fetch');
          setMessages([]);
          setIsLoading(false);
          return;
        }
        
        // Determinar qual user_id usar para buscar mensagens
        const targetUserId = creatorId || user?.id;
        if (!targetUserId) {
          console.log('No target user ID available');
          setMessages([]);
          setIsLoading(false);
          return;
        }

        // Se é visitante e histórico está oculto, carregar apenas as últimas 3 mensagens
        if (isVisitor && config.hideHistoryFromVisitors) {
          console.log('Visitor mode with hidden history, fetching last 3 messages');
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(3);

          if (error) {
            console.error('Error fetching limited messages:', error);
            setError('Failed to load messages');
            toast.error('❌ Erro ao carregar mensagens');
          } else if (data) {
            const sorted = [...data].sort((a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            console.log(`Loaded last ${sorted.length} messages for visitor`);
            setMessages(sorted);
          }
        } else {
          // Carregar todas as mensagens para o criador
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages');
            toast.error('❌ Erro ao carregar mensagens');
          } else if (data) {
            console.log(`Loaded ${data.length} messages for user ${targetUserId}`);
            setMessages(data);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const targetUserId = creatorId || user?.id;
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('Real-time message update:', payload);
          
          // Verificar se a mensagem pertence ao usuário/criador correto
          if (!targetUserId) return;
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            // Aceitar mensagens tanto do criador quanto do visitante na mesma conversa
            if (newMessage.user_id === targetUserId) {
              const isVisitor = !user || (creatorId && user.id !== creatorId);
              setMessages(prev => {
                // OTIMIZAÇÃO: Usar Set para verificação O(1) ao invés de some() O(n)
                const messageIds = new Set(prev.map(m => m.id));
                if (messageIds.has(newMessage.id)) return prev;
                
                const next = [...prev, newMessage];
                
                // Se é visitante com histórico oculto, manter apenas as últimas 3 mensagens
                if (isVisitor && config.hideHistoryFromVisitors) {
                  return next.slice(-3);
                }
                
                return next;
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as Message;
            if (updatedMessage.user_id === targetUserId) {
              setMessages(prev => prev.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedMessage = payload.old as Message;
            if (deletedMessage.user_id === targetUserId) {
              setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          setError('Real-time connection failed');
          toast.error('❌ Conexão em tempo real perdida');
        }
      });

    return () => {
      console.log('Cleaning up messages subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, controls.temporaryMessages, creatorId, config.hideHistoryFromVisitors]);

  const sendMessage = async (username: string, message: string, color: string, speech?: string) => {
    try {
      // Se modo temporário, apenas adicionar à memória local
      if (controls.temporaryMessages) {
        const tempMessage: Message = {
          id: crypto.randomUUID(),
          username,
          message,
          color,
          speech: speech || null,
          user_id: creatorId || user?.id || null,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);
        return true;
      }

      // Inserção otimística para feedback instantâneo
      const targetUserId = creatorId || user?.id || null;
      const newId = crypto.randomUUID();
      const optimistic: Message = {
        id: newId,
        username,
        message,
        color,
        speech: speech || null,
        user_id: targetUserId,
        created_at: new Date().toISOString()
      };

      // Sempre adicionar mensagem otimisticamente (instantâneo)
      const isVisitor = !user || (creatorId && user?.id !== creatorId);
      setMessages(prev => {
        const next = [...prev, optimistic];
        // Se é visitante com histórico oculto, manter apenas as últimas 3 mensagens
        if (isVisitor && config.hideHistoryFromVisitors) {
          return next.slice(-3);
        }
        return next;
      });

      const { error } = await supabase
        .from('messages')
        .insert({
          id: newId,
          username,
          message,
          color,
          speech,
          user_id: targetUserId
        });

      if (error) {
        console.error('Error sending message:', error);
        // Rollback otimística
        setMessages(prev => prev.filter(m => m.id !== newId));
        toast.error('❌ Erro ao enviar mensagem');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error sending message:', err);
      toast.error('❌ Erro inesperado ao enviar mensagem');
      return false;
    }
  };

  const updateMessageSpeech = async (messageId: string, speech: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ speech })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating message speech:', error);
        toast.error('❌ Erro ao atualizar áudio da mensagem');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error updating message:', err);
      toast.error('❌ Erro inesperado ao atualizar mensagem');
      return false;
    }
  };

  const clearMessages = async () => {
    try {
      // Limpar memória local primeiro
      setMessages([]);
      
      // Se modo temporário ou usuário não autenticado, apenas limpar memória
      if (controls.temporaryMessages || !user) {
        toast.success('🗑️ Mensagens limpas da memória');
        return true;
      }

      // Limpar do banco de dados
      const targetUserId = creatorId || user.id;
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', targetUserId); // Deletar mensagens do criador ou usuário atual

      if (error) {
        console.error('Error clearing messages:', error);
        toast.error('❌ Erro ao limpar mensagens do banco');
        return false;
      } else {
        toast.success('🗑️ Mensagens limpas da memória e banco de dados');
        return true;
      }
    } catch (err) {
      console.error('Unexpected error clearing messages:', err);
      toast.error('❌ Erro inesperado ao limpar mensagens');
      return false;
    }
  };

  return { 
    messages, 
    sendMessage, 
    updateMessageSpeech,
    clearMessages,
    isLoading,
    error
  };
};
