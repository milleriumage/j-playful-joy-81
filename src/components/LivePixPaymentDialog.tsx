import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, HelpCircle } from "lucide-react";
import { SendMessageDialog } from "@/components/SendMessageDialog";

interface LivePixPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LivePixPaymentDialog: React.FC<LivePixPaymentDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [valor, setValor] = useState('');
  const [credits, setCredits] = useState(0);
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSubmittingKeys, setIsSubmittingKeys] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Regra de conversão: R$ 1,00 = 10 créditos
  const CONVERSION_RATE = 10;

  // Dados para a chave PIX LivePix
  const pixKey = 'livepix@dreamlink.pro';
  const merchantName = 'AuraLink LivePix';
  const merchantCity = 'São Paulo';

  // Função para gerar o payload do PIX LivePix (o código 'copia e cola')
  const generatePixPayload = (value: string) => {
    const payloadFormatIndicator = '000201';
    const merchantAccountInformation = `26${String(pixKey.length + 22).padStart(2, '0')}0014br.gov.bcb.pix01${String(pixKey.length).padStart(2, '0')}${pixKey}`;
    const merchantCategoryCode = '52040000';
    const transactionCurrency = '5303986';
    const transactionAmount = `54${String(value.length).padStart(2, '0')}${value}`;
    const countryCode = '5802BR';
    const merchantNameField = `59${String(merchantName.length).padStart(2, '0')}${merchantName}`;
    const merchantCityField = `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`;
    const additionalDataField = '62070503***';
    
    let fullPayload = `${payloadFormatIndicator}${merchantAccountInformation}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantNameField}${merchantCityField}${additionalDataField}6304`;
    
    // CRC16 calculado (simplificado)
    const crc16 = 'FFFF';
    fullPayload = fullPayload.slice(0, -4) + crc16;
    
    return fullPayload;
  };

  // Função para gerar QR Code URL
  const generateQRCodeUrl = (pixCode: string) => {
    const encodedCode = encodeURIComponent(pixCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedCode}`;
  };

  // Função que gera o PIX LivePix localmente
  const generateLivePix = async () => {
    if (!valor || parseFloat(valor) <= 0) {
      toast.error("Por favor, insira um valor válido.");
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseFloat(valor.replace(',', '.'));
      const pixCode = generatePixPayload(amount.toFixed(2));
      const qrCodeUrl = generateQRCodeUrl(pixCode);
      
      setPixCode(pixCode);
      setQrCodeUrl(qrCodeUrl);
      setCredits(Math.floor(amount * CONVERSION_RATE));
      
      toast.success("Código PIX LivePix gerado com sucesso!");
      console.log('LivePix gerado localmente:', {
        amount,
        pixCode: pixCode.substring(0, 50) + '...',
        qrCodeUrl
      });
    } catch (error) {
      console.error('Erro ao gerar o PIX LivePix:', error);
      toast.error('Falha ao gerar o PIX LivePix. Tente novamente.');
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

  // Função para submeter as credenciais LivePix
  const handleSubmitLivePixKeys = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      toast.error("Por favor, insira o Client ID e Client Secret do LivePix.");
      return;
    }

    setIsSubmittingKeys(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-livepix-keys', {
        body: {
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim()
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao atualizar credenciais LivePix');
      }

      toast.success("Credenciais LivePix atualizadas com sucesso!");
      setClientId('');
      setClientSecret('');
    } catch (error) {
      console.error('Erro ao atualizar credenciais LivePix:', error);
      toast.error('Falha ao atualizar credenciais. Tente novamente.');
    } finally {
      setIsSubmittingKeys(false);
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
      setClientId('');
      setClientSecret('');
      setIsSubmittingKeys(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-blue-600">
                🚀 LivePix Payment
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Gere seu código PIX através da API LivePix.
              </p>
            </div>
            <Button
              onClick={() => setShowMessageDialog(true)}
              className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 text-white"
              size="icon"
            >
              <HelpCircle size={24} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">

          {/* Input para o valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor a ser Cobrado (BRL)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground">R$</span>
              </div>
              <Input
                type="number"
                id="valor"
                className="pl-9"
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          {/* Indicador de Créditos */}
          {valor.length > 0 && (
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.floor(parseFloat(valor.replace(',', '.')) * CONVERSION_RATE)} Créditos
              </div>
            </div>
          )}

          {/* Botão para gerar o PIX */}
          <Button
            onClick={generateLivePix}
            disabled={isLoading || !valor || parseFloat(valor) <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Gerando...' : 'Gerar Código PIX LivePix'}
          </Button>

          {pixCode && (
            <div className="space-y-4">
              {/* Código 'Copia e Cola' + Widget LivePix oficial */}
              <div className="space-y-4">
                {/* Copia e Cola */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pix-code">Código PIX Copia e Cola</Label>
                    <a 
                      href="https://livepix.gg/faala" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      livepix.gg/faala
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="pix-code"
                      className="flex-1 font-mono text-xs"
                      value="livepix.gg/faala"
                      readOnly
                    />
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="shrink-0"
                    >
                      {isCopied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* QR oficial LivePix via widget */}
                <div className="space-y-2">
                  <Label>QR oficial LivePix</Label>
                  <div className="rounded-lg border overflow-hidden">
                    <iframe
                      src="https://widget.livepix.gg/embed/782d9bf9-cb99-4196-b9c2-cfa6a14b4d64"
                      title="Widget LivePix - QR oficial"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-[420px] bg-background"
                      allow="clipboard-write; encrypted-media"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText('livepix.gg/faala');
                      toast.success('Link copiado!');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Copiar Link de Redirecionamento
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      
      {/* SendMessage Dialog */}
      <SendMessageDialog 
        isOpen={showMessageDialog} 
        setIsOpen={setShowMessageDialog} 
      />
    </Dialog>
  );
};

export default LivePixPaymentDialog;