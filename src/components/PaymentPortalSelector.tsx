import React, { useState } from 'react';
import { CreditCard, Globe, Plus, Crown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentPortalSelectorProps {
  disabled?: boolean;
  mode?: 'portal' | 'checkout';
  planData?: {
    id: string;
    productId: string;
    name: string;
  };
}

export const PaymentPortalSelector = ({ 
  disabled = false, 
  mode = 'portal', 
  planData 
}: PaymentPortalSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'BR' | 'US'>('BR');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (mode === 'portal') {
        const { data, error } = await supabase.functions.invoke('create-portal-session', {
          body: { 
            country: selectedRegion 
          }
        });

        if (error) throw error;
        
        // Open Stripe portal in new tab
        window.open(data.url, '_blank');
      } else if (mode === 'checkout' && planData) {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            planId: planData.id,
            stripeProductId: planData.productId,
            country: selectedRegion 
          }
        });

        if (error) throw error;
        
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(mode === 'portal' ? "Erro ao acessar portal de pagamento" : "Erro ao criar sessão de checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = {
    BR: [
      { name: 'Cartão de Crédito', icon: '💳', available: true },
      { name: 'Google Pay', icon: '🟢', available: true },
      { name: 'Apple Pay', icon: '🍎', available: true },
      { name: 'PIX', icon: '🇧🇷', available: true }
    ],
    US: [
      { name: 'Cartão de Crédito', icon: '💳', available: true },
      { name: 'Google Pay', icon: '🟢', available: true },
      { name: 'Apple Pay', icon: '🍎', available: true },
      { name: 'PIX', icon: '🇧🇷', available: false }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none" 
          disabled={disabled}
        >
          {mode === 'checkout' ? (
            <>
              <Plus className="w-4 h-4 mr-2" />
              <span>Assinar {planData?.name}</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              <span>Pagamento</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Globe className="w-5 h-5" />
            {mode === 'checkout' ? `Assinar ${planData?.name}` : 'Gerenciar Pagamento'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedRegion} onValueChange={(value) => setSelectedRegion(value as 'BR' | 'US')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="BR" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🇧🇷 Brasil (BRL)
            </TabsTrigger>
            <TabsTrigger value="US" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🇺🇸 USA (USD)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="BR" className="mt-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="w-full p-2 bg-background hover:bg-secondary">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Status da Assinatura</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Gerenciar sua assinatura e métodos de pagamento</span>
                    </div>
                    
                    <div className="bg-secondary/50 rounded p-2">
                      <div className="text-xs text-center">
                        Portal de Pagamento Stripe
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={handleAction}
                        disabled={isLoading}
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        {isLoading ? 'Carregando...' : 'Gerenciar'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="US" className="mt-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="w-full p-2 bg-background hover:bg-secondary">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Status da Assinatura</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Gerenciar sua assinatura e métodos de pagamento</span>
                    </div>
                    
                    <div className="bg-secondary/50 rounded p-2">
                      <div className="text-xs text-center">
                        Portal de Pagamento Stripe
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={handleAction}
                        disabled={isLoading}
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        {isLoading ? 'Carregando...' : 'Gerenciar'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Button 
          onClick={handleAction}
          disabled={isLoading}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          {isLoading 
            ? 'Carregando...' 
            : mode === 'checkout' 
              ? `Assinar ${planData?.name}` 
              : 'Gerenciar Pagamento'
          }
        </Button>
      </DialogContent>
    </Dialog>
  );
};