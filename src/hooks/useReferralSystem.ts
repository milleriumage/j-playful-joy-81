import { useState, useEffect } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralStats {
  referredUsersCount: number;
  vipUsersCount: number;
  totalCommission: number;
  commissionPending: number;
  commissionReleaseDate: string | null;
  isCommissionLimitReached: boolean;
}

interface PaymentSettings {
  paypal_email: string | null;
  stripe_email: string | null;
}

export const useReferralSystem = () => {
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    referredUsersCount: 0,
    vipUsersCount: 0,
    totalCommission: 0,
    commissionPending: 0,
    commissionReleaseDate: null,
    isCommissionLimitReached: false
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useGoogleAuth();

  // Buscar estatísticas de referral
  const fetchReferralStats = async () => {
    if (!user) return;

    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('creator_id', user.id);

      if (error) throw error;

      const vipUsers = referrals?.filter(r => r.is_vip_subscriber) || [];
      const totalCommission = Math.min(5, referrals?.reduce((sum, r) => sum + (Number(r.commission_earned) || 0), 0) || 0);
      const commissionPending = Math.min(5, referrals?.filter(r => !r.commission_paid).reduce((sum, r) => sum + (Number(r.commission_earned) || 0), 0) || 0);
      
      const stats = {
        referredUsersCount: referrals?.length || 0,
        vipUsersCount: vipUsers.length,
        totalCommission,
        commissionPending,
        commissionReleaseDate: referrals?.find(r => r.commission_release_date)?.commission_release_date || null,
        isCommissionLimitReached: totalCommission >= 5
      };

      setReferralStats(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de referral:', error);
    }
  };

  // Buscar configurações de pagamento
  const fetchPaymentSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('creator_payment_settings')
        .select('*')
        .eq('creator_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setPaymentSettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações de pagamento:', error);
    }
  };

  // Atualizar configurações de pagamento
  const updatePaymentSettings = async (paypalEmail: string, stripeEmail: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('creator_payment_settings')
        .upsert({
          creator_id: user.id,
          paypal_email: paypalEmail || null,
          stripe_email: stripeEmail || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await fetchPaymentSettings();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao salvar configurações');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar presente
  const sendGift = async () => {
    if (!user) return false;

    setIsLoading(true);
    try {
      // Buscar usuários cadastrados via referral deste criador
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('referred_user_id')
        .eq('creator_id', user.id);

      if (referralsError) throw referralsError;

      if (!referrals || referrals.length === 0) {
        toast.error('Você não possui usuários cadastrados via sua página');
        return false;
      }

      // Escolher usuário aleatório
      const randomIndex = Math.floor(Math.random() * referrals.length);
      const selectedUserId = referrals[randomIndex].referred_user_id;

      // Registrar o presente
      const { error: giftError } = await supabase
        .from('referral_gifts')
        .insert({
          creator_id: user.id,
          recipient_user_id: selectedUserId,
          credits_amount: 100,
          message: 'Seja bem-vindo(a)! Torne-se VIP e aproveite ainda mais.'
        });

      if (giftError) throw giftError;

      // Adicionar créditos ao usuário
      const { error: creditsError } = await supabase.rpc('add_credits', {
        p_user_id: selectedUserId,
        p_amount: 100
      });

      if (creditsError) throw creditsError;

      // Criar notificação para o usuário
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const creatorName = creatorProfile?.display_name || 'Um criador';

      await supabase
        .from('notifications')
        .insert({
          user_id: selectedUserId,
          type: 'gift_received',
          title: '🎁 BOAS-VINDAS!',
          message: `O criador ${creatorName} enviou 100 créditos para você! Seja bem-vindo(a)! Torne-se VIP e aproveite ainda mais.`,
          credits_amount: 100
        });

      return true;
    } catch (error) {
      console.error('Erro ao enviar presente:', error);
      toast.error('Erro ao enviar presente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar link de referral
  const getUserReferralLink = () => {
    if (!user) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/?ref=${user.id}`;
  };

  // Registrar novo referral
  const registerReferral = async (referredUserId: string, creatorId: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .insert({
          creator_id: creatorId,
          referred_user_id: referredUserId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao registrar referral:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchReferralStats();
      fetchPaymentSettings();
    }
  }, [user]);

  // Verificar parâmetro de referral na URL ao carregar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam && user && user.id !== refParam) {
      // Registrar referral apenas se o usuário atual não for o próprio criador
      registerReferral(user.id, refParam);
    }
  }, [user]);

  return {
    referralStats,
    paymentSettings,
    isLoading,
    updatePaymentSettings,
    sendGift,
    getUserReferralLink,
    registerReferral,
    fetchReferralStats
  };
};