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
    const { publicKey } = await req.json();
    
    if (!publicKey || typeof publicKey !== 'string') {
      return new Response(
        JSON.stringify({ error: "Public Key é obrigatória" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Validate public key format (basic validation)
    if (!publicKey.startsWith('APP_USR-')) {
      return new Response(
        JSON.stringify({ error: "Public Key deve começar com 'APP_USR-'" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // For this example, we're just logging the key
    // In a real implementation, you would store this securely
    console.log("Atualizando MercadoPago Public Key:", publicKey);
    
    // Store the public key in Deno environment or your preferred secure storage
    // This is a demonstration - in production, you'd want to store it properly
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Public Key atualizada com sucesso",
        publicKey: publicKey.substring(0, 15) + "..." // Only show first part for security
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao atualizar Public Key:', error);
    return new Response(
      JSON.stringify({ error: 'Falha ao atualizar Public Key' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});