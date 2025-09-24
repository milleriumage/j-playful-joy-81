import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Crown, Star, Gem, ChevronDown, ChevronUp, Upload, Palette, Timer, Monitor, MessageCircle, BarChart3 } from "lucide-react";
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';

export interface PremiumPlan {
  id: string;
  title: string;
  price: string;
  description: string[];
  link: string;
  stripeProductId?: string;
}

interface PremiumPlansManagerProps {
  plans: PremiumPlan[];
  onPlansUpdate: (plans: PremiumPlan[]) => void;
  disabled?: boolean;
  isUserView?: boolean;
}

export const PremiumPlansManager: React.FC<PremiumPlansManagerProps> = ({
  plans,
  onPlansUpdate,
  disabled = false,
  isUserView = false
}) => {
  const { createCheckout, subscribed, subscription_tier, openCustomerPortal, isLoggedIn } = useSubscription();
  const { t } = useLanguage();
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState('usd');

  const usdPlans: PremiumPlan[] = [
    {
      id: 'free',
      title: 'Free',
      price: '$0/7days',
      description: [t('plans.free.7days'), t('plans.free.slots'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYChoQJbIb1ye'
    },
    {
      id: 'basic',
      title: 'Basic',
      price: '$9/month',
      description: [t('plans.basic.slots'), t('plans.basic.credits'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYK31lYwaraZW'
    },
    {
      id: 'pro',
      title: 'Pro',
      price: '$15/month',
      description: [t('plans.pro.slots'), t('plans.pro.credits'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYMs3lMIhORSP'
    },
    {
      id: 'vip',
      title: 'Vip',
      price: '$25/month',
      description: [t('plans.vip.slots'), t('plans.vip.credits'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYOUxRB7COSzb'
    }
  ];

  const brlPlans: PremiumPlan[] = [
    {
      id: 'free_br',
      title: 'Free',
      price: 'R$0/7dias',
      description: [t('plans.free.7days'), t('plans.free.slots'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYQmZkivJM5A7'
    },
    {
      id: 'basic_br',
      title: 'Basic',
      price: 'R$45/mês',
      description: [t('plans.basic.slots'), t('plans.basic.credits'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYToyDtOUI77G'
    },
    {
      id: 'pro_br',
      title: 'Pro',
      price: 'R$75/mês',
      description: [t('plans.pro.slots'), t('plans.pro.credits'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYWNbi47WMsVh'
    },
    {
      id: 'vip_br',
      title: 'Vip',
      price: 'R$125/mês',
      description: [t('plans.vip.slots'), t('plans.vip.credits'), t('plans.noVideoRestriction')],
      link: 'https://dreamlink.pro/pro',
      stripeProductId: 'prod_SyYYCUxunSxrty'
    }
  ];

  const handlePlanSelect = async (planId: string, productId: string) => {
    try {
      // Verificar se o usuário já tem uma assinatura ativa
      if (subscribed && subscription_tier) {
        alert(`Você já possui um plano ${subscription_tier} ativo. Para assinar outro plano, você precisa cancelar o plano atual primeiro através do botão "Gerenciar Assinatura".`);
        return;
      }
      
      await createCheckout(planId, productId);
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      if (error?.message?.includes('currency')) {
        alert('Você já possui uma assinatura ativa em outra moeda. Para assinar este plano, cancele sua assinatura atual primeiro.');
      }
    }
  };

  const getPlanIcon = (planId: string) => {
    const baseId = planId.replace('_br', '');
    switch (baseId) {
      case 'free': return <Star className="w-6 h-6 text-muted-foreground" />;
      case 'basic': return <Gem className="w-6 h-6 text-blue-500" />;
      case 'pro': return <Crown className="w-6 h-6 text-purple-500" />;
      case 'vip': return <Crown className="w-6 h-6 text-gradient-primary" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getPlanHighlight = (planId: string) => {
    const baseId = planId.replace('_br', '');
    switch (baseId) {
      case 'pro': return 'border-purple-500 ring-2 ring-purple-500/20';
      case 'vip': return 'border-gradient-primary ring-2 ring-primary/20';
      default: return 'hover:border-primary';
    }
  };

  const getAllFeatures = () => [
    {
      category: t('features.uploads.title'),
      icon: <Upload className="w-5 h-5" />,
      features: [
        t('features.uploads.changeSlotImage'),
        t('features.uploads.pinMedia'),
        t('features.uploads.createSlideshow'),
        t('features.uploads.zoomMainImage'),
        t('features.uploads.zoomChatMedia')
      ]
    },
    {
      category: t('features.customization.title'),
      icon: <Palette className="w-5 h-5" />,
      features: [
        t('features.customization.manualBlur'),
        t('features.customization.autoBlur'),
        t('features.customization.mediaLink'),
        t('features.customization.textPrice'),
        t('features.customization.colorPalette'),
        t('features.customization.socialIcons')
      ]
    },
    {
      category: t('features.timing.title'),
      icon: <Timer className="w-5 h-5" />,
      features: [
        t('features.timing.autoDelete'),
        t('features.timing.mainScreenTimer'),
        t('features.timing.autoLock'),
        t('features.timing.passwordLock')
      ]
    },
    {
      category: t('features.vitrine.title'),
      icon: <Monitor className="w-5 h-5" />,
      features: [
        t('features.vitrine.backgroundColor'),
        t('features.vitrine.hide'),
        t('features.vitrine.minimizedText')
      ]
    },
    {
      category: t('features.chat.title'),
      icon: <MessageCircle className="w-5 h-5" />,
      features: [
        t('features.chat.close'),
        t('features.chat.hideHistory'),
        t('features.chat.backgroundColor'),
        t('features.chat.messageColor'),
        t('features.chat.creatorName'),
        t('features.chat.creatorPhoto'),
        t('features.chat.hideUpload'),
        t('features.chat.adjustBoxHeight')
      ]
    },
    {
      category: t('features.interaction.title'),
      icon: <BarChart3 className="w-5 h-5" />,
      features: [
        t('features.interaction.likeMedia'),
        t('features.interaction.shareToSocial'),
        t('features.interaction.statistics')
      ]
    }
  ];

  const renderPlansGrid = (plansList: PremiumPlan[]) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {plansList.map((plan, index) => {
        const baseId = plan.id.replace('_br', '');
        return (
          <Card key={plan.id} className={`relative transition-all duration-300 ${getPlanHighlight(plan.id)}`}>
            {baseId === 'pro' && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 hover:bg-purple-600">
                {t('premiumPlans.mostPopular')}
              </Badge>
            )}
            {baseId === 'vip' && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary-glow">
                {t('premiumPlans.bestValue')}
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
              <div className="text-2xl font-bold text-primary">{plan.price}</div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Plan Highlights */}
              <div className="space-y-3">
                {plan.description.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className={idx === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handlePlanSelect(plan.id, plan.stripeProductId || '')} 
                className={`w-full ${baseId === 'pro' ? 'bg-purple-500 hover:bg-purple-600' : ''} ${baseId === 'vip' ? 'bg-gradient-to-r from-primary to-primary-glow' : ''}`}
                disabled={disabled}
              >
                {baseId === 'free' ? t('premiumPlans.startFree') : `${t('premiumPlans.choose')} ${plan.title}`}
              </Button>
              
              {/* Botão de gerenciar assinatura se o usuário já tiver uma */}
              {subscribed && isLoggedIn && (
                <Button 
                  onClick={openCustomerPortal}
                  variant="outline"
                  className="w-full mt-2"
                >
                  {t('premiumPlans.manageSubscription')}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <ScrollArea className="h-[80vh] w-full">
      <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          {t('premiumPlans.title')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('premiumPlans.description')}
        </p>
      </div>

      {/* Currency Tabs */}
      <Tabs value={activeCurrency} onValueChange={setActiveCurrency} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="usd">🇺🇸 USD</TabsTrigger>
          <TabsTrigger value="brl">🇧🇷 BRL</TabsTrigger>
        </TabsList>

        <TabsContent value="usd" className="space-y-6">
          {renderPlansGrid(usdPlans)}
        </TabsContent>

        <TabsContent value="brl" className="space-y-6">
          {renderPlansGrid(brlPlans)}
        </TabsContent>
      </Tabs>

      {/* All Features Section */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {showAllFeatures ? t('features.hideAll') : t('features.showAll')} {t('features.included')}
            {showAllFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {showAllFeatures && (
          <Card className="bg-muted/30 max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                {t('features.allIncluded')}
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                {t('features.onlyDifference')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getAllFeatures().map((category, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      {category.icon}
                      <span className="text-sm">{category.category}</span>
                    </div>
                    <div className="space-y-1 pl-7">
                      {category.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Note */}
      <div className="text-center p-4 bg-muted/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>{t('features.tip')}</strong> {t('features.chooseTip')}
        </p>
      </div>
      </div>
    </ScrollArea>
  );
};