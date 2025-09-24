-- Atualizar função para criar usuário com 80 créditos e dados isolados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Inserir perfil do usuário com 80 créditos
  INSERT INTO public.profiles (user_id, display_name, avatar_url, credits)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    80
  );
  
  -- Limpar qualquer dado residual (garantir isolamento)
  -- Nota: isso é uma precaução extra, as RLS policies já devem isolar
  DELETE FROM public.notifications WHERE user_id = NEW.id;
  DELETE FROM public.media_interactions WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Garantir que mensagens sejam isoladas por sessão/usuário (opcional)
-- Adicionar coluna user_id se não existir na tabela messages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'user_id') THEN
        ALTER TABLE public.messages ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Atualizar políticas RLS para mensagens (isolamento por usuário)
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;
DROP POLICY IF EXISTS "Only authenticated users can delete messages" ON public.messages;
DROP POLICY IF EXISTS "Only authenticated users can update messages" ON public.messages;

-- Novas políticas para isolamento por usuário
CREATE POLICY "Users can insert their own messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Atualizar políticas de notificações para isolamento total por usuário
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Função para limpar dados do usuário (reset individual)
CREATE OR REPLACE FUNCTION public.reset_user_data(target_user_id uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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