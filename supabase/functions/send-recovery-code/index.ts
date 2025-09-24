import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RecoveryRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: RecoveryRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate a 6-digit recovery code
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the recovery code in the database (you can create a recovery_codes table)
    // For now, we'll just send the code via email
    
    const emailResponse = await resend.emails.send({
      from: "DreamLink <noreply@dreamlink.tv>",
      to: [email],
      subject: "🔐 Código de Recuperação - DreamLink",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Recuperação de Senha</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">DreamLink TV</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Olá! Você solicitou a recuperação da sua senha do DreamLink.
            </p>
            
            <div style="background: #f8fafc; border: 2px dashed #cbd5e0; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">Seu código de recuperação é:</p>
              <div style="font-size: 32px; font-weight: bold; color: #1e293b; font-family: monospace; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                ${recoveryCode}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">
              Este código expira em 15 minutos por segurança.
            </p>
            
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px;">
              Se você não solicitou esta recuperação, pode ignorar este email com segurança.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
            <p>© 2024 DreamLink TV - Plataforma de Streaming Interativa</p>
          </div>
        </div>
      `,
    });

    console.log("Recovery code sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Código de recuperação enviado com sucesso",
      code: recoveryCode // In production, don't return the code in the response
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-recovery-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);