import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Permite requisições de outras origens
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PIX payload generation functions
function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function generatePixPayload(value: number, pixKey: string, merchantName: string = 'DreamLink', merchantCity: string = 'Sao Paulo'): string {
  const valueStr = value.toFixed(2);
  
  // Payload format indicator
  let payload = '000201';
  
  // Merchant account information
  const pixKeyFormatted = `0014br.gov.bcb.pix01${String(pixKey.length).padStart(2, '0')}${pixKey}`;
  payload += `26${String(pixKeyFormatted.length).padStart(2, '0')}${pixKeyFormatted}`;
  
  // Merchant category code
  payload += '52040000';
  
  // Transaction currency (986 = BRL)
  payload += '5303986';
  
  // Transaction amount
  payload += `54${String(valueStr.length).padStart(2, '0')}${valueStr}`;
  
  // Country code
  payload += '5802BR';
  
  // Merchant name
  payload += `59${String(merchantName.length).padStart(2, '0')}${merchantName}`;
  
  // Merchant city
  payload += `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`;
  
  // CRC placeholder
  payload += '6304';
  
  // Calculate and append CRC
  const crcValue = crc16(payload);
  payload = payload.slice(0, -4) + '63' + '04' + crcValue;
  
  return payload;
}

function generateQRCodeUrl(pixCode: string): string {
  const encodedCode = encodeURIComponent(pixCode);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedCode}`;
}

serve(async (req) => {
  // Lidar com requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, email } = await req.json();

    console.log('Gerando PIX direto:', { amount, email });

    // 1. Validação dos campos obrigatórios
    if (!amount || !email) {
      return new Response(JSON.stringify({ 
        error: 'Campos obrigatórios faltando: amount e email.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Validação do valor da transação
    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      return new Response(JSON.stringify({ 
        error: 'Valor da transação deve ser um número positivo válido.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (transactionAmount < 1) {
      return new Response(JSON.stringify({ 
        error: 'Valor mínimo para PIX é R$ 1,00.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Usar uma chave PIX padrão (você pode personalizar)
    const pixKey = 'dreamlink@exemplo.com'; // Substitua pela sua chave PIX real
    
    // 4. Gerar o payload PIX
    const pixCode = generatePixPayload(transactionAmount, pixKey);
    const qrCodeUrl = generateQRCodeUrl(pixCode);
    
    // 5. Gerar um ID único para o pagamento
    const paymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('PIX gerado com sucesso:', {
      paymentId,
      amount: transactionAmount,
      pixCode: pixCode.substring(0, 50) + '...'
    });

    return new Response(JSON.stringify({
      message: 'Pagamento PIX gerado com sucesso.',
      paymentId: paymentId,
      status: 'pending',
      pixCode: pixCode,
      qrCodeUrl: qrCodeUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao processar o pagamento PIX:', error);

    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      details: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});