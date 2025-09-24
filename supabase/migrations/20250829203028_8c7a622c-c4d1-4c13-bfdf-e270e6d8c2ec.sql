-- Create function to get user ID by email from auth.users
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_uuid uuid;
BEGIN
  -- Search in auth.users table for the email
  SELECT au.id INTO user_uuid
  FROM auth.users au
  WHERE au.email = get_user_id_by_email.email
  LIMIT 1;
  
  RETURN user_uuid;
END;
$function$;