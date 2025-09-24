import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, CreditCard, QrCode } from "lucide-react";

interface PaymentMethodsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentMethodsDialog: React.FC<PaymentMethodsDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [pixResult, setPixResult] = useState<any>(null);
  const [pixValue, setPixValue] = useState(10.00);
  const [credits, setCredits] = useState(0);

  // Calculate credits based on PIX value
  useEffect(() => {
    const newCredits = Math.round(pixValue * 10);
    setCredits(newCredits);
  }, [pixValue]);

  const handlePixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get('email-pix') as string || 'nuser14@foboxs.com';
      const description = formData.get('description-pix') as string || `Compra de ${credits} créditos - AuraLink`;
      
      // Validação adicional
      if (!email || !email.includes('@')) {
        toast.error('E-mail inválido');
        setLoading(false);
        return;
      }
      
      if (pixValue < 1) {
        toast.error('Valor mínimo é R$ 1,00');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('process-pix-payment', {
        body: {
          transactionAmount: pixValue,
          description: description.trim() || `Compra de ${credits} créditos - AuraLink`,
          email: email.trim()
        }
      });

      if (error) {
        console.error('Erro ao processar PIX:', error);
        toast.error('Erro ao gerar PIX. Tente novamente.');
        return;
      }

      if (data?.qrCodeImage && data?.brCode) {
        setPixResult({
          qrCodeImage: data.qrCodeImage,
          qrCode: data.brCode,
          message: data.message || 'PIX gerado com sucesso!'
        });
        toast.success('PIX gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar dados do PIX');
      }
    } catch (error) {
      console.error('Erro na requisição PIX:', error);
      toast.error('Erro ao processar PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const cardData = {
      email: formData.get('card-email'),
      cardNumber: formData.get('card-number'),
      cardName: formData.get('card-name'),
      cardCpf: formData.get('card-cpf'),
      cardExpiry: formData.get('card-expiry'),
      cardCvv: formData.get('card-cvv'),
      installments: formData.get('card-installments'),
      addressZip: formData.get('address-zip'),
      addressStreet: formData.get('address-street'),
      addressNumber: formData.get('address-number'),
      addressComplement: formData.get('address-complement'),
      transactionAmount: pixValue
    };

    try {
      const { data, error } = await supabase.functions.invoke('process-card-payment', {
        body: cardData
      });

      if (error) {
        console.error('Erro ao processar cartão:', error);
        toast.error('Erro ao processar pagamento. Verifique os dados.');
        return;
      }

      toast.success('Pagamento processado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!pixResult?.qrCode) return;
    
    try {
      await navigator.clipboard.writeText(pixResult.qrCode);
      toast.success('Código copiado!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Escolha o Método de Pagamento
          </DialogTitle>
        </DialogHeader>

        {/* Valor total */}
        <Card className="p-4 bg-muted/50 text-center">
          <div className="flex justify-center items-center gap-2">
            <span className="text-lg font-medium">Valor Total:</span>
            <span className="text-2xl font-bold text-green-600">
              R$ {pixValue.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="text-lg font-bold text-primary mt-2">
            {credits} Créditos
          </div>
        </Card>

        {/* Abas */}
        <div className="flex border-b">
          <Button
            variant="ghost"
            onClick={() => { setActiveTab('pix'); setPixResult(null); }}
            className={`flex-1 rounded-none border-b-2 ${
              activeTab === 'pix' 
                ? 'border-primary text-primary' 
                : 'border-transparent'
            }`}
          >
            <QrCode className="w-4 h-4 mr-2" />
            PIX
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('card')}
            className={`flex-1 rounded-none border-b-2 ${
              activeTab === 'card' 
                ? 'border-primary text-primary' 
                : 'border-transparent'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Cartão
          </Button>
        </div>

        {/* Conteúdo PIX */}
        {activeTab === 'pix' && (
          <div className="space-y-4">
            <form onSubmit={handlePixSubmit} className="space-y-4">
              <div>
                <Label htmlFor="value-pix">Valor</Label>
                <Input
                  type="number"
                  id="value-pix"
                  step="0.01"
                  min="1"
                  value={pixValue}
                  onChange={(e) => setPixValue(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email-pix">E-mail do Usuário</Label>
                <Input
                  type="email"
                  id="email-pix"
                  name="email-pix"
                  defaultValue="nuser14@foboxs.com"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description-pix">Descrição do Pagamento</Label>
                <Input
                  type="text"
                  id="description-pix"
                  name="description-pix"
                  defaultValue="Yes."
                  placeholder="Descrição opcional"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full"
              >
                {loading ? 'Gerando...' : 'Gerar PIX'}
              </Button>
            </form>

            {pixResult && (
              <Card className="p-4 space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">QR Code PIX</h3>
                  <img 
                    src={pixResult.qrCodeImage} 
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto border rounded-lg"
                  />
                </div>
                
                <div>
                  <Label>Código Copia e Cola</Label>
                  <div className="flex gap-2">
                    <Input
                      value={pixResult.qrCode}
                      readOnly
                      className="flex-1"
                    />
                    <Button onClick={handleCopy} size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Conteúdo Cartão */}
        {activeTab === 'card' && (
          <form onSubmit={handleCardSubmit} className="space-y-4">
            <div>
              <Label htmlFor="card-email">E-mail do Titular</Label>
              <Input
                type="email"
                id="card-email"
                name="card-email"
                placeholder="nome@exemplo.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="card-number">Número do Cartão</Label>
              <Input
                type="text"
                id="card-number"
                name="card-number"
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>

            <div>
              <Label htmlFor="card-name">Nome no Cartão</Label>
              <Input
                type="text"
                id="card-name"
                name="card-name"
                placeholder="Nome Completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="card-cpf">CPF do Titular</Label>
              <Input
                type="text"
                id="card-cpf"
                name="card-cpf"
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-expiry">Validade (MM/AA)</Label>
                <Input
                  type="text"
                  id="card-expiry"
                  name="card-expiry"
                  placeholder="MM/AA"
                  required
                />
              </div>
              <div>
                <Label htmlFor="card-cvv">CVV</Label>
                <Input
                  type="text"
                  id="card-cvv"
                  name="card-cvv"
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="card-installments">Parcelas</Label>
              <select
                id="card-installments"
                name="card-installments"
                required
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="">Selecione as parcelas</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}x
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Endereço de Cobrança</h3>
              
              <div>
                <Label htmlFor="address-zip">CEP</Label>
                <Input
                  type="text"
                  id="address-zip"
                  name="address-zip"
                  placeholder="00000-000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address-street">Rua</Label>
                <Input
                  type="text"
                  id="address-street"
                  name="address-street"
                  placeholder="Nome da rua"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address-number">Número</Label>
                  <Input
                    type="text"
                    id="address-number"
                    name="address-number"
                    placeholder="123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address-complement">Complemento</Label>
                  <Input
                    type="text"
                    id="address-complement"
                    name="address-complement"
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full"
            >
              {loading ? 'Processando...' : 'Pagar com Cartão'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};