import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutTransparenteDialogProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const CheckoutTransparenteDialog: React.FC<CheckoutTransparenteDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("10.00");
  const [installments, setInstallments] = useState("1");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [docType, setDocType] = useState("CPF");
  const [docNumber, setDocNumber] = useState("");
  const [mp, setMp] = useState<any>(null);
  const [cardForm, setCardForm] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<string>("");

  // Get public key from Supabase secrets
  useEffect(() => {
    const getPublicKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mp-public-key');
        if (error) {
          console.error('Erro ao buscar chave pública:', error);
          toast.error('Erro ao inicializar pagamento');
          return;
        }
        setPublicKey(data.publicKey);
      } catch (error) {
        console.error('Erro ao buscar chave pública:', error);
        toast.error('Erro ao inicializar pagamento');
      }
    };
    getPublicKey();
  }, []);

  useEffect(() => {
    if (open && !mp && publicKey) {
      // Load MercadoPago SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        // Initialize with public key
        const mercadoPago = new window.MercadoPago(publicKey, {
          locale: 'pt-BR'
        });
        setMp(mercadoPago);
      };
      document.head.appendChild(script);
    }
  }, [open, mp, publicKey]);

  useEffect(() => {
    if (mp && open && !cardForm) {
      try {
        const form = mp.cardForm({
          amount: amount,
          iframe: true,
          form: {
            id: "form-checkout",
            cardNumber: {
              id: "form-checkout__cardNumber",
              placeholder: "Número do cartão"
            },
            cardholderName: {
              id: "form-checkout__cardholderName",
              placeholder: "Nome do titular"
            },
            cardExpirationMonth: {
              id: "form-checkout__cardExpirationMonth",
              placeholder: "Mês"
            },
            cardExpirationYear: {
              id: "form-checkout__cardExpirationYear",
              placeholder: "Ano"
            },
            securityCode: {
              id: "form-checkout__securityCode",
              placeholder: "CVV"
            },
            installments: {
              id: "form-checkout__installments",
              placeholder: "Parcelas"
            },
            identificationType: {
              id: "form-checkout__identificationType",
              placeholder: "Tipo de documento"
            },
            identificationNumber: {
              id: "form-checkout__identificationNumber",
              placeholder: "Número do documento"
            },
          },
          callbacks: {
            onFormMounted: (error: any) => {
              if (error) return console.warn("Form Mounted Handling Error: ", error);
              console.log("Formulário do cartão carregado!");
            },
            onSubmit: (event: any) => {
              event.preventDefault();
              setLoading(true);
              
              form.createCardToken().then((result: any) => {
                if (result.error) {
                  console.error('Erro ao criar token:', result.error);
                  toast.error('Erro ao processar cartão: ' + result.error.message);
                  setLoading(false);
                  return;
                }
                
                processPayment(result.id);
              }).catch((error: any) => {
                console.error('Erro no createCardToken:', error);
                toast.error('Erro ao tokenizar cartão');
                setLoading(false);
              });
            },
            onFetching: (resource: any) => {
              console.log("Fetching resource: ", resource);
            }
          }
        });
        
        setCardForm(form);
      } catch (error) {
        console.error('Erro ao criar formulário do cartão:', error);
        toast.error('Erro ao inicializar formulário de pagamento');
      }
    }
  }, [mp, open, amount, cardForm]);

  const processPayment = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-card-payment', {
        body: {
          token,
          transaction_amount: parseFloat(amount),
          installments: parseInt(installments),
          payment_method_id: 'visa', // This would be determined by the card form
          description: `Recarga de créditos - $${amount}`,
          email,
          identification_type: docType,
          identification_number: docNumber,
          cardholder_name: name
        }
      });

      if (error) {
        console.error('Erro na função:', error);
        toast.error('Erro ao processar pagamento');
        return;
      }

      console.log('Pagamento processado:', data);
      
      if (data.status === 'approved') {
        toast.success('✅ Pagamento aprovado!');
        setOpen(false);
      } else if (data.status === 'pending') {
        toast.success('⏳ Pagamento pendente de aprovação');
        setOpen(false);
      } else {
        toast.error('❌ Pagamento rejeitado: ' + data.status_detail);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardForm) {
      cardForm.submit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Checkout Transparente
          </DialogTitle>
        </DialogHeader>
        
        <form id="form-checkout" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do titular do cartão"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="docNumber">Número do documento</Label>
              <Input
                id="docNumber"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          {/* MercadoPago Card Form Fields */}
          <div className="space-y-4 border border-border p-4 rounded-lg bg-card">
            <h3 className="font-medium text-card-foreground">Dados do Cartão</h3>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Número do cartão</Label>
              <div id="form-checkout__cardNumber" className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Mês</Label>
                <div id="form-checkout__cardExpirationMonth" className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"></div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Ano</Label>
                <div id="form-checkout__cardExpirationYear" className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"></div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Nome do titular</Label>
              <div id="form-checkout__cardholderName" className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"></div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">CVV</Label>
              <div id="form-checkout__securityCode" className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"></div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Parcelas</Label>
              <div id="form-checkout__installments" className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"></div>
            </div>

            <div className="hidden">
              <div id="form-checkout__identificationType"></div>
              <div id="form-checkout__identificationNumber"></div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar ${amount}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};