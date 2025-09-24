-- Limpar medias sem user_id (dados órfãos)
DELETE FROM media_items WHERE user_id IS NULL;

-- Limpar notificações sem user_id
DELETE FROM notifications WHERE user_id IS NULL;

-- Atualizar RLS policy para media_items - deve garantir isolamento por usuário
DROP POLICY IF EXISTS "Media items are viewable by everyone" ON media_items;

-- Nova policy mais restrita: apenas o dono pode ver suas medias
CREATE POLICY "Users can view own media only" 
ON media_items 
FOR SELECT 
USING (user_id = auth.uid());

-- Garantir que media_items sempre tenha user_id
ALTER TABLE media_items ALTER COLUMN user_id SET NOT NULL;