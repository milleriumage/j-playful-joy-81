import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreditDeductionNotificationProps {
  credits: number;
  onClose: () => void;
}

export const CreditDeductionNotification: React.FC<CreditDeductionNotificationProps> = ({ 
  credits, 
  onClose 
}) => {
  const [timeLeft, setTimeLeft] = useState(5);
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
      <Card className={`bg-gradient-to-r from-orange-50/80 to-red-50/80 border-orange-200/50 border p-3 max-w-xs shadow-sm backdrop-blur-sm transition-all duration-500 ${
        isVisible ? 'scale-100' : 'scale-95'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Minus className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-orange-800 text-sm">
                Créditos utilizados
              </h4>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 p-1 h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <p className="text-center">
            <span className="text-lg font-bold text-orange-700">-{credits}</span>
            <span className="text-orange-600 ml-1 text-sm">créditos</span>
          </p>
          <p className="text-xs text-orange-600 text-center mt-1">
            pela adição de mídia
          </p>
        </div>

        <div className="text-center mt-2">
          <div className="inline-flex items-center gap-1 text-xs text-orange-600">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            {timeLeft}s
          </div>
        </div>
      </Card>
    </div>
  );
};