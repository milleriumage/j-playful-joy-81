import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { CreditPurchaseDialog } from './CreditPurchaseDialog';
import { AddCreditsDialog } from './AddCreditsDialog';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { toast } from 'sonner';

interface PriceConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  isTransparent: boolean;
  hasBlinkAnimation: boolean;
  movementType: 'none' | 'horizontal' | 'vertical';
  enableCreditPurchase: boolean;
  creditPrice: number;
  creditButtonColor: string;
  creditButtonBlink: boolean;
  creditButtonPosition?: 'top' | 'middle' | 'bottom';
  creditButtonWidth?: number;
  creditButtonHeight?: number;
  showAfterPurchase?: boolean;
}

interface CreditPurchaseButtonProps {
  mediaId: string;
  creatorId: string;
  mediaTitle?: string;
  priceConfig: PriceConfig;
  onPurchaseSuccess?: () => void;
  isUnlocked?: boolean;
}

export const CreditPurchaseButton = ({
  mediaId,
  creatorId,
  mediaTitle,
  priceConfig,
  onPurchaseSuccess,
  isUnlocked = false
}: CreditPurchaseButtonProps) => {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showAddCreditsDialog, setShowAddCreditsDialog] = useState(false);
  const { user } = useOptimizedAuth();
  const { credits } = useUserCredits();

  const handleButtonClick = () => {
    console.log('🔵 BOTÃO CLICADO - CreditPurchaseButton');
    
    // Garantir que os valores sejam números válidos
    const userCredits = Number(credits) || 0;
    const requiredCredits = Number(priceConfig.creditPrice) || 0;
    
    console.log('🔍 CreditPurchaseButton DEBUG:', {
      user: !!user,
      userId: user?.id,
      rawCredits: credits,
      userCredits: userCredits,
      rawCreditPrice: priceConfig.creditPrice,
      requiredCredits: requiredCredits,
      hasEnoughCredits: userCredits >= requiredCredits,
      comparison: `${userCredits} >= ${requiredCredits} = ${userCredits >= requiredCredits}`,
      mediaId,
      mediaTitle,
      enableCreditPurchase: priceConfig.enableCreditPurchase
    });

    // Se não estiver logado, mostrar notificação para se cadastrar
    if (!user) {
      console.log('❌ User not logged in, showing login toast');
      toast.error('🔒 Você precisa se cadastrar para comprar este conteúdo!', {
        description: 'Faça login ou crie uma conta para acessar o conteúdo premium.',
        action: {
          label: 'Login',
          onClick: () => {
            console.log('Redirect to login page');
          }
        }
      });
      return;
    }

    // SEMPRE mostrar o modal de confirmação de compra (independente dos créditos)
    console.log('✅ Showing purchase confirmation dialog');
    setShowPurchaseDialog(true);
  };

  const handlePurchaseConfirm = (result: any) => {
    if (result.success) {
      onPurchaseSuccess?.();
      setShowPurchaseDialog(false);
    }
  };

  // Se desabilitado ou já comprado e configurado para não mostrar após compra
  if (!priceConfig.enableCreditPurchase || (isUnlocked && !priceConfig.showAfterPurchase)) {
    return null;
  }

  const getPositionClasses = () => {
    switch (priceConfig.creditButtonPosition) {
      case 'top':
        return 'absolute top-4 left-1/2 transform -translate-x-1/2 z-10';
      case 'middle':
        return 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10';
      case 'bottom':
      default:
        return 'absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10';
    }
  };

  return (
    <>
      <div className={getPositionClasses()}>
        <button
          onClick={handleButtonClick}
          className={`
            flex items-center gap-2 justify-center rounded-lg font-medium text-white text-xs
            transition-all duration-300 hover:scale-105 active:scale-95
            ${priceConfig.creditButtonBlink ? 'animate-pulse' : ''}
            backdrop-blur-sm border border-white/20 shadow-lg
          `}
          style={{ 
            backgroundColor: priceConfig.creditButtonColor,
            fontFamily: priceConfig.fontFamily,
            width: `${priceConfig.creditButtonWidth || 200}px`,
            height: `${priceConfig.creditButtonHeight || 40}px`,
            minWidth: `${priceConfig.creditButtonWidth || 200}px`,
            minHeight: `${priceConfig.creditButtonHeight || 40}px`
          }}
          data-media-id={mediaId}
        >
          <CreditCard className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Comprar por {priceConfig.creditPrice} Créditos</span>
        </button>
      </div>

      <CreditPurchaseDialog
        isOpen={showPurchaseDialog}
        onClose={() => setShowPurchaseDialog(false)}
        onConfirm={handlePurchaseConfirm}
        creditPrice={priceConfig.creditPrice}
        mediaTitle={mediaTitle}
        mediaId={mediaId}
        creatorId={creatorId}
      />

      <AddCreditsDialog
        open={showAddCreditsDialog}
        onOpenChange={setShowAddCreditsDialog}
      />
    </>
  );
};