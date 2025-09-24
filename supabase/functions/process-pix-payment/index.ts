import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import mercadopago from 'https://esm.sh/mercadopago@1.5.13';

// Permite requisições de outras origens
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configure o Mercado Pago com sua chave de acesso
// A chave deve ser armazenada como um segredo no Supabase para segurança
// Ex: `supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=<sua_chave>`
const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;

// Configure o SDK do Mercado Pago
mercadopago.configure({
    access_token: MERCADO_PAGO_ACCESS_TOKEN,
});

serve(async (req) => {
    // Lidar com requisições OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { transactionAmount, description, email } = await req.json();

        // 1. Validação dos campos obrigatórios
        if (!transactionAmount || !description || !email) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando: transactionAmount, description e email.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Validação do valor da transação
        const amount = parseFloat(transactionAmount);
        if (isNaN(amount) || amount <= 0) {
            return new Response(JSON.stringify({ error: 'Valor da transação deve ser um número positivo válido.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (amount < 1) {
            return new Response(JSON.stringify({ error: 'Valor mínimo para PIX é R$ 1,00.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Verificar se o token do Mercado Pago está configurado
        if (!MERCADO_PAGO_ACCESS_TOKEN) {
            return new Response(JSON.stringify({ error: 'Configuração de pagamento não encontrada.' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 4. Crie o objeto de pagamento para a API do Mercado Pago (para PIX)
        const paymentData = {
            transaction_amount: amount,
            description: description,
            payment_method_id: 'pix',
            payer: {
                email: email,
            },
        };

        console.log('Criando pagamento PIX:', paymentData);

        // 5. Crie o pagamento usando o SDK do Mercado Pago
        const payment = await mercadopago.payments.create(paymentData);

        console.log('Resposta do Mercado Pago:', payment);

        // 6. Se a transação for bem-sucedida, extraia os dados do Pix
        if (payment && payment.body && payment.body.point_of_interaction) {
            const qrCodeImage = payment.body.point_of_interaction.transaction_data.qr_code_base64;
            const brCode = payment.body.point_of_interaction.transaction_data.qr_code;

            return new Response(JSON.stringify({
                message: 'Pagamento Pix gerado com sucesso.',
                qrCodeImage: `data:image/jpeg;base64,${qrCodeImage}`, // Retorna o QR Code como URL de dados
                brCode: brCode, // Retorna o código copia e cola
                status: payment.body.status,
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } else {
            // Se a resposta do Mercado Pago não tiver os dados do Pix
            console.error('Resposta inesperada do Mercado Pago:', payment);
            throw new Error('Não foi possível gerar os dados do Pix.');
        }

    } catch (error) {
        console.error('Erro ao processar o pagamento Pix:', error);
        
        // Tratar erros específicos do Mercado Pago
        if (error.message && error.message.includes('validation_error')) {
            return new Response(JSON.stringify({
                error: 'Dados de pagamento inválidos',
                details: error.message,
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (error.message && error.message.includes('unauthorized')) {
            return new Response(JSON.stringify({
                error: 'Erro de configuração de pagamento',
                details: 'Token de acesso inválido',
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            error: 'Erro interno do servidor',
            details: error.message,
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});