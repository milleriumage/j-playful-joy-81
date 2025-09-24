import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useGoogleAuth } from './useGoogleAuth';

type Message = Database['public']['Tables']['messages']['Row'];

export const useCreatorMessages = (creatorId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideHistoryFromVisitors, setHideHistoryFromVisitors] = useState(false);
  const { user } = useGoogleAuth();

  useEffect(() => {
    if (!creatorId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchCreatorMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`📨 Fetching messages for creator: ${creatorId}`);
        
        // Buscar configuração do criador para verificar hideHistoryFromVisitors
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('settings')
          .eq('user_id', creatorId)
          .maybeSingle();
        
        let hideHistory = false;
        if (profileData?.settings && typeof profileData.settings === 'object') {
          const settings = profileData.settings as any;
          hideHistory = settings.chatConfig?.hideHistoryFromVisitors || false;
        }
        setHideHistoryFromVisitors(hideHistory);
        
        // Verificar se é visitante
        const isVisitor = !user || user.id !== creatorId;
        
        // Se é visitante e histórico está oculto, carregar apenas as últimas 3 mensagens
        if (isVisitor && hideHistory) {
          console.log('📝 Visitor mode with hidden history, fetching last 3 messages');
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', creatorId)
            .order('created_at', { ascending: false })
            .limit(3);

          if (error) {
            console.error('Error fetching limited creator messages:', error);
            setError('Failed to load messages');
            toast.error('❌ Erro ao carregar mensagens');
          } else if (data) {
            const sorted = [...data].sort((a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            console.log(`✅ Loaded last ${sorted.length} messages for visitor`);
            setMessages(sorted);
          }
          setIsLoading(false);
          return;
        }
        
        // Carregar todas as mensagens para o criador ou quando histórico não está oculto
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', creatorId) // Fetch messages from the creator's chat
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching creator messages:', error);
          setError('Failed to load creator messages');
          toast.error('❌ Erro ao carregar mensagens do criador');
        } else if (data) {
          console.log(`✅ Loaded ${data.length} messages for creator ${creatorId}`);
          setMessages(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorMessages();

    // Set up real-time subscription for creator's messages
    const channel = supabase
      .channel(`creator-messages-${creatorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${creatorId}` // Only listen to creator's messages
        },
        async (payload) => {
          console.log('Real-time creator message update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            
            // Verificar se precisa limitar as mensagens para visitantes
            const isVisitor = !user || user.id !== creatorId;
            
            setMessages(prev => {
              // Evitar duplicados
              if (prev.some(m => m.id === newMessage.id)) return prev;
              
              const next = [...prev, newMessage];
              
              // Se é visitante com histórico oculto, manter apenas as últimas 3 mensagens
              if (isVisitor && hideHistoryFromVisitors) {
                return next.slice(-3);
              }
              
              return next;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as Message;
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedMessage = payload.old as Message;
            setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Creator messages subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          setError('Real-time connection failed');
          toast.error('❌ Conexão em tempo real perdida');
        }
      });

    return () => {
      console.log('Cleaning up creator messages subscription');
      supabase.removeChannel(channel);
    };
  }, [creatorId, user?.id]); // Reexecutar quando o usuário mudar

  // Send message to creator's chat - allows both authenticated and anonymous users
  const sendMessage = async (username: string, message: string, color: string, speech?: string) => {
    if (!creatorId) {
      toast.error('❌ ID do criador não encontrado');
      return false;
    }

    try {
      console.log(`📤 Sending message to creator ${creatorId}:`, { username, message });
      
      // Inserção otimística para feedback instantâneo
      const newId = crypto.randomUUID();
      const optimistic: Message = {
        id: newId,
        username,
        message,
        color,
        speech: speech || null,
        user_id: creatorId,
        created_at: new Date().toISOString()
      };

      // Buscar configuração do criador para verificar hideHistoryFromVisitors (usar estado atual)
      const isVisitor = !user || user.id !== creatorId;

      // Adicionar mensagem otimisticamente (instantâneo)
      setMessages(prev => {
        const next = [...prev, optimistic];
        // Se é visitante com histórico oculto, manter apenas as últimas 3 mensagens
        if (isVisitor && hideHistoryFromVisitors) {
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
          user_id: creatorId // All messages go to creator's chat
        });

      if (error) {
        console.error('Error sending message to creator:', error);
        // Rollback otimística
        setMessages(prev => prev.filter(m => m.id !== newId));
        toast.error('❌ Erro ao enviar mensagem');
        return false;
      }
      
      console.log('✅ Message sent successfully to creator chat');
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
        .eq('id', messageId)
        .eq('user_id', creatorId); // Only update creator's messages

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

  return { 
    messages, 
    sendMessage, 
    updateMessageSpeech,
    isLoading,
    error
  };
};