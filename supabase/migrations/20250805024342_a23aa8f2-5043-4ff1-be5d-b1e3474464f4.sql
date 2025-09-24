-- Corrigir a função get_notifications para filtrar por usuário
CREATE OR REPLACE FUNCTION public.get_notifications()
RETURNS TABLE(id uuid, user_id uuid, type text, title text, message text, credits_amount integer, created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id, user_id, type, title, message, credits_amount, created_at
  FROM public.notifications
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 50;
$function$

-- Atualizar as RLS policies para garantir isolamento total
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);