import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Plan configurations
const getPlanConfig = (tier: string) => {
  const configs = {
    'Basic': {
      monthlyCredits: 5000,
      bonusCredits: 1000,
      imageSlots: 10,
      videoSlots: 5
    },
    'Premium': { // VIP Plan
      monthlyCredits: 8300,
      bonusCredits: 1812,
      imageSlots: 999999, // Infinite slots
      videoSlots: 999999  // Infinite slots
    },
    'Enterprise': {
      monthlyCredits: 15000,
      bonusCredits: 3000,
      imageSlots: 999999,
      videoSlots: 999999
    }
  };
  return configs[tier as keyof typeof configs] || null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Get product to determine tier
      const lineItem = subscription.items.data[0];
      const price = await stripe.prices.retrieve(lineItem.price.id);
      const product = await stripe.products.retrieve(price.product as string);
      
      // Map product IDs to tiers
      const productTierMap: { [key: string]: string } = {
        'prod_SkHR3k5moylM8t': 'Basic',      // PRO plan
        'prod_SkHY1XdCaL1NZY': 'Premium',   // VIP plan
        'prod_SkHcmX6aKWG7yi': 'Enterprise' // Future enterprise plan
      };
      
      subscriptionTier = productTierMap[product.id] || 'Basic';
      logStep("Determined subscription tier", { productId: product.id, subscriptionTier });

      // Check if this is a new subscription that needs credit/slot allocation
      const { data: existingSubscriber } = await supabaseClient
        .from("subscribers")
        .select("subscription_tier, updated_at")
        .eq("user_id", user.id)
        .single();

      // Apply credits and slots if tier changed or it's a new subscription
      if (!existingSubscriber || existingSubscriber.subscription_tier !== subscriptionTier) {
        logStep("New subscription or tier change detected, applying benefits", { 
          oldTier: existingSubscriber?.subscription_tier,
          newTier: subscriptionTier 
        });
        
        const planConfig = getPlanConfig(subscriptionTier);
        if (planConfig) {
          // Apply credits to profile
          const totalCreditsToAdd = planConfig.monthlyCredits + planConfig.bonusCredits;
          
          const { data: currentProfile } = await supabaseClient
            .from('profiles')
            .select('credits')
            .eq('user_id', user.id)
            .single();

          const currentCredits = currentProfile?.credits || 0;
          const newTotalCredits = currentCredits + totalCreditsToAdd;

          await supabaseClient
            .from('profiles')
            .update({ 
              credits: newTotalCredits,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          // Apply slots to subscription table
          await supabaseClient
            .from('subscriptions')
            .upsert({
              user_id: user.id,
              plan: subscriptionTier.toLowerCase(),
              status: 'active',
              credits: newTotalCredits,
              image_slots: planConfig.imageSlots,
              video_slots: planConfig.videoSlots,
              updated_at: new Date().toISOString()
            });

          // Create notification
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'subscription_activated',
              title: `🎉 Plano ${subscriptionTier} Ativado!`,
              message: `Você recebeu ${totalCreditsToAdd} créditos (${planConfig.monthlyCredits} + ${planConfig.bonusCredits} bônus) e ${planConfig.imageSlots === 999999 ? 'slots infinitos' : `${planConfig.imageSlots + planConfig.videoSlots} slots`}`,
              credits_amount: totalCreditsToAdd
            });

          logStep("Applied subscription benefits", { 
            creditsAdded: totalCreditsToAdd,
            imageSlots: planConfig.imageSlots,
            videoSlots: planConfig.videoSlots
          });
        }
      }
    } else {
      logStep("No active subscription found");
      
      // Check if user had a subscription that was cancelled
      const { data: existingSubscriber } = await supabaseClient
        .from("subscribers")
        .select("subscription_tier, subscription_end")
        .eq("user_id", user.id)
        .single();

      if (existingSubscriber?.subscription_tier && existingSubscriber.subscription_end) {
        const subscriptionEndDate = new Date(existingSubscriber.subscription_end);
        const now = new Date();
        
        // If subscription expired, reset slots to free tier but keep credits
        if (subscriptionEndDate <= now) {
          logStep("Subscription expired, resetting slots to free tier");
          
          await supabaseClient
            .from('subscriptions')
            .upsert({
              user_id: user.id,
              plan: 'free',
              status: 'cancelled',
              image_slots: 2,
              video_slots: 0,
              updated_at: new Date().toISOString()
            });

          await supabaseClient
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'subscription_expired',
              title: '⏰ Plano Expirado',
              message: 'Seu plano expirou. Você mantém seus créditos mas os slots foram reduzidos ao plano gratuito.',
              credits_amount: 0
            });
        }
      }
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});