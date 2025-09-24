-- Remover constraints que falharam
DROP INDEX IF EXISTS idx_media_interactions_like_limit;
DROP INDEX IF EXISTS idx_media_interactions_daily_unique;
DROP TRIGGER IF EXISTS trigger_check_like_limit ON media_interactions;
DROP TRIGGER IF EXISTS trigger_check_daily_interaction_limit ON media_interactions;
DROP FUNCTION IF EXISTS check_like_limit();
DROP FUNCTION IF EXISTS check_daily_interaction_limit();

-- Criar função imutável para extrair data
CREATE OR REPLACE FUNCTION extract_date_immutable(timestamp with time zone)
RETURNS date AS $$
BEGIN
  RETURN $1::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Constraints únicas mais simples
-- Para likes: permitir apenas 2 por usuário por mídia
ALTER TABLE media_interactions ADD CONSTRAINT unique_user_media_like 
UNIQUE (media_id, user_id, interaction_type) DEFERRABLE INITIALLY DEFERRED;

-- Função para verificar limites antes de inserir
CREATE OR REPLACE FUNCTION validate_media_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Para likes: verificar se já tem 2
  IF NEW.interaction_type = 'like' THEN
    IF (SELECT COUNT(*) 
        FROM media_interactions 
        WHERE media_id = NEW.media_id 
        AND user_id = NEW.user_id 
        AND interaction_type = 'like') >= 2 THEN
      RAISE EXCEPTION 'Usuário já atingiu o limite de 2 likes para esta mídia';
    END IF;
  END IF;
  
  -- Para outras interações: uma por dia
  IF NEW.interaction_type IN ('share', 'view', 'click') THEN
    IF EXISTS (SELECT 1 
               FROM media_interactions 
               WHERE media_id = NEW.media_id 
               AND user_id = NEW.user_id 
               AND interaction_type = NEW.interaction_type
               AND extract_date_immutable(created_at) = extract_date_immutable(NEW.created_at)) THEN
      RAISE EXCEPTION 'Usuário já registrou esta interação hoje para esta mídia';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger de validação
CREATE TRIGGER validate_interaction_limits
  BEFORE INSERT ON media_interactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_media_interaction();