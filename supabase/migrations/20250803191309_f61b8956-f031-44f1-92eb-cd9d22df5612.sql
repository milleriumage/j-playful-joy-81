-- Modificar a função para limpar dados ao invés de clonar do template
CREATE OR REPLACE FUNCTION public.initialize_user_from_template()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  result jsonb;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Verificar se já foi inicializado
  IF EXISTS (SELECT 1 FROM user_settings WHERE user_id = current_user_id AND initialized = true) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User already initialized',
      'user_id', current_user_id
    );
  END IF;

  -- Limpar dados existentes do usuário (garantir conta limpa)
  DELETE FROM social_icons WHERE user_id = current_user_id;
  DELETE FROM media_items WHERE user_id = current_user_id;

  -- Criar configurações básicas do usuário (sem dados do template)
  INSERT INTO user_settings (user_id, visual_config, adaptive_test_state, last_login, initialized)
  VALUES (
    current_user_id,
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    visual_config = '{}'::jsonb,
    adaptive_test_state = '{}'::jsonb,
    initialized = true,
    updated_at = now();

  -- Criar subscription padrão apenas se não existir
  INSERT INTO subscriptions (user_id, plan, status, credits)
  VALUES (current_user_id, 'free', 'active', 80)
  ON CONFLICT (user_id) DO UPDATE SET
    credits = GREATEST(subscriptions.credits, 80);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User initialized with clean data',
    'user_id', current_user_id
  );
END;
$function$