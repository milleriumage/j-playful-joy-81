import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageRequest {
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subject, message }: MessageRequest = await req.json();

    console.log(`Sending message to ${email}: ${subject}`);

    const emailResponse = await resend.emails.send({
      from: "LinkchatTV <linkteam@chatlinks.link>",
      to: [email],
      subject: subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✨ LinkchatTV</h1>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">${subject}</h2>
            
            <div style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              ${message.split('\n').map(line => `<p style="margin: 0 0 10px 0;">${line}</p>`).join('')}
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
              Mensagem enviada pela plataforma LinkchatTV.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Message sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
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