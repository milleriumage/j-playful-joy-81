-- Criar tabela de seguidores
CREATE TABLE public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  follower_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creator_id, follower_id)
);

-- Habilitar RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Políticas para visualizar seguidores
CREATE POLICY "Anyone can view followers" 
ON public.followers 
FOR SELECT 
USING (true);

-- Políticas para seguir/desseguir
CREATE POLICY "Users can follow creators" 
ON public.followers 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow creators" 
ON public.followers 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Função para contar seguidores
CREATE OR REPLACE FUNCTION public.get_followers_count(creator_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)
  FROM public.followers
  WHERE creator_id = creator_uuid;
$$;