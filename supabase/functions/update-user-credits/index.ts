import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateCreditsPayload {
  user_id: string;
  credits_to_add: number;
  payment_reference?: string;
  transaction_type?: 'payment' | 'bonus' | 'refund' | 'adjustment';
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

    const { user_id, credits_to_add, payment_reference, transaction_type = 'payment' }: UpdateCreditsPayload = await req.json();

    // Validate required fields
    if (!user_id || typeof credits_to_add !== 'number') {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: user_id and credits_to_add' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (credits_to_add <= 0) {
      return new Response(JSON.stringify({ 
        error: 'Credits to add must be a positive number' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('💳 Updating user credits:', {
      user_id,
      credits_to_add,
      transaction_type,
      payment_reference
    });

    // Check if user exists
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('id, credits')
      .eq('user_id', user_id)
      .single();

    if (userError || !userData) {
      console.error('❌ User not found:', user_id);
      return new Response(JSON.stringify({ 
        error: 'User not found',
        user_id 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const currentCredits = userData.credits || 0;
    const newCredits = currentCredits + credits_to_add;

    // Update user credits
    const { data: updateResult, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
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

    // Log the credit transaction
    const { error: logError } = await supabaseClient
      .from('credit_transactions')
      .insert({
        user_id,
        amount: credits_to_add,
        transaction_type,
        payment_reference,
        previous_balance: currentCredits,
        new_balance: newCredits,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('⚠️ Error logging credit transaction:', logError);
      // Don't fail the operation for logging errors
    }

    console.log('✅ User credits updated successfully:', {
      user_id,
      previous_credits: currentCredits,
      credits_added: credits_to_add,
      new_credits: newCredits
    });

    return new Response(JSON.stringify({
      message: 'Credits updated successfully',
      user_id,
      previous_credits: currentCredits,
      credits_added: credits_to_add,
      new_credits: newCredits,
      status: 'success'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Update credits error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});