import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';

export interface TrialStatus {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
}

export const useTrialStatus = () => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isTrialActive: false,
    isTrialExpired: false,
    daysRemaining: 0,
    trialEndDate: null,
  });
  const { subscribed, isLoggedIn } = useSubscription();

  const checkTrialStatus = async () => {
    if (!isLoggedIn || subscribed) {
      setTrialStatus({
        isTrialActive: false,
        isTrialExpired: false,
        daysRemaining: 0,
        trialEndDate: null,
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Check user creation date
      const userCreatedAt = new Date(user.user.created_at);
      const trialEndDate = new Date(userCreatedAt.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      const now = new Date();
      
      const timeDiff = trialEndDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      const isTrialActive = daysRemaining > 0;
      const isTrialExpired = daysRemaining <= 0;

      setTrialStatus({
        isTrialActive,
        isTrialExpired,
        daysRemaining: Math.max(0, daysRemaining),
        trialEndDate,
      });
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  useEffect(() => {
    checkTrialStatus();
    
    // Check trial status every 6 hours to reduce unnecessary checks
    const interval = setInterval(checkTrialStatus, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, subscribed]);

  return {
    ...trialStatus,
    checkTrialStatus,
  };
};