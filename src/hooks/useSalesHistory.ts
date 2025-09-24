import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from './useGoogleAuth';
import { toast } from 'sonner';

interface SalesHistoryItem {
  id: string;
  buyer_id: string;
  media_id: string;
  credits_amount: number;
  status: string;
  created_at: string;
  thanked: boolean;
  thank_message?: string;
  media_name?: string;
  buyer_name?: string;
}

interface EarningsStats {
  total_earned: number;
  total_withdrawn: number;
  pending_amount: number;
  last_withdrawal?: string;
  next_withdrawal_available?: string;
}

interface WithdrawalCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useSalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([]);
  const [earningsStats, setEarningsStats] = useState<EarningsStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalCountdown, setWithdrawalCountdown] = useState<WithdrawalCountdown | null>(null);
  const { user } = useGoogleAuth();

  // Countdown timer for next withdrawal
  useEffect(() => {
    if (!earningsStats?.next_withdrawal_available) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const targetTime = new Date(earningsStats.next_withdrawal_available!).getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setWithdrawalCountdown({ days, hours, minutes, seconds });
      } else {
        setWithdrawalCountdown(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [earningsStats?.next_withdrawal_available]);

  const fetchSalesHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch sales history - usando query simplificada para evitar erros de relacionamento
      const { data: sales, error: salesError } = await supabase
        .from('sales_history')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (salesError) throw salesError;

      setSalesHistory(sales || []);

      // Fetch earnings stats
      const { data: stats, error: statsError } = await supabase
        .from('creator_earnings_stats')
        .select('*')
        .eq('creator_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      setEarningsStats(stats || {
        total_earned: 0,
        total_withdrawn: 0,
        pending_amount: 0
      });

    } catch (error) {
      console.error('Error fetching sales history:', error);
      toast.error('Erro ao carregar histórico de vendas');
    } finally {
      setIsLoading(false);
    }
  };

  const sendThankYouMessage = async (saleId: string, message: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('sales_history')
        .update({
          thank_message: message,
          thanked: true,
          thanked_at: new Date().toISOString()
        })
        .eq('id', saleId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast.success('✅ Mensagem de agradecimento enviada!');
      
      // Update local state
      setSalesHistory(prev => 
        prev.map(sale => 
          sale.id === saleId 
            ? { ...sale, thanked: true, thank_message: message }
            : sale
        )
      );

    } catch (error) {
      console.error('Error sending thank you message:', error);
      toast.error('Erro ao enviar mensagem de agradecimento');
    }
  };

  const requestWithdrawal = async (amount: number) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('request_withdrawal', {
        p_creator_id: user.id,
        p_amount: amount,
        p_payment_method: 'pix',
        p_payment_details: {}
      });

      if (error) throw error;

      const result = data as any;
      if (!result?.success) {
        toast.error(result?.error || 'Erro ao solicitar saque');
        return false;
      }

      toast.success('✅ Solicitação de saque enviada!');
      await fetchSalesHistory(); // Refresh data
      return true;

    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast.error('Erro ao solicitar saque');
      return false;
    }
  };

  const trackSale = async (buyerId: string, mediaId: string, creditsAmount: number, mediaName?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('sales_history')
        .insert({
          creator_id: user.id,
          buyer_id: buyerId,
          media_id: mediaId,
          credits_amount: creditsAmount,
          status: 'completed',
          purchase_type: 'credit_purchase'
        });

      if (error) throw error;

      console.log('Sale tracked successfully');
      
      // Refresh sales history
      setTimeout(() => fetchSalesHistory(), 1000);

    } catch (error) {
      console.error('Error tracking sale:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSalesHistory();
    }
  }, [user]);

  return {
    salesHistory,
    earningsStats,
    isLoading,
    withdrawalCountdown,
    fetchSalesHistory,
    sendThankYouMessage,
    requestWithdrawal,
    trackSale
  };
};