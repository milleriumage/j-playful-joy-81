-- Atualizar função clone_template_user_data para incluir media_items
CREATE OR REPLACE FUNCTION public.clone_template_user_data(new_user_id uuid, template_user_id uuid DEFAULT '509bdca7-b48f-47ab-8150-261585a125c2'::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  -- Clonar social_icons apenas se o usuário não tiver nenhum
  IF NOT EXISTS (SELECT 1 FROM social_icons WHERE user_id = new_user_id) THEN
    INSERT INTO social_icons (user_id, icon_url, link, order_index)
    SELECT 
      new_user_id,
      icon_url,
      link,
      order_index
    FROM social_icons
    WHERE user_id = template_user_id;
  END IF;

  -- Clonar media_items apenas se o usuário não tiver nenhum
  IF NOT EXISTS (SELECT 1 FROM media_items WHERE user_id = new_user_id) THEN
    INSERT INTO media_items (
      user_id, type, storage_path, is_locked, is_blurred, is_main,
      name, description, price, link, external_link, blur_settings,
      timer_settings, pinned
    )
    SELECT 
      new_user_id,
      type,
      storage_path,
      is_locked,
      is_blurred,
      is_main,
      name,
      description,
      price,
      link,
      external_link,
      blur_settings,
      timer_settings,
      pinned
    FROM media_items
    WHERE user_id = template_user_id;
  END IF;

  -- Criar subscription padrão apenas se não existir
  INSERT INTO subscriptions (user_id, plan, status, credits)
  VALUES (new_user_id, 'free', 'active', 80)
  ON CONFLICT (user_id) DO UPDATE SET
    credits = GREATEST(subscriptions.credits, 80);

  RAISE NOTICE 'Successfully cloned template data for user %', new_user_id;
END;
$$;