-- Add expires_at column to blocked_users table for temporary blocks
ALTER TABLE public.blocked_users 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to check if a user is currently blocked (considering expiration)
CREATE OR REPLACE FUNCTION public.is_user_currently_blocked(p_creator_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.blocked_users 
    WHERE creator_id = p_creator_id 
    AND blocked_user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > now())
  );
$function$

-- Create function to clean expired blocks automatically
CREATE OR REPLACE FUNCTION public.clean_expired_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.blocked_users 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$function$