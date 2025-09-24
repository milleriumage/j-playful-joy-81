-- Criar função para buscar notificações
CREATE OR REPLACE FUNCTION public.get_notifications()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  type text,
  title text,
  message text,
  credits_amount integer,
  created_at timestamp with time zone
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, user_id, type, title, message, credits_amount, created_at
  FROM public.notifications
  ORDER BY created_at DESC
  LIMIT 50;
$$;

-- Criar função para criar notificações
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
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, credits_amount)
  VALUES (p_user_id, p_type, p_title, p_message, p_credits_amount)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;