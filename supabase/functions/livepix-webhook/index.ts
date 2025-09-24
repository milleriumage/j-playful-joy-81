import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LivePixWebhookPayload {
  payment_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  amount: number;
  customer_email?: string;
  external_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookData: LivePixWebhookPayload = await req.json();
    
    console.log('🔔 LivePix webhook received:', {
      payment_id: webhookData.payment_id,
      status: webhookData.status,
      amount: webhookData.amount,
    });

    // Validate required fields
    if (!webhookData.payment_id || !webhookData.status || !webhookData.amount) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: payment_id, status, amount' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only process approved payments
    if (webhookData.status !== 'approved') {
      console.log(`⏸️ Payment ${webhookData.payment_id} status is ${webhookData.status}, skipping credit update`);
      return new Response(JSON.stringify({ 
        message: 'Payment not approved, no action taken',
        payment_id: webhookData.payment_id,
        status: webhookData.status
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate credits: R$ 1,00 = 10 credits
    const CONVERSION_RATE = 10;
    const creditsToAdd = Math.floor(webhookData.amount * CONVERSION_RATE);

    console.log('💰 Calculating credits:', {
      amount: webhookData.amount,
      conversion_rate: CONVERSION_RATE,
      credits_to_add: creditsToAdd
    });

    // Find user by email if provided, otherwise use external_id or payment_id
    let userId = null;
    
    if (webhookData.customer_email) {
      const { data: userData, error: userError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', webhookData.customer_email)
        .single();

      if (userError) {
        console.error('❌ Error finding user by email:', userError);
      } else {
        userId = userData?.id;
      }
    }

    // If no user found by email, try to find by external_id or payment tracking
    if (!userId && webhookData.external_id) {
      // Here you could implement a payment tracking table lookup
      console.log('🔍 Attempting to find user by external_id:', webhookData.external_id);
    }

    if (!userId) {
      console.error('❌ Unable to identify user for payment:', webhookData.payment_id);
      return new Response(JSON.stringify({ 
        error: 'Unable to identify user for credit update',
        payment_id: webhookData.payment_id
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update user credits
    const { data: updateResult, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        credits: supabaseClient.raw(`COALESCE(credits, 0) + ${creditsToAdd}`),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('❌ Error updating user credits:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to update user credits',
        details: updateError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the payment transaction
    const { error: logError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        payment_id: webhookData.payment_id,
        user_id: userId,
        amount: webhookData.amount,
        credits_added: creditsToAdd,
        status: webhookData.status,
        provider: 'livepix',
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('⚠️ Error logging payment transaction:', logError);
      // Don't fail the webhook for logging errors
    }

    console.log('✅ Credits updated successfully:', {
      user_id: userId,
      payment_id: webhookData.payment_id,
      amount: webhookData.amount,
      credits_added: creditsToAdd
    });

    return new Response(JSON.stringify({
      message: 'Payment processed successfully',
      payment_id: webhookData.payment_id,
      user_id: userId,
      amount: webhookData.amount,
      credits_added: creditsToAdd,
      status: 'success'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ LivePix webhook error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});