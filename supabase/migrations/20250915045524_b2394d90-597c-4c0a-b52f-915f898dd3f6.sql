-- Criar tabela para armazenar perfis temporários de visitantes
CREATE TABLE public.guest_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Enable RLS
ALTER TABLE public.guest_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que visitantes criem e atualizem seus próprios perfis
CREATE POLICY "Guests can manage their own profiles"
ON public.guest_profiles
FOR ALL
USING (true)
WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE TRIGGER update_guest_profiles_updated_at
BEFORE UPDATE ON public.guest_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para limpar perfis expirados
CREATE OR REPLACE FUNCTION public.clean_expired_guest_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.guest_profiles 
  WHERE expires_at < now();
END;
$$;