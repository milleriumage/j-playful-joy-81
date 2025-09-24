import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { HelpCircle } from "lucide-react";
import { SendMessageDialog } from "@/components/SendMessageDialog";
import LivePixPaymentDialog from "@/components/LivePixPaymentDialog";
interface PixPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
const PixPaymentDialog: React.FC<PixPaymentDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [valor, setValor] = useState('');
  const [credits, setCredits] = useState(0);
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [isSubmittingKey, setIsSubmittingKey] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showLivePixDialog, setShowLivePixDialog] = useState(false);

  // Dados fictícios para a chave PIX. Em um caso real, seria dinâmico.
  const pixKey = 'sua_chave_pix@exemplo.com';
  const merchantName = 'AuraLink';
  const merchantCity = 'São Paulo';

  // Regra de conversão: R$ 1,00 = 10 créditos
  const CONVERSION_RATE = 10;

  // Função para gerar o payload do PIX (o código 'copia e cola')
  const generatePixPayload = (value: string) => {
    const payloadFormatIndicator = '0014br.gov.bcb.pix';
    const merchantAccountInformation = `26${String(pixKey.length + 4).padStart(2, '0')}0014br.gov.bcb.pix01${String(pixKey.length).padStart(2, '0')}${pixKey}`;
    const merchantCategoryCode = '52040000';
    const transactionCurrency = '5303986';
    const transactionAmount = `54${String(value.length).padStart(2, '0')}${value}`;
    const countryCode = '5802BR';
    const merchantNameField = `59${String(merchantName.length).padStart(2, '0')}${merchantName}`;
    const merchantCityField = `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`;
    const additionalDataField = '62070503***';
    let fullPayload = `000201${payloadFormatIndicator}${merchantAccountInformation}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantNameField}${merchantCityField}${additionalDataField}`;
    const crc16 = '630473F6';
    fullPayload += crc16;
    return fullPayload;
  };

  // Função que chama a API do MercadoPago para gerar o PIX real
  const generateRealPix = async () => {
    if (!valor || parseFloat(valor) <= 0) {
      toast.error("Por favor, insira um valor válido.");
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-pix', {
        body: {
          amount: parseFloat(valor.replace(',', '.')),
          email: 'usuario@dreamlink.pro' // You can make this dynamic later
        }
      });
      if (error) {
        throw new Error(error.message || 'Erro ao chamar função de pagamento');
      }
      if (!data.pixCode || !data.qrCodeUrl) {
        throw new Error('Resposta inválida da API de pagamento');
      }
      setPixCode(data.pixCode);
      setQrCodeUrl(data.qrCodeUrl);
      setCredits(Math.floor(parseFloat(valor.replace(',', '.')) * CONVERSION_RATE));
      toast.success("Código PIX gerado com sucesso!");
      console.log('PIX gerado:', {
        paymentId: data.paymentId,
        status: data.status
      });
    } catch (error) {
      console.error('Erro ao gerar o PIX real:', error);
      toast.error('Falha ao gerar o PIX. Tente novamente.');
      setPixCode('');
      setQrCodeUrl('');
      setCredits(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para copiar o código PIX para a área de transferência
  const handleCopy = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode).then(() => {
        setIsCopied(true);
        toast.success("Código PIX copiado!");
        // Oculta a mensagem "Copiado!" após 2 segundos
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('Falha ao copiar:', err);
        toast.error("Falha ao copiar código.");
      });
    }
  };

  // Efeito para resetar os campos quando o valor é apagado
  useEffect(() => {
    if (!valor) {
      setPixCode('');
      setQrCodeUrl('');
      setCredits(0);
      setIsCopied(false);
    }
  }, [valor]);

  // Função para submeter a public key
  const handleSubmitPublicKey = async () => {
    if (!publicKey.trim()) {
      toast.error("Por favor, insira a Public Key.");
      return;
    }
    setIsSubmittingKey(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('update-mp-public-key', {
        body: {
          publicKey: publicKey.trim()
        }
      });
      if (error) {
        throw new Error(error.message || 'Erro ao atualizar Public Key');
      }
      toast.success("Public Key do MercadoPago atualizada com sucesso!");
      setPublicKey('');
    } catch (error) {
      console.error('Erro ao atualizar Public Key:', error);
      toast.error('Falha ao atualizar Public Key. Tente novamente.');
    } finally {
      setIsSubmittingKey(false);
    }
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setValor('');
      setPixCode('');
      setQrCodeUrl('');
      setCredits(0);
      setIsCopied(false);
      setIsLoading(false);
      setPublicKey('');
      setIsSubmittingKey(false);
    }
  }, [isOpen]);
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
              💳 Gerador de PIX
              <Button
                onClick={() => setShowMessageDialog(true)}
                className="rounded-full h-6 w-6 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                size="icon"
                title="Gerador LicePix"
              >
                <HelpCircle size={12} />
              </Button>
              <Button 
                onClick={() => setShowLivePixDialog(true)}
                className="rounded-full px-4 py-2 shadow-lg bg-purple-600 hover:bg-purple-700 text-white text-sm"
                title="LivePix"
              >
                🚀 LivePix
              </Button>
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Gere seu código PIX para receber pagamentos.
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Seção para atualizar Public Key */}
          

          <Separator />

          {/* Input para o valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor a ser Cobrado (BRL)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground">R$</span>
              </div>
              <Input type="number" id="valor" className="pl-9" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} min="0.01" step="0.01" />
            </div>
          </div>

          {/* Indicador de Créditos */}
          {valor.length > 0 && <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Math.floor(parseFloat(valor.replace(',', '.')) * CONVERSION_RATE)} Créditos
              </div>
            </div>}

          {/* Botão para gerar o PIX */}
          <Button onClick={generateRealPix} disabled={isLoading || !valor || parseFloat(valor) <= 0} className="w-full bg-green-600 hover:bg-green-700">
            {isLoading ? 'Gerando...' : 'Gerar Código PIX'}
          </Button>

          {pixCode && <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-bold">Escaneie o QR Code</h3>
                    {/* Imagem do QR Code gerada por uma API */}
                    <div className="flex justify-center">
                      <div className="p-2 border rounded-lg bg-background shadow-lg">
                        <img src={qrCodeUrl} alt="Código QR PIX" className="w-[200px] h-[200px]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Código 'Copia e Cola' */}
              <div className="space-y-2">
                <Label htmlFor="pix-code">Código PIX Copia e Cola</Label>
                <div className="flex gap-2">
                  <Input id="pix-code" className="flex-1 font-mono text-xs" value={pixCode} readOnly />
                  <Button onClick={handleCopy} variant="outline" className="shrink-0">
                    {isCopied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>
            </div>}
        </div>
      </DialogContent>
      
      {/* SendMessage Dialog */}
      <SendMessageDialog 
        isOpen={showMessageDialog} 
        setIsOpen={setShowMessageDialog} 
      />

      {/* LivePix Payment Dialog */}
      <LivePixPaymentDialog 
        isOpen={showLivePixDialog} 
        onClose={() => setShowLivePixDialog(false)} 
      />
    </Dialog>;
};
export default PixPaymentDialog;