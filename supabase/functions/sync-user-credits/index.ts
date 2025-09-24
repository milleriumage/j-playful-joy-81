import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan configurations for monthly credits and slots
const getPlanConfig = (tier: string) => {
  const configs = {
    'Basic': { 
      monthlyCredits: 3112, // 1.300 + 1.812 bonus
      imageSlots: 12,
      videoSlots: 4
    },
    'Premium': { 
      monthlyCredits: 5212, // 3.400 + 1.812 bonus
      imageSlots: 40,
      videoSlots: 12
    }, 
    'Enterprise': { 
      monthlyCredits: 10112, // 8.300 + 1.812 bonus
      imageSlots: 999, // Infinite
      videoSlots: 999  // Infinite
    }
  };
  return configs[tier as keyof typeof configs] || null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Service role client for admin operations
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log(`Syncing credits for user: ${user.email}`);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No payments found for this user",
        creditsAdded: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    // Get all successful payment sessions for this customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100,
    });

    let totalCreditsFromPayments = 0;

    // Calculate total credits from successful payments
    for (const payment of paymentIntents.data) {
      if (payment.status === 'succeeded' && payment.metadata?.credits) {
        const credits = parseInt(payment.metadata.credits);
        totalCreditsFromPayments += credits;
        console.log(`Found payment: ${payment.id} - ${credits} credits`);
      }
    }

    // Also check checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
    });

    for (const session of sessions.data) {
      if (session.payment_status === 'paid' && session.metadata?.credits) {
        const credits = parseInt(session.metadata.credits);
        totalCreditsFromPayments += credits;
        console.log(`Found session: ${session.id} - ${credits} credits`);
      }
    }

    // Check for active subscription and calculate monthly credits and slots
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let monthlyCreditsFromSubscription = 0;
    let subscriptionTier = null;
    let planSlots = { imageSlots: 3, videoSlots: 1 }; // Default free plan slots

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      
      // Get product to determine tier
      const lineItem = subscription.items.data[0];
      const price = await stripe.prices.retrieve(lineItem.price.id);
      const product = await stripe.products.retrieve(price.product as string);
      
      // Map product IDs to tiers
      const productTierMap: { [key: string]: string } = {
        'prod_SkHR3k5moylM8t': 'Basic',      // Basic plan
        'prod_SkHY1XdCaL1NZY': 'Premium',   // Pro plan  
        'prod_SkHcmX6aKWG7yi': 'Enterprise' // VIP plan
      };
      
      subscriptionTier = productTierMap[product.id] || 'Basic';
      
      // Calculate monthly credits based on subscription duration
      const subscriptionStart = new Date(subscription.created * 1000);
      const now = new Date();
      const monthsActive = Math.floor((now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      const planConfig = getPlanConfig(subscriptionTier);
      if (planConfig && monthsActive >= 0) {
        // For current month + completed months
        monthlyCreditsFromSubscription = planConfig.monthlyCredits * (monthsActive + 1);
        planSlots = { imageSlots: planConfig.imageSlots, videoSlots: planConfig.videoSlots };
        console.log(`Active subscription: ${subscriptionTier} - ${monthsActive + 1} months - ${monthlyCreditsFromSubscription} credits - ${planSlots.imageSlots} image slots - ${planSlots.videoSlots} video slots`);
      }
    }

    if (totalCreditsFromPayments === 0 && monthlyCreditsFromSubscription === 0) {
      return new Response(JSON.stringify({ 
        message: "No credit purchases or active subscriptions found",
        creditsAdded: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get current credits from profile
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    const currentCredits = profile?.credits || 0;
    const baseCredits = 80; // Base credits every user starts with
    const expectedCredits = baseCredits + totalCreditsFromPayments + monthlyCreditsFromSubscription;

    console.log(`Current credits: ${currentCredits}, Expected: ${expectedCredits}, From payments: ${totalCreditsFromPayments}, From subscription: ${monthlyCreditsFromSubscription}`);

    if (currentCredits >= expectedCredits) {
      return new Response(JSON.stringify({ 
        message: "Credits are already in sync",
        creditsAdded: 0,
        currentCredits: currentCredits,
        subscription: subscriptionTier
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Add missing credits
    const creditsToAdd = expectedCredits - currentCredits;

    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({ 
        credits: expectedCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw updateError;
    }

    // Update or create subscription record with slots
    const { error: subscriptionError } = await supabaseService
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: subscriptionTier || 'free',
        status: subscriptionTier ? 'active' : 'inactive',
        credits: expectedCredits,
        image_slots: planSlots.imageSlots,
        video_slots: planSlots.videoSlots,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (subscriptionError) {
      console.error('Error updating subscription slots:', subscriptionError);
    }

    // Create a notification
    const { error: notificationError } = await supabaseService
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'credit_sync',
        title: '🔄 Créditos Sincronizados!',
        message: `${creditsToAdd} créditos foram restaurados${subscriptionTier ? ` (inclui créditos do plano ${subscriptionTier})` : ''}`,
        credits_amount: creditsToAdd
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    console.log(`Successfully synced ${creditsToAdd} credits for user ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true,
      creditsAdded: creditsToAdd,
      newTotal: expectedCredits,
      subscription: subscriptionTier,
      message: `Sincronizados ${creditsToAdd} créditos${subscriptionTier ? ` (inclui plano ${subscriptionTier})` : ''}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Credit sync error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});