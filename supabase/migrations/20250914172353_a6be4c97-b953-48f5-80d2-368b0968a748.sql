-- Criar tabela de referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_vip_subscriber BOOLEAN DEFAULT false,
  vip_subscription_date TIMESTAMP WITH TIME ZONE,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  commission_paid BOOLEAN DEFAULT false,
  commission_release_date TIMESTAMP WITH TIME ZONE
);

-- Tabela para configurações de pagamento do criador
CREATE TABLE public.creator_payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL UNIQUE,
  paypal_email TEXT,
  stripe_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para presentes enviados
CREATE TABLE public.referral_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  recipient_user_id UUID NOT NULL,
  credits_amount INTEGER NOT NULL DEFAULT 100,
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  thanked BOOLEAN DEFAULT false,
  thank_message TEXT,
  thanked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies para referrals
CREATE POLICY "Creators can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can insert referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update referrals" 
ON public.referrals 
FOR UPDATE 
USING (true);

-- RLS Policies para creator_payment_settings
CREATE POLICY "Creators can manage their payment settings" 
ON public.creator_payment_settings 
FOR ALL 
USING (auth.uid() = creator_id);

-- RLS Policies para referral_gifts
CREATE POLICY "Creators can view their own gifts" 
ON public.referral_gifts 
FOR SELECT 
USING (auth.uid() = creator_id OR auth.uid() = recipient_user_id);

CREATE POLICY "Creators can send gifts" 
ON public.referral_gifts 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Recipients can update thank status" 
ON public.referral_gifts 
FOR UPDATE 
USING (auth.uid() = recipient_user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_creator_payment_settings_updated_at
BEFORE UPDATE ON public.creator_payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();