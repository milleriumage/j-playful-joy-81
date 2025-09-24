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