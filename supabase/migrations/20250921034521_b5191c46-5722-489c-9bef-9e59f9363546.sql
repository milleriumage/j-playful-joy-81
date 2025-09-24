-- Fix the create_notification function to allow INSERT operations
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, integer);

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid, 
  p_type text, 
  p_title text, 
  p_message text, 
  p_credits_amount integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, credits_amount)
  VALUES (p_user_id, p_type, p_title, p_message, p_credits_amount)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;