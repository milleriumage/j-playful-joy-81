import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useCreditPurchase } from "@/hooks/useCreditPurchase";
import { toast } from 'sonner';

interface CreditPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: any) => void;
  creditPrice: number;
  mediaTitle?: string;
  mediaId: string;
  creatorId: string;
}

export const CreditPurchaseDialog = ({
  isOpen,
  onClose,
  onConfirm,
  creditPrice,
  mediaTitle = "este conteúdo",
  mediaId,
  creatorId
}: CreditPurchaseDialogProps) => {
  const { credits, isLoading: creditsLoading } = useUserCredits();
  const { user } = useGoogleAuth();
  const { processCreditPurchase, isProcessing } = useCreditPurchase();

  const handleConfirm = async () => {
    console.log('🔍 CreditPurchaseDialog - handleConfirm:', {
      credits: credits,
      creditPrice: creditPrice,
      creditsType: typeof credits,
      creditPriceType: typeof creditPrice,
      hasEnoughCredits: Number(credits) >= Number(creditPrice)
    });

    // Verificar se o usuário tem créditos suficientes
    const userCredits = Number(credits) || 0;
    const requiredCredits = Number(creditPrice) || 0;
    
    if (userCredits < requiredCredits) {
      toast.error(`❌ Créditos insuficientes! Você tem ${userCredits} créditos, mas precisa de ${requiredCredits}.`);
      return;
    }

    const result = await processCreditPurchase({
      mediaId,
      creatorId,
      creditPrice,
      mediaTitle
    });

    if (result.success) {
      onConfirm(result);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">💳 Confirmar Compra</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <p className="text-lg">
              Deseja gastar <span className="font-bold text-primary">{creditPrice} créditos</span> para desbloquear {mediaTitle}?
            </p>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Seus créditos atuais: <span className="font-medium text-foreground">{creditsLoading ? 'Carregando...' : credits}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Após a compra: <span className="font-medium text-foreground">{creditsLoading ? 'Calculando...' : (credits - creditPrice)}</span>
              </p>
            </div>

            {!user && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Como visitante, esta compra será temporária. Faça login para salvar suas compras permanentemente.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing || creditsLoading || (Number(credits) < Number(creditPrice))}
            className="flex-1"
          >
            {isProcessing ? 'Processando...' : 'Sim, comprar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};