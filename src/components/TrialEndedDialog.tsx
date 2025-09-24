import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Gem, Check } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface TrialEndedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialEndedDialog: React.FC<TrialEndedDialogProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { createCheckout } = useSubscription();

  if (!isOpen) return null;

  const plans = [
    {
      id: 'pro',
      name: 'PRO',
      price: '$9/month',
      icon: Crown,
      color: 'bg-blue-500',
      features: ['Recursos PRO básicos', 'Suporte prioritário', 'Sem anúncios'],
      link: 'https://dreamlink.pro/pro',
      productId: 'prod_SkHR3k5moylM8t'
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '$15/month',
      icon: Star,
      color: 'bg-purple-500',
      features: ['Todos recursos PRO', 'Analytics avançado', 'Customização total'],
      link: 'https://dreamlink.pro/vip',
      productId: 'prod_SkHY1XdCaL1NZY'
    }
  ];

  const handlePlanSelect = async (planId: string, productId: string) => {
    try {
      await createCheckout(planId, productId);
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            🎉 Seu período de teste acabou!
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Escolha um plano para continuar usando nossos recursos premium
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card key={plan.id} className="relative border-2 hover:border-primary transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{plan.price}</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => handlePlanSelect(plan.id, plan.productId)}
                      className="w-full"
                      variant={plan.id === 'premium' ? 'default' : 'outline'}
                    >
                      Escolher {plan.name}
                    </Button>
                  </CardContent>
                  {plan.id === 'premium' && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                      Mais Popular
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Continuar com plano gratuito (recursos limitados)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};