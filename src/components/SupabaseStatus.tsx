import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, AlertCircle, RotateCcw, LogIn, Plus } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { toast } from 'sonner';
export const SupabaseStatus = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [creditInput, setCreditInput] = useState('');
  const {
    user,
    signOut
  } = useGoogleAuth();
  const {
    addCredits
  } = useUserCredits();
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        const {
          data,
          error
        } = await supabase.from('messages').select('count').limit(1);
        if (error) {
          console.error('Supabase connection error:', error);
          setStatus('disconnected');
        } else {
          setStatus('connected');
        }
        setLastCheck(new Date());
      } catch (err) {
        console.error('Unexpected connection error:', err);
        setStatus('disconnected');
        setLastCheck(new Date());
      }
    };

    // Check connection immediately
    checkConnection();

    // Check connection every 5 minutes instead of 30 seconds to reduce UI instability
    const interval = setInterval(checkConnection, 300000);
    return () => clearInterval(interval);
  }, []);
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
    }
  };
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'checking':
        return 'Verificando...';
    }
  };
  const handleReset = async () => {
    try {
      await signOut();
      toast.success('🔄 Resetado para modo padrão');
    } catch (error) {
      console.error('Error resetting:', error);
      toast.error('❌ Erro ao resetar conta');
    }
  };
  const handleAddCredits = () => {
    addCredits(100);
    toast.success('💰 +100 créditos adicionados! (Teste)');
  };
  const handleCreditInputChange = (value: string) => {
    setCreditInput(value);
    if (value === '100') {
      addCredits(100);
      toast.success('💰 +100 créditos adicionados!');
      setCreditInput('');
    }
  };
  return null;
};