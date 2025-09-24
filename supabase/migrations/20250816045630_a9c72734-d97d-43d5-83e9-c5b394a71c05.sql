-- Remover a política restritiva que impede usuários logados de ver mídia de outros criadores
DROP POLICY IF EXISTS "Users can view own media only" ON media_items;

-- Criar uma política mais aberta que permite que todos vejam todas as mídias
-- (tanto usuários logados quanto anônimos)
CREATE POLICY "Public read access to all media" 
ON media_items 
FOR SELECT 
USING (true);

-- Garantir que as outras tabelas também tenham acesso público adequado
-- Remover política duplicada de social_icons
DROP POLICY IF EXISTS "Social icons are viewable by everyone" ON social_icons;

-- Remover política duplicada de profiles
DROP POLICY IF EXISTS "Anonymous users can view profiles" ON profiles;