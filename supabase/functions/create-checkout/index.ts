import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { planId, stripeProductId, guestEmail } = await req.json();
    logStep("Received parameters", { planId, stripeProductId, guestEmail });
    
    if (!stripeProductId) {
      throw new Error("Stripe Product ID is required");
    }
    
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let userEmail = guestEmail;
    
    // For free plan, allow guest checkout
    if (planId === 'free' && guestEmail) {
      logStep("Processing guest checkout for free plan", { guestEmail });
      userEmail = guestEmail;
    } else {
      // For other plans, require authentication
      if (!authHeader) throw new Error("No authorization header provided");
      
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      user = userData.user;
      if (!user?.email) throw new Error("User not authenticated or email not available");
      logStep("User authenticated", { userId: user.id, email: user.email });
      userEmail = user.email;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Get product prices from Stripe
    logStep("Fetching prices for product", { stripeProductId });
    const prices = await stripe.prices.list({
      product: stripeProductId,
      active: true,
      recurring: { interval: 'month' },
      limit: 1,
    });

    if (prices.data.length === 0) {
      logStep("No prices found", { stripeProductId });
      throw new Error(`No active monthly price found for product ${stripeProductId}`);
    }

    const price = prices.data[0];
    logStep("Found price", { priceId: price.id, amount: price.unit_amount });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/?subscription_success=true&plan=${planId}`,
      cancel_url: `${req.headers.get("origin")}/?subscription_canceled=true`,
      metadata: {
        user_id: user?.id || 'guest',
        plan_id: planId,
        guest_email: planId === 'free' && guestEmail ? guestEmail : undefined,
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});