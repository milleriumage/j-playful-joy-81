import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    // Get MercadoPago public key from secrets
    const MERCADO_PAGO_PUBLIC_KEY = Deno.env.get("MERCADO_PAGO_PUBLIC_KEY");
    
    if (!MERCADO_PAGO_PUBLIC_KEY) {
      console.error("MercadoPago Public Key não configurado");
      return new Response(
        JSON.stringify({ error: "Chave pública não configurada" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({ publicKey: MERCADO_PAGO_PUBLIC_KEY }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao buscar chave pública:', error);
    return new Response(
      JSON.stringify({ error: 'Falha ao buscar chave pública' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});