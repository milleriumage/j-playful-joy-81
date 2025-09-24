-- Remover constraint que impede auto-follow
ALTER TABLE public.followers 
DROP CONSTRAINT IF EXISTS no_self_follow;