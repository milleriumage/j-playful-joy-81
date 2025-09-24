-- Alterar role de public para authenticated nas políticas RLS da tabela usuarios
DROP POLICY IF EXISTS "acesso de dados" ON public.usuarios;

CREATE POLICY "acesso de dados" 
ON public.usuarios 
FOR SELECT 
TO authenticated
USING ((acesso = true) AND (user_id = auth.uid()));