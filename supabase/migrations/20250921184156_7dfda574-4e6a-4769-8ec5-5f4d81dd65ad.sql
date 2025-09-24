-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.calculate_net_withdrawal(p_creator_id UUID, p_amount NUMERIC)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix request withdrawal function
CREATE OR REPLACE FUNCTION public.request_withdrawal(p_creator_id UUID, p_amount NUMERIC, p_payment_method TEXT DEFAULT 'pix', p_payment_details JSONB DEFAULT '{}')
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;