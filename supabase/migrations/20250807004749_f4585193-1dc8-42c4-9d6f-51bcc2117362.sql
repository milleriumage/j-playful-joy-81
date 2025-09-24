-- Criar constraint única composta para evitar duplicatas
-- Para likes: máximo 2 por usuário por mídia
-- Para outras interações: uma por usuário por mídia por dia

-- Primeiro, vamos adicionar uma constraint para evitar múltiplos likes (máximo 2)
CREATE UNIQUE INDEX idx_media_interactions_like_limit 
ON media_interactions (media_id, user_id, interaction_type)
WHERE interaction_type = 'like';

-- Para outras interações (share, view, click), uma por usuário por mídia por dia
CREATE UNIQUE INDEX idx_media_interactions_daily_unique 
ON media_interactions (media_id, user_id, interaction_type, DATE(created_at))
WHERE interaction_type IN ('share', 'view', 'click');

-- Função para verificar se usuário pode registrar like (máximo 2)
CREATE OR REPLACE FUNCTION check_like_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interaction_type = 'like' THEN
    -- Verificar quantos likes o usuário já fez para esta mídia
    IF (SELECT COUNT(*) 
        FROM media_interactions 
        WHERE media_id = NEW.media_id 
        AND user_id = NEW.user_id 
        AND interaction_type = 'like') >= 2 THEN
      RAISE EXCEPTION 'Usuário já atingiu o limite de 2 likes para esta mídia';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para verificar limite de likes
CREATE TRIGGER trigger_check_like_limit
  BEFORE INSERT ON media_interactions
  FOR EACH ROW
  EXECUTE FUNCTION check_like_limit();

-- Função para verificar se usuário pode registrar outras interações (uma por dia)
CREATE OR REPLACE FUNCTION check_daily_interaction_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interaction_type IN ('share', 'view', 'click') THEN
    -- Verificar se já existe interação do mesmo tipo hoje
    IF EXISTS (SELECT 1 
               FROM media_interactions 
               WHERE media_id = NEW.media_id 
               AND user_id = NEW.user_id 
               AND interaction_type = NEW.interaction_type
               AND DATE(created_at) = DATE(NEW.created_at)) THEN
      RAISE EXCEPTION 'Usuário já registrou esta interação hoje para esta mídia';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para verificar limite diário
CREATE TRIGGER trigger_check_daily_interaction_limit
  BEFORE INSERT ON media_interactions
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_interaction_limit();