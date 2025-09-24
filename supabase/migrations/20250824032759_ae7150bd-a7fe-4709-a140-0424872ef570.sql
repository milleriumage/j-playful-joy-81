-- Create secure unlock function that handles credit deduction server-side
CREATE OR REPLACE FUNCTION public.create_and_spend_unlock(
  media_id_param uuid,
  unlock_type_param text DEFAULT 'default',
  duration_minutes_param int DEFAULT 60
)
RETURNS SETOF user_unlocks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  credits_to_spend_const int := 5; -- Fixed unlock cost on server
  user_id_from_jwt uuid;
  user_credits int;
  expires_at_timestamp timestamp with time zone;
  new_unlock user_unlocks;
BEGIN
  -- Get user ID from JWT token
  SELECT auth.uid() INTO user_id_from_jwt;
  
  IF user_id_from_jwt IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if media is already unlocked
  IF EXISTS (
    SELECT 1 FROM user_unlocks 
    WHERE user_id = user_id_from_jwt 
    AND media_id = media_id_param 
    AND unlock_type = unlock_type_param
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Media already unlocked';
  END IF;

  -- Get current user credits from profiles table
  SELECT credits FROM profiles WHERE user_id = user_id_from_jwt INTO user_credits;

  IF user_credits IS NULL OR user_credits < credits_to_spend_const THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', credits_to_spend_const, COALESCE(user_credits, 0);
  END IF;

  -- Calculate expiration time
  expires_at_timestamp := now() + (duration_minutes_param || ' minutes')::interval;

  -- Start transaction: Insert unlock and deduct credits atomically
  INSERT INTO user_unlocks (user_id, media_id, unlock_type, expires_at, credits_spent)
  VALUES (user_id_from_jwt, media_id_param, unlock_type_param, expires_at_timestamp, credits_to_spend_const)
  RETURNING * INTO new_unlock;

  -- Deduct credits from user profile
  UPDATE profiles 
  SET credits = credits - credits_to_spend_const, updated_at = now()
  WHERE user_id = user_id_from_jwt;

  -- Create notification about credit deduction
  INSERT INTO notifications (user_id, type, title, message, credits_amount)
  VALUES (
    user_id_from_jwt,
    'credit_deduction',
    '💳 Créditos Gastos',
    'Você gastou ' || credits_to_spend_const || ' créditos para desbloquear mídia',
    credits_to_spend_const
  );

  RETURN NEXT new_unlock;
END;
$$;