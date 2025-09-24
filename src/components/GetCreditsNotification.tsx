import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, CreditCard } from "lucide-react";

interface GetCreditsNotificationProps {
  onClose: () => void;
  onGetCredits: () => void;
}

export const GetCreditsNotification: React.FC<GetCreditsNotificationProps> = ({ 
  onClose, 
  onGetCredits 
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5">
      <Card className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/30 backdrop-blur-sm max-w-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-700">Créditos Insuficientes!</h3>
            </div>
            <p className="text-sm text-red-600 mb-3">
              Você precisa de 20 créditos para usar esta ferramenta. Compre mais créditos para continuar editando suas mídias.
            </p>
            <Button 
              onClick={onGetCredits}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium"
              size="sm"
            >
              💎 Comprar Créditos
            </Button>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};