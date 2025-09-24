import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";

interface SubscriptionSuccessNotificationProps {
  planName: string;
  onClose: () => void;
  isProcessing?: boolean;
}

export const SubscriptionSuccessNotification: React.FC<SubscriptionSuccessNotificationProps> = ({ 
  planName, 
  onClose,
  isProcessing = false
}) => {
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-success mb-2">
                Processando Pagamento
              </h3>
              <p className="text-muted-foreground mb-4">
                Seu plano <span className="font-semibold text-success">{planName}</span> está sendo ativado...
              </p>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success"></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Por favor, aguarde enquanto confirmamos seu pagamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
        <CheckCircle className="w-6 h-6 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold">🎉 Parabéns!</h4>
          <p className="text-sm">Você aderiu ao Plano {planName}!</p>
        </div>
        <Button
          size="sm"
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};