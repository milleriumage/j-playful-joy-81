-- Teste: Criar uma função para testar configurações de visibilidade
CREATE OR REPLACE FUNCTION test_visibility_settings(test_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;