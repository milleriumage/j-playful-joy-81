import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  creator_id: string;
  plan_type: 'general' | 'custom';
  name: string | null;
  duration_days: number;
  total_credits: number;
  credits_per_day: number;
  max_photos: number;
  max_videos: number;
  current_photos: number;
  current_videos: number;
  status: 'draft' | 'pending_media' | 'active' | 'disabled';
  price: number;
  description: string | null;
  motivational_message: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  creator_id: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  credits_remaining: number;
  last_credit_grant: string;
}

export const useCreatorSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribers, setSubscribers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Simulate loading since tables don't exist yet
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlans([]);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar planos de assinatura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      // Simulate loading since tables don't exist yet
      setSubscribers([]);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  const createOrUpdatePlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPlan: SubscriptionPlan = {
        id: crypto.randomUUID(),
        creator_id: 'current-user-id',
        plan_type: planData.plan_type || 'general',
        name: planData.name || null,
        duration_days: planData.duration_days || 30,
        total_credits: planData.total_credits || 100,
        credits_per_day: planData.credits_per_day || 3,
        max_photos: planData.max_photos || 0,
        max_videos: planData.max_videos || 0,
        current_photos: 0,
        current_videos: 0,
        status: planData.status || 'draft',
        price: planData.price || 0,
        description: planData.description || null,
        motivational_message: planData.motivational_message || "Deixe conteúdo gratuito para atrair novos seguidores!",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (planData.id) {
        setPlans(prev => prev.map(p => p.id === planData.id ? { ...newPlan, id: planData.id } : p));
      } else {
        setPlans(prev => [newPlan, ...prev]);
      }

      toast({
        title: "Sucesso",
        description: planData.id ? "Plano atualizado com sucesso!" : "Plano criado com sucesso!",
      });

      return true;
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activatePlan = async (planId: string) => {
    try {
      setPlans(prev => prev.map(p => 
        p.id === planId ? { ...p, status: 'active' as const } : p
      ));

      toast({
        title: "Sucesso",
        description: "Plano ativado com sucesso!",
      });
    } catch (error) {
      console.error('Error activating plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao ativar plano",
        variant: "destructive",
      });
    }
  };

  const deactivatePlan = async (planId: string) => {
    try {
      setPlans(prev => prev.map(p => 
        p.id === planId ? { ...p, status: 'disabled' as const } : p
      ));

      toast({
        title: "Sucesso",
        description: "Plano desativado. Assinantes atuais mantêm acesso até expirar.",
      });
    } catch (error) {
      console.error('Error deactivating plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao desativar plano",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchSubscribers();
  }, []);

  return {
    plans,
    subscribers,
    loading,
    createOrUpdatePlan,
    activatePlan,
    deactivatePlan,
    fetchPlans,
    fetchSubscribers,
  };
};