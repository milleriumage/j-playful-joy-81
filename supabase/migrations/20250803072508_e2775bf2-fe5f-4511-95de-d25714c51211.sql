-- Primeiro, vamos configurar um usuário template (vou usar o primeiro usuário existente)
-- e criar dados modelo para ele

INSERT INTO user_settings (user_id, visual_config, adaptive_test_state, initialized, last_login)
VALUES (
  '509bdca7-b48f-47ab-8150-261585a125c2',
  '{
    "theme": "dark", 
    "layout": "modern", 
    "blur_default": 0.5,
    "timer_default": 60,
    "autoplay": true,
    "show_metrics": true
  }',
  '{
    "current_step": 1,
    "completed_tests": [],
    "preferences": {"difficulty": "medium"}
  }',
  true,
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  visual_config = EXCLUDED.visual_config,
  adaptive_test_state = EXCLUDED.adaptive_test_state,
  initialized = true,
  updated_at = now();

-- Criar alguns ícones sociais modelo
INSERT INTO social_icons (user_id, icon_url, link, order_index) VALUES
('509bdca7-b48f-47ab-8150-261585a125c2', 'https://cdn.jsdelivr.net/npm/lucide@latest/icons/instagram.svg', 'https://instagram.com', 1),
('509bdca7-b48f-47ab-8150-261585a125c2', 'https://cdn.jsdelivr.net/npm/lucide@latest/icons/twitter.svg', 'https://twitter.com', 2),
('509bdca7-b48f-47ab-8150-261585a125c2', 'https://cdn.jsdelivr.net/npm/lucide@latest/icons/facebook.svg', 'https://facebook.com', 3)
ON CONFLICT DO NOTHING;

-- Atualizar a função clone_template_user_data para usar o template correto
CREATE OR REPLACE FUNCTION public.clone_template_user_data(new_user_id uuid, template_user_id uuid DEFAULT '509bdca7-b48f-47ab-8150-261585a125c2'::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário já foi inicializado
  IF EXISTS (SELECT 1 FROM user_settings WHERE user_id = new_user_id AND initialized = true) THEN
    RETURN; -- Já inicializado
  END IF;

  -- Verificar se o template existe e está inicializado
  IF NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = template_user_id AND initialized = true) THEN
    RAISE NOTICE 'Template user % not found or not initialized', template_user_id;
    RETURN;
  END IF;

  -- Clonar user_settings
  INSERT INTO user_settings (user_id, visual_config, adaptive_test_state, last_login, initialized)
  SELECT 
    new_user_id,
    visual_config,
    adaptive_test_state,
    now(),
    true
  FROM user_settings
  WHERE user_id = template_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    visual_config = EXCLUDED.visual_config,
    adaptive_test_state = EXCLUDED.adaptive_test_state,
    initialized = true,
    updated_at = now();

  -- Clonar social_icons
  INSERT INTO social_icons (user_id, icon_url, link, order_index)
  SELECT 
    new_user_id,
    icon_url,
    link,
    order_index
  FROM social_icons
  WHERE user_id = template_user_id;

  -- Criar subscription padrão
  INSERT INTO subscriptions (user_id, plan, status, credits)
  VALUES (new_user_id, 'free', 'active', 80)
  ON CONFLICT (user_id) DO UPDATE SET
    credits = GREATEST(subscriptions.credits, 80);

  RAISE NOTICE 'Successfully cloned template data for user %', new_user_id;
END;
$$;

-- Criar uma RPC pública para chamar a função de clonagem
CREATE OR REPLACE FUNCTION public.initialize_user_from_template()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Clonar dados do template
  PERFORM clone_template_user_data(current_user_id);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User initialized from template',
    'user_id', current_user_id
  );
END;
$$;