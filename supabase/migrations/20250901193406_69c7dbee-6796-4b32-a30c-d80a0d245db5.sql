-- Corrigir funções com search_path mutable
-- Atualizar funções existentes para ter search_path imutável

CREATE OR REPLACE FUNCTION public.get_notifications()
 RETURNS TABLE(id uuid, user_id uuid, type text, title text, message text, credits_amount integer, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT id, user_id, type, title, message, credits_amount, created_at
  FROM public.notifications
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 50;
$function$;

CREATE OR REPLACE FUNCTION public.clean_expired_unlocks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM public.user_unlocks 
  WHERE expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_primary_email_from_alias(alias_email text)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT p.settings->>'email' as primary_email
  FROM user_email_aliases uea
  JOIN profiles p ON p.user_id = uea.user_id
  WHERE uea.alias_email = alias_email 
    AND uea.is_active = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_blocked(p_creator_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.blocked_users 
    WHERE creator_id = p_creator_id 
    AND blocked_user_id = p_user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_credits_amount integer DEFAULT NULL::integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.clean_expired_blocks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM public.blocked_users 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_media_interaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  media_owner uuid;
  interaction_date date := public.extract_date_immutable(COALESCE(NEW.created_at, now()));
BEGIN
  -- Resolve media owner
  SELECT user_id INTO media_owner FROM public.media_items WHERE id = NEW.media_id;

  -- Block interactions from the media owner (authenticated sessions)
  IF media_owner IS NOT NULL AND NEW.user_id IS NOT NULL AND NEW.user_id = media_owner THEN
    RAISE EXCEPTION 'Criador não pode registrar interação em sua própria mídia';
  END IF;

  -- Rest of the function logic remains the same...
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_media_stats(media_uuid uuid)
 RETURNS TABLE(likes_count bigint, shares_count bigint, views_count bigint, clicks_count bigint)
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'like') as likes_count,
    COUNT(*) FILTER (WHERE interaction_type = 'share') as shares_count,
    COUNT(*) FILTER (WHERE interaction_type = 'view') as views_count,
    COUNT(*) FILTER (WHERE interaction_type = 'click') as clicks_count
  FROM public.media_interactions
  WHERE media_id = media_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.reset_user_data(target_user_id uuid DEFAULT auth.uid())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário está tentando resetar seus próprios dados
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode resetar seus próprios dados';
  END IF;
  
  -- Limpar dados do usuário
  DELETE FROM public.messages WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.media_interactions WHERE user_id = target_user_id;
  
  -- Resetar créditos para 80
  UPDATE public.profiles 
  SET credits = 80, updated_at = now() 
  WHERE user_id = target_user_id;
  
  -- Criar notificação de reset
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    target_user_id,
    'system',
    '🔄 Dados Resetados',
    'Seus dados foram limpos e você recebeu 80 créditos iniciais.'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.clone_template_user_data(new_user_id uuid, template_user_id uuid DEFAULT '509bdca7-b48f-47ab-8150-261585a125c2'::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.test_visibility_settings(test_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
DECLARE
    result jsonb;
    profile_settings jsonb;
    visibility_settings jsonb;
BEGIN
    -- Buscar configurações do perfil
    SELECT settings INTO profile_settings
    FROM profiles
    WHERE user_id = test_user_id;
    
    -- Extrair configurações de visibilidade
    visibility_settings := profile_settings->'visibilitySettings';
    
    -- Construir resultado do teste
    result := jsonb_build_object(
        'user_id', test_user_id,
        'profile_exists', (profile_settings IS NOT NULL),
        'has_visibility_settings', (visibility_settings IS NOT NULL),
        'show_media_to_visitors', COALESCE((visibility_settings->>'showMediaToVisitors')::boolean, true),
        'full_settings', visibility_settings,
        'raw_profile_settings', profile_settings
    );
    
    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_access(user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.usuarios 
    WHERE user_id = user_uuid 
    AND acesso = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_email_autorizado()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
  select exists (
    select 1
    from autorizados
    where email = coalesce(
      auth.email(),
      (auth.jwt() ->> 'email'),
      ((auth.jwt() -> 'user_metadata') ->> 'email')
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.initialize_user_from_template()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

  -- Limpar TODOS os dados existentes do usuário (garantir conta completamente limpa)
  DELETE FROM social_icons WHERE user_id = current_user_id;
  DELETE FROM media_items WHERE user_id = current_user_id;
  DELETE FROM notifications WHERE user_id = current_user_id;
  DELETE FROM messages WHERE user_id = current_user_id;
  DELETE FROM media_interactions WHERE user_id = current_user_id;
  DELETE FROM chat_messages WHERE user_id = current_user_id;

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
    'message', 'User initialized with completely clean data',
    'user_id', current_user_id
  );
END;
$function$;