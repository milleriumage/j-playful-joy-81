-- Alterar acesso para false para forçar bloqueio do sistema
UPDATE public.usuarios 
SET acesso = false 
WHERE user_id = auth.uid();