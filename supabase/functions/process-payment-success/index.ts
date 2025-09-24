import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the service role key for secure operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get credits from metadata
    const credits = parseInt(session.metadata?.credits || "0");
    const userEmail = session.metadata?.user_email || session.customer_email;
    
    if (!credits || !userEmail) {
      throw new Error("Invalid session metadata");
    }

    console.log(`Processing payment success for ${userEmail}, adding ${credits} credits`);

    // Find the user by email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find(u => u.email === userEmail);
    if (!user) {
      throw new Error("User not found");
    }

    // Get current credits from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    const currentCredits = profile?.credits || 0;
    const newTotal = currentCredits + credits;

    // Update credits in database
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        credits: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw updateError;
    }

    // Create a success notification
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'credit_purchase',
        title: '💰 Créditos Adicionados!',
        message: `${credits} créditos foram adicionados à sua conta através da compra`,
        credits_amount: credits
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    console.log(`Successfully added ${credits} credits to user ${user.id}. New total: ${newTotal}`);

    return new Response(JSON.stringify({ 
      success: true,
      creditsAdded: credits,
      newTotal: newTotal
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});