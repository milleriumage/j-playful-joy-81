import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [creditsProcessed, setCreditsProcessed] = useState(false);
  const sessionId = searchParams.get('session_id');
  const credits = searchParams.get('credits');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        console.error('No session ID found');
        setIsProcessing(false);
        return;
      }

      try {
        setIsProcessing(true);
        console.log('Processing payment for session:', sessionId);
        
        const { data, error } = await supabase.functions.invoke('process-payment-success', {
          body: { sessionId }
        });

        if (error) {
          console.error('Error processing payment:', error);
          toast.error('Erro ao processar pagamento. Entre em contato com o suporte.');
        } else {
          console.log('Payment processed successfully:', data);
          setCreditsProcessed(true);
          toast.success(`${data.creditsAdded} créditos adicionados com sucesso!`);
        }
      } catch (error) {
        console.error('Payment processing failed:', error);
        toast.error('Erro ao processar pagamento. Entre em contato com o suporte.');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [sessionId]);

  useEffect(() => {
    if (!isProcessing && creditsProcessed) {
      // Redirecionar para a página principal após 3 segundos
      const timer = setTimeout(() => {
        navigate('/?payment_processed=true', { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate, isProcessing, creditsProcessed]);

  const handleContinue = () => {
    navigate('/?payment_processed=true', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">
            {isProcessing ? 'Processando Pagamento...' : 'Pagamento Aprovado!'}
          </h1>
          
          <p className="text-muted-foreground">
            {isProcessing 
              ? 'Estamos processando seu pagamento e adicionando os créditos...'
              : 'Seu pagamento foi processado com sucesso.'
            }
          </p>

          {creditsProcessed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">
                🎉 Créditos adicionados à sua conta com sucesso!
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleContinue}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Continuar para o App
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            {creditsProcessed 
              ? 'Redirecionando automaticamente em 3 segundos...'
              : 'Aguarde o processamento dos créditos...'
            }
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;