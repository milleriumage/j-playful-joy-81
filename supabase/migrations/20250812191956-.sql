-- Permitir acesso anônimo completo ao conteúdo do criador

-- Permitir usuários anônimos visualizarem mensagens do chat
CREATE POLICY "Anonymous users can view all messages" 
ON public.messages 
FOR SELECT 
USING (true);

-- Permitir usuários anônimos visualizarem chat messages  
CREATE POLICY "Anonymous users can view all chat messages"
ON public.chat_messages 
FOR SELECT 
USING (true);

-- Permitir usuários anônimos visualizarem configurações de usuário (para visibilidade)
CREATE POLICY "Anonymous users can view user settings"
ON public.user_settings 
FOR SELECT 
USING (true);

-- Permitir usuários anônimos visualizarem métricas de mídia
CREATE POLICY "Anonymous users can view all media metrics"
ON public.media_metrics 
FOR SELECT 
USING (true);

-- Permitir usuários anônimos visualizarem notificações (se necessário para o criador)
CREATE POLICY "Anonymous users can view notifications"
ON public.notifications 
FOR SELECT 
USING (true);