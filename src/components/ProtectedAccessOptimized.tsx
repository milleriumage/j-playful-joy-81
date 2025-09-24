import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccessState {
  hasAccess: boolean | null;
  userId: string | null;
  isChecking: boolean;
  lastCheck: number;
}

export function ProtectedAccessOptimized({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessState>({
    hasAccess: null,
    userId: null,
    isChecking: true,
    lastCheck: 0
  });
  
  const realtimeChannelRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleAccessDenied = useCallback(() => {
    setState(prev => ({ ...prev, hasAccess: false, isChecking: false }));
    toast.error('❌ Acesso negado. Redirecionando...', { duration: 3000 });
    
    // Redirecionamento suave sem reload forçado
    timeoutRef.current = setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }, []);

  const verifyAccess = useCallback(async (userUid: string) => {
    setState(prev => ({ ...prev, isChecking: true }));
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, acesso')
        .eq('user_id', userUid)
        .single();

      if (error || !data?.acesso) {
        console.warn('Acesso negado:', { error, data });
        handleAccessDenied();
      } else {
        setState(prev => ({ 
          ...prev, 
          hasAccess: true, 
          isChecking: false,
          lastCheck: Date.now()
        }));
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      handleAccessDenied();
    }
  }, [handleAccessDenied]);

  // Verificação inicial otimizada
  useEffect(() => {
    let mounted = true;

    const initialCheck = async () => {
      try {
        const { data: userData, error } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (error || !userData.user) {
          setState(prev => ({ ...prev, hasAccess: false, isChecking: false }));
          return;
        }

        const userUid = userData.user.id;
        setState(prev => ({ ...prev, userId: userUid }));
        
        await verifyAccess(userUid);
      } catch (error) {
        if (mounted) {
          console.error('Erro na verificação inicial:', error);
          setState(prev => ({ ...prev, hasAccess: false, isChecking: false }));
        }
      }
    };

    initialCheck();
    
    return () => {
      mounted = false;
    };
  }, [verifyAccess]);

  // Realtime otimizado - apenas quando necessário
  useEffect(() => {
    if (!state.userId || state.hasAccess === false) return;

    const channel = supabase
      .channel(`user-access-${state.userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'usuarios',
          filter: `user_id=eq.${state.userId}`
        },
        (payload) => {
          const newAccess = payload.new?.acesso;
          if (typeof newAccess === 'boolean') {
            if (!newAccess) {
              handleAccessDenied();
            } else {
              setState(prev => ({ ...prev, hasAccess: true }));
            }
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [state.userId, state.hasAccess, handleAccessDenied]);

  // Cleanup geral
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, []);

  // Loading state otimizado
  if (state.isChecking || state.hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">⏳ Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Access denied state otimizado
  if (!state.hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}