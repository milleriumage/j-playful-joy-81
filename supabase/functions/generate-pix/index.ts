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
    const { amount, email } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Valor inválido" }),
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

    // Create unique external reference to track the payment
    const externalReference = `pix_${crypto.randomUUID()}`;
    
    const payload = {
      transaction_amount: parseFloat(amount),
      description: 'Recarga de créditos - DreamLink',
      payment_method_id: 'pix',
      external_reference: externalReference,
      notification_url: 'https://lgstvoixptdcqohsxkvo.supabase.co/functions/v1/mercadopago-webhook',
      payer: {
        email: email || 'usuario@dreamlink.pro'
      }
    };

    console.log('Enviando requisição para MercadoPago:', { 
      amount, 
      email, 
      externalReference,
      notification_url: payload.notification_url 
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
    console.log('Resposta do MercadoPago:', data);

    // Extract PIX fields from MercadoPago response
    const pixCode = data.point_of_interaction?.transaction_data?.qr_code || '';
    const ticketUrl = data.point_of_interaction?.transaction_data?.ticket_url || '';
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64 || '';
    
    // Convert base64 QR code to data URL
    const qrCodeUrl = qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : '';

    return new Response(
      JSON.stringify({ 
        pixCode, // copia e cola
        ticketUrl,
        qrCodeUrl,
        paymentId: data.id,
        status: data.status,
        externalReference: externalReference,
        message: 'PIX gerado com sucesso. Créditos serão adicionados automaticamente após confirmação do pagamento.'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return new Response(
      JSON.stringify({ error: 'Falha ao gerar o PIX' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});