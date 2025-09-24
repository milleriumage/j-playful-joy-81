-- Criar tabela para armazenar curtidas de mídia
CREATE TABLE IF NOT EXISTS public.media_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL,
  user_id UUID NULL, -- NULL para usuários guests
  guest_session_id TEXT NULL, -- Para rastrear guests
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_ip TEXT NULL, -- Para evitar duplicatas de guests
  UNIQUE(media_id, user_id), -- Evita curtidas duplicadas de usuários logados
  UNIQUE(media_id, guest_session_id) -- Evita curtidas duplicadas de guests
);

-- Habilitar RLS
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

-- Política para qualquer um inserir curtidas
CREATE POLICY "Anyone can like media" ON public.media_likes
  FOR INSERT WITH CHECK (true);

-- Política para visualizar curtidas
CREATE POLICY "Anyone can view likes" ON public.media_likes
  FOR SELECT USING (true);

-- Política para remover próprias curtidas
CREATE POLICY "Users can remove their own likes" ON public.media_likes
  FOR DELETE USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND guest_session_id IS NOT NULL)
  );

-- Função para contar curtidas de uma mídia
CREATE OR REPLACE FUNCTION public.get_media_likes_count(media_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.media_likes
  WHERE media_id = media_uuid;
$$;

-- Função para verificar se usuário curtiu mídia
CREATE OR REPLACE FUNCTION public.check_user_liked_media(media_uuid uuid, user_uuid uuid DEFAULT NULL, guest_session text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.media_likes
    WHERE media_id = media_uuid
    AND (
      (user_uuid IS NOT NULL AND user_id = user_uuid) OR
      (guest_session IS NOT NULL AND guest_session_id = guest_session)
    )
  );
$$;

-- Atualizar função de contagem de seguidores para ser mais precisa
CREATE OR REPLACE FUNCTION public.get_followers_count(creator_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT follower_id)
  FROM public.followers
  WHERE creator_id = creator_uuid;
$$;

-- Função para obter seguidores com perfis
CREATE OR REPLACE FUNCTION public.get_followers_with_profiles(creator_uuid uuid)
RETURNS TABLE(
  follower_id uuid,
  created_at timestamp with time zone,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    f.follower_id,
    f.created_at,
    p.display_name,
    p.avatar_url
  FROM public.followers f
  LEFT JOIN public.profiles p ON p.user_id = f.follower_id
  WHERE f.creator_id = creator_uuid
  ORDER BY f.created_at DESC;
$$;