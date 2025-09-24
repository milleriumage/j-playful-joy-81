import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Heart, Sparkles } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WelcomeGiftMessageProps {
  giftId: string;
  creatorName: string;
  credits: number;
  message: string;
  onClose: () => void;
}

export const WelcomeGiftMessage = ({ 
  giftId, 
  creatorName, 
  credits, 
  message, 
  onClose 
}: WelcomeGiftMessageProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useGoogleAuth();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleThankCreator = async () => {
    if (!user) return;

    try {
      // Marcar presente como agradecido
      const { error } = await supabase
        .from('referral_gifts')
        .update({ 
          thanked: true, 
          thanked_at: new Date().toISOString() 
        })
        .eq('id', giftId);

      if (error) throw error;

      toast.success("🙏 Agradecimento enviado!");
      
      // Redirecionar para página do criador (pode ser implementado depois)
      // window.open(`/creator/${creatorId}`, '_blank');
      
      onClose();
    } catch (error) {
      console.error('Erro ao agradecer:', error);
      toast.error("Erro ao enviar agradecimento");
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`
        max-w-md w-full bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 
        border-2 border-pink-200 dark:border-pink-800 shadow-2xl
        transform transition-all duration-700 ${isAnimating ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}
      `}>
        <div className="p-6 text-center space-y-4">
          {/* Header com animação */}
          <div className="relative">
            <div className={`
              text-4xl mb-2 transform transition-all duration-1000 
              ${isAnimating ? 'scale-125 rotate-12' : 'scale-100 rotate-0'}
            `}>
              🎁
            </div>
            <div className="absolute -top-2 -right-2 animate-pulse">
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="absolute -top-2 -left-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-pink-500" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-pink-700 dark:text-pink-300 animate-pulse">
              BOAS-VINDAS!
            </h2>
            <p className="text-lg font-semibold text-purple-600 dark:text-purple-300">
              O criador <span className="text-pink-600 dark:text-pink-400">{creatorName}</span> enviou {credits} créditos para você!
            </p>
          </div>

          {/* Mensagem com estrelas */}
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-pink-200 dark:border-pink-700">
            <div className="flex justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="w-3 h-3 text-yellow-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <p className="text-purple-700 dark:text-purple-300 font-medium italic">
              "{message}"
            </p>
            <div className="flex justify-center space-x-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="w-3 h-3 text-yellow-500 animate-pulse" style={{ animationDelay: `${i * 0.1 + 0.5}s` }} />
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Button 
              onClick={handleThankCreator}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 transform hover:scale-105 transition-all duration-200"
            >
              <Heart className="w-5 h-5 mr-2" />
              Agradecer Criador 🙏
            </Button>
            
            <Button 
              onClick={handleDismiss}
              variant="outline"
              className="w-full border-pink-300 text-pink-700 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-300 dark:hover:bg-pink-950/30"
            >
              Fechar
            </Button>
          </div>

          {/* Footer incentivo VIP */}
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              ✨ Considere se tornar VIP para ter acesso a recursos exclusivos! ✨
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};