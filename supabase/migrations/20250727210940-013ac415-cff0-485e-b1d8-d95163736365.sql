-- Criar função para verificar acesso do usuário
CREATE OR REPLACE FUNCTION public.check_user_access(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.usuarios 
    WHERE user_id = user_uuid 
    AND acesso = true
  );
$function$;