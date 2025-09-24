import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
interface AddCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const creditOptions = [{
  credits: 100,
  price: 1.00,
  stripeProductId: "prod_SyYehlUkfzq9Qn"
}, {
  credits: 200,
  price: 2.00,
  stripeProductId: "prod_SgmKa6MdTZ3XVr"
}, {
  credits: 500,
  price: 5.00,
  stripeProductId: "prod_SyYeStqRDuWGFF"
}, {
  credits: 1000,
  price: 10.00,
  stripeProductId: "prod_SyYfzJ1fjz9zb9"
}];
const customOptions = [{
  credits: 2500,
  price: 25.00,
  stripeProductId: "prod_SyYmVrUetdiIBY"
}, {
  credits: 5000,
  price: 50.00,
  stripeProductId: "prod_SyYg54VfiOr7LQ"
}, {
  credits: 10000,
  price: 100.00,
  stripeProductId: "prod_SyYhva8A2beAw6"
}];
export function AddCreditsDialog({
  open,
  onOpenChange
}: AddCreditsDialogProps) {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState(creditOptions[3]); // Default to 100 credits
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const getCurrentSelection = () => {
    if (customAmount) {
      const customOption = customOptions.find(opt => opt.credits === customAmount);
      return customOption || {
        credits: customAmount,
        price: customAmount * 0.01  // Updated: $1 = 100 credits
      };
    }
    return selectedOption;
  };
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const selection = getCurrentSelection();
      const {
        data,
        error
      } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: Math.round(selection.price * 100),
          // Convert to cents
          credits: selection.credits,
          productId: 'stripeProductId' in selection ? selection.stripeProductId : null
        }
      });
      if (error) throw error;
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  const selection = getCurrentSelection();
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto backdrop-blur-md border border-green-500/30 shadow-lg shadow-green-500/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-400/10 before:to-emerald-500/10 before:rounded-lg before:pointer-events-none bg-green-400">
         <DialogHeader className="pb-4 border-b">
           <DialogTitle className="text-lg font-semibold">
             {t('addCredits.title')}
           </DialogTitle>
         </DialogHeader>
         
         <div className="space-y-6">
           <p className="text-sm text-muted-foreground">
             {t('addCredits.description')}
           </p>

          <RadioGroup value={customAmount ? "" : selectedOption.credits.toString()} onValueChange={value => {
          const option = creditOptions.find(opt => opt.credits.toString() === value);
          if (option) {
            setSelectedOption(option);
            setCustomAmount(null);
          }
        }} className="grid grid-cols-2 gap-4">
            {creditOptions.map(option => <div key={option.credits} className="flex items-center space-x-2">
                <RadioGroupItem value={option.credits.toString()} id={`credits-${option.credits}`} />
                <Label htmlFor={`credits-${option.credits}`} className="text-sm cursor-pointer">
                  {option.credits} créditos - ${option.price.toFixed(2)}
                </Label>
              </div>)}
          </RadioGroup>

           <div className="space-y-2">
             <Label htmlFor="custom-amount" className="text-sm font-medium">
               {t('addCredits.customAmount')}
             </Label>
             <Select value={customAmount?.toString() || ""} onValueChange={value => {
             if (value) {
               setCustomAmount(parseInt(value));
               setSelectedOption(creditOptions[0]); // Reset radio selection
             } else {
               setCustomAmount(null);
             }
           }}>
               <SelectTrigger>
                 <SelectValue placeholder={t('addCredits.selectAmount')} />
               </SelectTrigger>
               <SelectContent>
                 {customOptions.map(option => <SelectItem key={option.credits} value={option.credits.toString()}>
                     {option.credits} {t('addCredits.credits')} - ${option.price.toFixed(2)}
                   </SelectItem>)}
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-2 pt-4 border-t">
             <div className="flex justify-between items-center">
               <span className="font-medium">{t('addCredits.total')}</span>
               <span className="font-bold text-lg">${selection.price.toFixed(2)}</span>
             </div>
             <p className="text-sm text-muted-foreground">
               {t('addCredits.willReceive')} {selection.credits} {t('addCredits.credits')}
             </p>
           </div>

           <Button onClick={handlePayment} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
             {isLoading ? t('addCredits.processing') : t('addCredits.continuePayment')}
           </Button>
        </div>
      </DialogContent>
    </Dialog>;
}