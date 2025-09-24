import { useState, useEffect } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useGoogleAuth();

  const checkSubscription = async () => {
    if (!user) {
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async (planId: string, stripeProductId: string) => {
    try {
      console.log('Creating checkout for:', { planId, stripeProductId });
      
      const session = await supabase.auth.getSession();
      
      // For free plan, allow guest checkout with a default email
      if (planId === 'free' && !user) {
        console.log('Creating guest checkout for free plan');
        
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            planId, 
            stripeProductId,
            guestEmail: 'guest@dreamlink.app' // Default email for guest checkout
          },
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token || ''}`,
          },
        });

        if (error) {
          console.error('Guest checkout error:', error);
          throw error;
        }

        if (!data?.url) {
          throw new Error('No checkout URL returned');
        }

        console.log('Redirecting to guest checkout:', data.url);
        window.location.href = data.url;
        return;
      }
      
      // For other plans, require authentication
      if (!user) {
        throw new Error('User must be logged in to subscribe');
      }
      
      if (!session.data.session?.access_token) {
        throw new Error('No valid session found');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, stripeProductId },
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('Redirecting to checkout:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      throw new Error('User must be logged in to manage subscription');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  // Check subscription when user changes
  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh subscription status periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('🔄 Periodic subscription check...');
      checkSubscription();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Check subscription when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('🔄 Page visible, checking subscription...');
        checkSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  return {
    ...subscriptionData,
    isLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isLoggedIn: !!user,
  };
};