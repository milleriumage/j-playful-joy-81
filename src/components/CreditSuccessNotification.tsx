import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreditSuccessNotificationProps {
  credits: number;
  onClose: () => void;
}

export const CreditSuccessNotification: React.FC<CreditSuccessNotificationProps> = ({ 
  credits, 
  onClose 
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          setTimeout(onClose, 500); // Aguarda animação de saída
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <Card className={`bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/50 border p-4 max-w-xs shadow-sm backdrop-blur-sm transition-all duration-500 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-lg">
                🎉 Parabéns!
              </h3>
              <p className="text-green-700 text-sm">
                Créditos adicionados com sucesso
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="bg-white/60 rounded-lg p-4 border border-green-200">
            <p className="text-center">
              <span className="text-2xl font-bold text-green-700">+{credits}</span>
              <span className="text-green-600 ml-1">créditos</span>
            </p>
            <p className="text-sm text-green-600 text-center mt-1">
              foram adicionados à sua conta!
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Esta mensagem desaparecerá em {timeLeft}s
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};