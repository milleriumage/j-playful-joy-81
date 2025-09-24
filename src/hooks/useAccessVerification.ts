import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const useAccessVerification = () => {
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("🔑 Sessão recebida:", session);
      console.log("Sessão atual:", session);
      if (error) {
        console.error('Erro ao buscar sessão:', error);
        setIsLoading(false);
        return;
      }
      setUser(session?.user ?? null);
    };

    // Configurar listener de mudanças de estado de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setUser(session?.user ?? null);
      }
    );

    getUser();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      // Verifica se há código de acesso salvo no localStorage
      const savedAccessCode = localStorage.getItem("accessCode");
      if (savedAccessCode === "4890") {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      if (!user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔍 Verificando acesso para:", user.id);

        const { data, error } = await supabase.rpc('check_email_autorizado' as any);

        console.log("📦 RPC resultado:", { data, error });

        if (error) {
          setHasAccess(false);
        } else {
          setHasAccess(Boolean(data));
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Sempre executar checkAccess, não só quando há usuário
    checkAccess();
  }, [user]);

  return { hasAccess, isLoading, user };
};