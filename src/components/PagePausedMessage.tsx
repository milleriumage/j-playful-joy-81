import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PagePausedMessage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-xl">
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Página Pausada
          </h1>
          <p className="text-gray-600 mb-4">
            Esta página foi pausada pelo criador.
          </p>
          <p className="text-sm text-gray-500">
            Aguarde alguns minutos e tente novamente.
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Voltar ao Início
        </Button>
      </Card>
    </div>
  );
};