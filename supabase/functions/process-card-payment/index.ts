import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

  try {
    const { 
      token, 
      transaction_amount, 
      installments, 
      payment_method_id, 
      description, 
      email,
      identification_type,
      identification_number,
      cardholder_name 
    } = await req.json();

    if (!token || !transaction_amount) {
      return new Response(
        JSON.stringify({ error: "Token e valor são obrigatórios" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Get MercadoPago access token from secrets
    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error("MercadoPago Access Token não configurado");
      return new Response(
        JSON.stringify({ error: "Token de acesso não configurado" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const API_URL = 'https://api.mercadopago.com/v1/payments';

    const payload = {
      transaction_amount: parseFloat(transaction_amount),
      token: token,
      description: description || 'Recarga de créditos - DreamLink',
      installments: parseInt(installments) || 1,
      payment_method_id: payment_method_id,
      payer: {
        email: email || 'usuario@dreamlink.pro',
        identification: {
          type: identification_type || 'CPF',
          number: identification_number || '12345678901'
        }
      }
    };

    console.log('Processando pagamento com cartão:', { 
      amount: transaction_amount, 
      installments, 
      payment_method_id 
    });

    // Generate unique idempotency key for this request
    const idempotencyKey = crypto.randomUUID();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API do MercadoPago:', errorData);
      return new Response(
        JSON.stringify({ error: `Erro da API do MercadoPago: ${JSON.stringify(errorData)}` }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status 
        }
      );
    }

    const data = await response.json();
    console.log('Resposta do MercadoPago para pagamento com cartão:', data);

    return new Response(
      JSON.stringify({ 
        paymentId: data.id,
        status: data.status,
        status_detail: data.status_detail,
        transaction_amount: data.transaction_amount,
        installments: data.installments
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao processar pagamento com cartão:', error);
    return new Response(
      JSON.stringify({ error: 'Falha ao processar o pagamento' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});