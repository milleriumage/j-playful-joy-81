-- Corrigir problemas de segurança das funções
-- Definir search_path para as funções criadas

DROP FUNCTION IF EXISTS extract_date_immutable(timestamp with time zone);
DROP FUNCTION IF EXISTS validate_media_interaction();

-- Recriar função com search_path seguro
CREATE OR REPLACE FUNCTION extract_date_immutable(timestamp with time zone)
RETURNS date AS $$
BEGIN
  RETURN $1::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public;

-- Recriar função de validação com search_path seguro
CREATE OR REPLACE FUNCTION validate_media_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Para likes: verificar se já tem 2
  IF NEW.interaction_type = 'like' THEN
    IF (SELECT COUNT(*) 
        FROM public.media_interactions 
        WHERE media_id = NEW.media_id 
        AND user_id = NEW.user_id 
        AND interaction_type = 'like') >= 2 THEN
      RAISE EXCEPTION 'Usuário já atingiu o limite de 2 likes para esta mídia';
    END IF;
  END IF;
  
  -- Para outras interações: uma por dia
  IF NEW.interaction_type IN ('share', 'view', 'click') THEN
    IF EXISTS (SELECT 1 
               FROM public.media_interactions 
               WHERE media_id = NEW.media_id 
               AND user_id = NEW.user_id 
               AND interaction_type = NEW.interaction_type
               AND extract_date_immutable(created_at) = extract_date_immutable(NEW.created_at)) THEN
      RAISE EXCEPTION 'Usuário já registrou esta interação hoje para esta mídia';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;