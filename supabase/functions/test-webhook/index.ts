import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      return new Response(JSON.stringify({ error: 'paymentId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Mercado Pago access token
    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: 'MercadoPago token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔍 Testando pagamento: ${paymentId}`);
    
    // Fetch payment details from Mercado Pago API
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('❌ MercadoPago API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch payment details',
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentData = await paymentResponse.json();
    
    console.log('💳 Payment data:', {
      id: paymentData.id,
      status: paymentData.status,
      transaction_amount: paymentData.transaction_amount,
      payer_email: paymentData.payer?.email,
      external_reference: paymentData.external_reference,
      date_created: paymentData.date_created,
      date_approved: paymentData.date_approved
    });

    // If payment is approved, try to process it
    if (paymentData.status === 'approved') {
      console.log('✅ Payment is approved, calling webhook...');
      
      // Call the webhook function to process the payment
      const webhookPayload = {
        id: Date.now(),
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId
        }
      };

      const webhookResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify(webhookPayload)
      });

      const webhookResult = await webhookResponse.json();
      
      return new Response(JSON.stringify({
        message: 'Payment tested and processed',
        payment_data: paymentData,
        webhook_result: webhookResult
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      message: 'Payment found but not approved yet',
      payment_data: paymentData
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Test webhook error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});