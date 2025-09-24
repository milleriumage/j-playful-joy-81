import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">
            Pagamento Cancelado
          </h1>
          
          <p className="text-muted-foreground">
            Seu pagamento foi cancelado. Você pode tentar novamente a qualquer momento.
          </p>
        </div>

        <Button 
          onClick={handleBack}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao App
        </Button>
      </Card>
    </div>
  );
};

export default PaymentCanceled;