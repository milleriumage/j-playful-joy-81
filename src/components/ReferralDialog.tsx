import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Gift, DollarSign, Clock, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useReferralSystem } from "@/hooks/useReferralSystem";

interface ReferralDialogProps {
  disabled?: boolean;
}

export const ReferralDialog = ({ disabled = false }: ReferralDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [stripeEmail, setStripeEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const { user } = useGoogleAuth();
  
  const {
    referralStats,
    paymentSettings,
    sendGift,
    updatePaymentSettings,
    isLoading,
    getUserReferralLink
  } = useReferralSystem();

  const referralLink = getUserReferralLink();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("🔗 Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleSavePaymentSettings = async () => {
    if (!paypalEmail && !stripeEmail) {
      toast.error("Informe pelo menos um email de pagamento");
      return;
    }

    const success = await updatePaymentSettings(paypalEmail, stripeEmail);
    if (success) {
      toast.success("💳 Configurações de pagamento salvas!");
    }
  };

  const handleSendGift = async () => {
    if (referralStats.referredUsersCount === 0) {
      toast.error("Você não possui usuários cadastrados via sua página");
      return;
    }

    const success = await sendGift();
    if (success) {
      toast.success("🎁 Presente enviado com sucesso!");
    }
  };

  useEffect(() => {
    if (paymentSettings) {
      setPaypalEmail(paymentSettings.paypal_email || "");
      setStripeEmail(paymentSettings.stripe_email || "");
    }
  }, [paymentSettings]);

  const daysRemaining = referralStats.commissionReleaseDate ? 
    Math.max(0, Math.ceil((new Date(referralStats.commissionReleaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  if (!user) {
    return (
      <Button size="sm" variant="ghost" className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none" disabled>
        <Users className="w-4 h-4 mr-2" />
        <span>Referral Page (Login necessário)</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none" disabled={disabled}>
          <Users className="w-4 h-4 mr-2" />
          <span>Referral Page</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Referral Page - Sistema de Indicações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas principais */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-200/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{referralStats.referredUsersCount}</div>
              <p className="text-muted-foreground">
                🎉 usuários já se cadastraram! 
                💡 Incentive-os a virar VIP e receba 2% de comissão apenas por assinaturas VIP! 🚀
              </p>
            </div>
          </div>

          {/* Estatísticas VIP e Comissão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-200/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{referralStats.vipUsersCount}</div>
                <p className="text-sm text-muted-foreground">Usuários VIP</p>
              </div>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-200/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ${referralStats.totalCommission.toFixed(2)} / $5
                </div>
                <p className="text-sm text-muted-foreground">Comissão Acumulada</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (referralStats.totalCommission / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Aviso de limite atingido */}
          {referralStats.isCommissionLimitReached && (
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-200/20">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <span className="text-lg">⚠️</span>
                <div className="text-sm">
                  <strong>Limite de $5 atingido.</strong> Continue enviando presentes e incentivando VIPs, mas novas comissões não serão adicionadas até liberar parte do valor.
                </div>
              </div>
            </div>
          )}

          {/* Link de compartilhamento */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">🔗 Seu Link de Indicação</Label>
            <div className="flex gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button 
                onClick={handleCopyLink}
                size="sm"
                variant="outline"
                className="px-3"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Compartilhe este link para que novos usuários se cadastrem através da sua indicação
            </p>
          </div>

          {/* Informações sobre comissão */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200/20">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                💡 Como funciona a comissão:
              </div>
              <ul className="space-y-1 text-xs">
                <li>• Comissão de <strong>2%</strong> se aplica apenas a usuários <strong>VIP</strong> que assinam o plano</li>
                <li>• Planos PRO ou BASIC não geram comissão</li>
                <li>• Limite máximo de <strong>$5</strong> de comissão acumulada por criador</li>
                <li>• Pagamento liberado após 30 dias</li>
              </ul>
              {referralStats.commissionPending > 0 && (
                <div className="mt-3 flex items-center gap-1 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Pendente: ${referralStats.commissionPending.toFixed(2)} (liberação em {daysRemaining} dias)</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuração de Pagamento */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4" />
              <span className="font-semibold">💳 Configuração de Pagamento</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paypal" className="flex items-center gap-2">
                  <span className="text-blue-600">📧</span>
                  PayPal Email
                </Label>
                <Input
                  id="paypal"
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripe" className="flex items-center gap-2">
                  <span className="text-purple-600">💳</span>
                  Stripe Email
                </Label>
                <Input
                  id="stripe"
                  type="email"
                  value={stripeEmail}
                  onChange={(e) => setStripeEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSavePaymentSettings} 
              disabled={isLoading}
              className="w-full"
            >
              Salvar Configurações de Pagamento
            </Button>
          </div>

          {/* Envio de Presentes */}
          <div className="border rounded-lg p-4 space-y-4">
            <Button 
              onClick={handleSendGift}
              disabled={isLoading || referralStats.referredUsersCount === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              size="lg"
            >
              <Gift className="w-5 h-5 mr-2" />
              Enviar Presente 🎁 100 créditos
            </Button>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <div className="font-semibold mb-2">ℹ️ Como funciona o presente:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Um usuário ALEATÓRIO da sua base de cadastrados receberá 100 créditos</li>
                  <li>• A mensagem será de BOAS-VINDAS com incentivo para virar assinante VIP</li>
                  <li>• Gera engajamento e aumenta chances de comissão (apenas VIP)</li>
                  <li>• O usuário poderá agradecer e será redirecionado para sua página</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};