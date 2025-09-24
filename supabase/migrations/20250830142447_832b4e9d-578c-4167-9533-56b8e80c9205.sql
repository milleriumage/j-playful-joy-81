-- Criar tabela para gerenciar usuários bloqueados
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL, -- ID do criador da página
  blocked_user_id UUID NOT NULL, -- ID do usuário que foi bloqueado
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creator_id, blocked_user_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Creators can manage their own blocked users"
ON public.blocked_users
FOR ALL
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can view their blocked users"
ON public.blocked_users
FOR SELECT
USING (auth.uid() = creator_id);

-- Função para verificar se um usuário está bloqueado
CREATE OR REPLACE FUNCTION public.is_user_blocked(p_creator_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.blocked_users 
    WHERE creator_id = p_creator_id 
    AND blocked_user_id = p_user_id
  );
$$;