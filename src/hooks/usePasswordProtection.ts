
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { toast } from 'sonner';

interface PasswordProtectionState {
  masterPassword: string;
  isLocked: boolean;
  hasPassword: boolean;
  autoLockDisabled: boolean;
  autoLockMinutes: number;
  timeRemaining: number;
  isTimerActive: boolean;
}

export const usePasswordProtection = () => {
  const { user, isGuest } = useGoogleAuth();
  const [state, setState] = useState<PasswordProtectionState>({
    masterPassword: '',
    isLocked: false,
    hasPassword: false,
    autoLockDisabled: false,
    autoLockMinutes: 30,
    timeRemaining: 0,
    isTimerActive: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar senha do usuário do banco
  useEffect(() => {
    const loadUserPassword = async () => {
      if (!user) {
        // Para usuários não logados, usar localStorage local
        const guestPassword = localStorage.getItem('guest_password');
        const guestHasPassword = localStorage.getItem('guest_has_password') === 'true';
        const guestIsLocked = localStorage.getItem('guest_is_locked') === 'true';
        const guestAutoLockDisabled = localStorage.getItem('guest_auto_lock_disabled') === 'true';
        
        const guestAutoLockMinutes = parseInt(localStorage.getItem('guest_auto_lock_minutes') || '30');
        
        setState({
          masterPassword: guestPassword || '',
          hasPassword: guestHasPassword,
          isLocked: guestIsLocked,
          autoLockDisabled: guestAutoLockDisabled,
          autoLockMinutes: guestAutoLockMinutes,
          timeRemaining: 0,
          isTimerActive: false
        });
        setIsLoading(false);
        return;
      }

       try {
        // Para usuários logados, carregar do banco
        const { data, error } = await supabase
          .from('subscriptions')
          .select('lock_password_hash, auto_lock_minutes, auto_lock_disabled')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar senha:', error);
          setIsLoading(false);
          return;
        }

        if (data?.lock_password_hash) {
          setState(prev => ({
            ...prev,
            masterPassword: data.lock_password_hash,
            hasPassword: true,
            autoLockDisabled: data.auto_lock_disabled || false,
            isLocked: data.auto_lock_disabled ? false : true,
            autoLockMinutes: data.auto_lock_minutes || 30
          }));
          
          console.log('🔧 Auto-lock carregado do banco:', data.auto_lock_minutes, 'Disabled:', data.auto_lock_disabled);
        } else {
          // Mesmo sem senha, carregar configuração de auto-lock
          const savedAutoLockMinutes = data?.auto_lock_minutes || 30;
          const savedAutoLockDisabled = data?.auto_lock_disabled || false;
          setState(prev => ({
            ...prev,
            masterPassword: '',
            hasPassword: false,
            isLocked: false,
            autoLockDisabled: savedAutoLockDisabled,
            autoLockMinutes: savedAutoLockMinutes
          }));
          
          console.log('🔧 Auto-lock carregado sem senha:', savedAutoLockMinutes, 'Disabled:', savedAutoLockDisabled);
        }
      } catch (err) {
        console.error('Erro ao carregar configuração de senha:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPassword();
  }, [user]);

  // Limpar dados quando usuário muda
  useEffect(() => {
    const handleUserDataIsolation = () => {
      setState({
        masterPassword: '',
        isLocked: false,
        hasPassword: false,
        autoLockDisabled: false,
        autoLockMinutes: 30,
        timeRemaining: 0,
        isTimerActive: false
      });
      setIsLoading(true);
    };

    window.addEventListener('user-data-isolation', handleUserDataIsolation);
    return () => window.removeEventListener('user-data-isolation', handleUserDataIsolation);
  }, []);

  // Timer automático para bloqueio
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.isTimerActive && state.timeRemaining > 0 && !state.autoLockDisabled && !state.isLocked) {
      intervalId = setInterval(() => {
        setState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            // Tempo esgotado, bloquear automaticamente
            if (!user) {
              localStorage.setItem('guest_is_locked', 'true');
            }
            toast.warning('🔒 Bloqueio automático ativado por inatividade!');
            return {
              ...prev,
              isLocked: true,
              timeRemaining: 0,
              isTimerActive: false
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isTimerActive, state.timeRemaining, state.autoLockDisabled, state.isLocked, user]);

  // Detecção de atividade do usuário para resetar timer
  useEffect(() => {
    if (!state.hasPassword || state.isLocked || state.autoLockDisabled || !state.isTimerActive) {
      return;
    }

    const resetTimer = () => {
      setState(prev => ({
        ...prev,
        timeRemaining: prev.autoLockMinutes * 60
      }));
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [state.hasPassword, state.isLocked, state.autoLockDisabled, state.isTimerActive, state.autoLockMinutes]);

  const setPassword = useCallback(async (password: string, confirmPassword: string, autoLockMinutes?: number) => {
    if (password.length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres');
    }
    
    if (password !== confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    try {
      if (user) {
        // Para usuários logados, salvar no banco
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            lock_password_hash: password,
            auto_lock_minutes: autoLockMinutes || 30,
            plan: 'free',
            status: 'active'
          });

        if (error) {
          console.error('Erro ao salvar senha:', error);
          throw new Error('Erro ao salvar senha no servidor');
        }
        
        toast.success('🔐 Senha definida e sincronizada!');
      } else {
        // Para usuários não logados, salvar no localStorage
        localStorage.setItem('guest_password', password);
        localStorage.setItem('guest_has_password', 'true');
        localStorage.setItem('guest_is_locked', 'true');
        localStorage.setItem('guest_auto_lock_minutes', (autoLockMinutes || 30).toString());
        
        toast.success('🔐 Senha definida localmente!');
      }

        setState(prev => ({
          ...prev,
          masterPassword: password,
          hasPassword: true,
          isLocked: false,
          autoLockMinutes: autoLockMinutes || prev.autoLockMinutes,
          timeRemaining: (autoLockMinutes || prev.autoLockMinutes) * 60,
          isTimerActive: !prev.autoLockDisabled
        }));
    } catch (error) {
      throw error;
    }
  }, [user]);

  const verifyPassword = useCallback((inputPassword: string) => {
    if (inputPassword === state.masterPassword) {
      setState(prev => ({ 
        ...prev, 
        isLocked: false,
        timeRemaining: prev.autoLockMinutes * 60,
        isTimerActive: true
      }));
      return true;
    }
    return false;
  }, [state.masterPassword]);

  const toggleLock = useCallback(() => {
    const newLockedState = !state.isLocked;
    
    console.log('🔒 Toggle Lock called:', {
      currentState: state.isLocked,
      newState: newLockedState,
      hasPassword: state.hasPassword,
      autoLockDisabled: state.autoLockDisabled
    });
    
    if (!user) {
      // Para usuários não logados, salvar estado no localStorage
      localStorage.setItem('guest_is_locked', newLockedState.toString());
    }
    
    setState(prev => ({ ...prev, isLocked: newLockedState }));
    
    // Adicionar feedback visual com toast
    toast.info(newLockedState ? "🔒 Sistema bloqueado!" : "🔓 Sistema desbloqueado!");
  }, [state.isLocked, state.autoLockDisabled, user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string, confirmPassword: string, autoLockMinutes?: number) => {
    if (currentPassword !== state.masterPassword) {
      throw new Error('Senha atual incorreta');
    }
    
    if (newPassword.length < 4) {
      throw new Error('A nova senha deve ter pelo menos 4 caracteres');
    }
    
    if (newPassword !== confirmPassword) {
      throw new Error('As novas senhas não coincidem');
    }

    try {
      if (user) {
        // Para usuários logados, atualizar no banco
        const { error } = await supabase
          .from('subscriptions')
          .update({
            lock_password_hash: newPassword,
            auto_lock_minutes: autoLockMinutes || state.autoLockMinutes,
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao alterar senha:', error);
          throw new Error('Erro ao alterar senha no servidor');
        }
        
        toast.success('🔄 Senha alterada e sincronizada!');
      } else {
        // Para usuários não logados, atualizar no localStorage
        localStorage.setItem('guest_password', newPassword);
        localStorage.setItem('guest_auto_lock_minutes', (autoLockMinutes || state.autoLockMinutes).toString());
        
        toast.success('🔄 Senha alterada localmente!');
      }

      setState(prev => ({
        ...prev,
        masterPassword: newPassword,
        hasPassword: true,
        isLocked: false,
        autoLockMinutes: autoLockMinutes || prev.autoLockMinutes,
        timeRemaining: (autoLockMinutes || prev.autoLockMinutes) * 60,
        isTimerActive: !prev.autoLockDisabled
      }));
    } catch (error) {
      throw error;
    }
  }, [user, state.masterPassword, state.autoLockMinutes]);

  const setAutoLockTime = useCallback(async (autoLockMinutes: number) => {
    console.log('🔧 Salvando auto-lock time:', autoLockMinutes);
    
    try {
      if (user) {
        // Para usuários logados, salvar no banco
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            auto_lock_minutes: autoLockMinutes,
            plan: 'free',
            status: 'active'
          });

        if (error) {
          console.error('Erro ao salvar tempo de auto-lock:', error);
          throw new Error('Erro ao salvar configuração no servidor');
        }
        
        // Formatação da mensagem baseada no tempo
        const formatTime = (minutes: number) => {
          if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return `${seconds} segundos`;
          } else if (minutes < 60) {
            return `${minutes} minutos`;
          } else {
            const hours = Math.round(minutes / 60);
            return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
          }
        };
        
        toast.success(`⏱️ Tempo de bloqueio definido para ${formatTime(autoLockMinutes)}!`);
      } else {
        // Para usuários não logados, salvar no localStorage
        localStorage.setItem('guest_auto_lock_minutes', autoLockMinutes.toString());
        
        const formatTime = (minutes: number) => {
          if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return `${seconds} segundos`;
          } else if (minutes < 60) {
            return `${minutes} minutos`;
          } else {
            const hours = Math.round(minutes / 60);
            return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
          }
        };
        
        toast.success(`⏱️ Tempo de bloqueio definido para ${formatTime(autoLockMinutes)}!`);
      }

      setState(prev => ({
        ...prev,
        autoLockMinutes,
        timeRemaining: prev.hasPassword ? Math.round(autoLockMinutes * 60) : 0,
        isTimerActive: prev.hasPassword && !prev.autoLockDisabled && !prev.isLocked && autoLockMinutes > 0
      }));
    } catch (error) {
      throw error;
    }
  }, [user]);

  const setAutoLockDisabled = useCallback(async (disabled: boolean) => {
    try {
      if (user) {
        // Para usuários logados, salvar no banco
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            auto_lock_disabled: disabled,
            plan: 'free',
            status: 'active'
          });

        if (error) {
          console.error('Erro ao salvar configuração de auto-lock:', error);
          toast.error('❌ Erro ao salvar configuração');
          return;
        }
        
        toast.success(disabled ? '🔓 Auto-lock desativado e salvo!' : '🔒 Auto-lock ativado e salvo!');
      } else {
        // Para usuários não logados, salvar no localStorage
        localStorage.setItem('guest_auto_lock_disabled', disabled.toString());
        toast.success(disabled ? '🔓 Auto-lock desativado!' : '🔒 Auto-lock ativado!');
      }
      
      setState(prev => ({ 
        ...prev, 
        autoLockDisabled: disabled,
        // Se estamos desabilitando auto-lock, parar o timer
        isTimerActive: disabled ? false : (prev.hasPassword && !prev.isLocked),
        // Se estamos desabilitando auto-lock e está locked, desbloquear
        isLocked: disabled ? false : prev.isLocked
      }));
    } catch (error) {
      console.error('Erro ao configurar auto-lock:', error);
      toast.error('❌ Erro ao salvar configuração');
    }
  }, [user]);

  const removePassword = useCallback(async () => {
    try {
      if (user) {
        // Para usuários logados, remover do banco
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            lock_password_hash: null,
            auto_lock_minutes: 30 
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao remover senha:', error);
          toast.error('❌ Erro ao remover senha do servidor');
          return;
        }
        
        toast.success('🔓 Senha removida e sincronizada!');
      } else {
        // Para usuários não logados, remover do localStorage
        localStorage.removeItem('guest_password');
        localStorage.removeItem('guest_has_password');
        localStorage.removeItem('guest_is_locked');
        localStorage.removeItem('guest_auto_lock_minutes');
        
        toast.success('🔓 Senha removida localmente!');
      }

      setState(prev => ({
        masterPassword: '',
        isLocked: false,
        hasPassword: false,
        autoLockDisabled: prev.autoLockDisabled,
        autoLockMinutes: prev.autoLockMinutes,
        timeRemaining: 0,
        isTimerActive: false
      }));
    } catch (error) {
      console.error('Erro ao remover senha:', error);
      toast.error('❌ Erro ao remover senha');
    }
  }, [user]);

  const playAudio = useCallback((text: string) => {
    if (!text) return;
    
    console.log('Tentando reproduzir áudio para:', text);
    
    // Usando Web Speech API para texto-para-fala
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        console.log('Iniciando reprodução de áudio');
      };
      
      utterance.onend = () => {
        console.log('Áudio finalizado');
      };
      
      utterance.onerror = (event) => {
        console.error('Erro no áudio:', event.error);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis não disponível neste navegador');
    }
  }, []);

  return {
    ...state,
    isLoading,
    setPassword,
    verifyPassword,
    toggleLock,
    removePassword,
    playAudio,
    setAutoLockDisabled,
    setAutoLockTime,
    changePassword
  };
};
