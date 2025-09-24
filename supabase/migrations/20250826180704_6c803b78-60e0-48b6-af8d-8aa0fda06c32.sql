-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;  
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Criar políticas permissivas para chat compartilhável
-- Permitir que qualquer pessoa veja todas as mensagens (chat público)
CREATE POLICY "Anyone can view all messages for shared chat" 
ON messages FOR SELECT 
USING (true);

-- Permitir que qualquer pessoa envie mensagens (visitantes + logados)
CREATE POLICY "Anyone can send messages to shared chat" 
ON messages FOR INSERT 
WITH CHECK (true);

-- Apenas usuários autenticados podem atualizar suas próprias mensagens
CREATE POLICY "Users can update their own messages" 
ON messages FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Apenas usuários autenticados podem deletar suas próprias mensagens  
CREATE POLICY "Users can delete their own messages" 
ON messages FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);