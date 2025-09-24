-- Create sales_history table for tracking purchases and withdrawals
CREATE TABLE public.sales_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  media_id UUID NOT NULL,
  credits_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  purchase_type TEXT NOT NULL DEFAULT 'credit_purchase',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  thank_message TEXT,
  thanked BOOLEAN DEFAULT false,
  thanked_at TIMESTAMP WITH TIME ZONE
);

-- Create creator_withdrawals table for tracking withdrawal requests
CREATE TABLE public.creator_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  fee_percentage NUMERIC NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creator_earnings_stats table for aggregated data
CREATE TABLE public.creator_earnings_stats (
  creator_id UUID NOT NULL PRIMARY KEY,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  pending_amount NUMERIC NOT NULL DEFAULT 0,
  last_withdrawal TIMESTAMP WITH TIME ZONE,
  next_withdrawal_available TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_earnings_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_history
CREATE POLICY "Creators can view their sales" 
ON public.sales_history 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Buyers can view their purchases" 
ON public.sales_history 
FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Anyone can insert sales" 
ON public.sales_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Creators can update thank messages" 
ON public.sales_history 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies for creator_withdrawals
CREATE POLICY "Creators can manage their withdrawals" 
ON public.creator_withdrawals 
FOR ALL 
USING (auth.uid() = creator_id);

-- RLS Policies for creator_earnings_stats
CREATE POLICY "Creators can view their earnings stats" 
ON public.creator_earnings_stats 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can update their earnings stats" 
ON public.creator_earnings_stats 
FOR ALL 
USING (auth.uid() = creator_id);

-- Function to update earnings stats when a sale is made
CREATE OR REPLACE FUNCTION public.update_creator_earnings_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert or update creator earnings stats
    INSERT INTO public.creator_earnings_stats (creator_id, total_earned, updated_at)
    VALUES (NEW.creator_id, NEW.credits_amount, now())
    ON CONFLICT (creator_id)
    DO UPDATE SET
      total_earned = creator_earnings_stats.total_earned + NEW.credits_amount,
      updated_at = now();
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate net withdrawal amount
CREATE OR REPLACE FUNCTION public.calculate_net_withdrawal(p_creator_id UUID, p_amount NUMERIC)
RETURNS JSON AS $$
DECLARE
  available_credits INTEGER;
  fee_percentage NUMERIC := 30;
  net_amount NUMERIC;
  result JSON;
BEGIN
  -- Get available credits
  SELECT total_earned - COALESCE(total_withdrawn, 0) 
  INTO available_credits
  FROM creator_earnings_stats
  WHERE creator_id = p_creator_id;
  
  IF available_credits IS NULL OR available_credits < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits for withdrawal'
    );
  END IF;
  
  -- Calculate net amount after 30% fee
  net_amount := p_amount * (100 - fee_percentage) / 100;
  
  RETURN json_build_object(
    'success', true,
    'gross_amount', p_amount,
    'net_amount', net_amount,
    'fee_percentage', fee_percentage,
    'available_credits', available_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to request withdrawal
CREATE OR REPLACE FUNCTION public.request_withdrawal(p_creator_id UUID, p_amount NUMERIC, p_payment_method TEXT DEFAULT 'pix', p_payment_details JSONB DEFAULT '{}')
RETURNS JSON AS $$
DECLARE
  calc_result JSON;
  net_amount NUMERIC;
  withdrawal_id UUID;
  next_available TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Calculate withdrawal details
  calc_result := calculate_net_withdrawal(p_creator_id, p_amount);
  
  IF NOT (calc_result->>'success')::BOOLEAN THEN
    RETURN calc_result;
  END IF;
  
  net_amount := (calc_result->>'net_amount')::NUMERIC;
  
  -- Set next withdrawal availability (7 days from now)
  next_available := now() + INTERVAL '7 days';
  
  -- Insert withdrawal request
  INSERT INTO creator_withdrawals (creator_id, amount, net_amount, payment_method, payment_details)
  VALUES (p_creator_id, p_amount, net_amount, p_payment_method, p_payment_details)
  RETURNING id INTO withdrawal_id;
  
  -- Update earnings stats
  UPDATE creator_earnings_stats
  SET 
    pending_amount = pending_amount + p_amount,
    next_withdrawal_available = next_available,
    updated_at = now()
  WHERE creator_id = p_creator_id;
  
  RETURN json_build_object(
    'success', true,
    'withdrawal_id', withdrawal_id,
    'gross_amount', p_amount,
    'net_amount', net_amount,
    'next_available', next_available
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update earnings stats on sales
CREATE TRIGGER update_earnings_stats_trigger
  AFTER INSERT ON public.sales_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_creator_earnings_stats();

-- Add updated_at trigger for all tables
CREATE TRIGGER update_sales_history_updated_at
  BEFORE UPDATE ON public.sales_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_withdrawals_updated_at
  BEFORE UPDATE ON public.creator_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_earnings_stats_updated_at
  BEFORE UPDATE ON public.creator_earnings_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();