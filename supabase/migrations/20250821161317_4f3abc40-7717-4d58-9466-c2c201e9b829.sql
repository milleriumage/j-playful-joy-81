-- Criar tabela para armazenar compras de painéis dos usuários
CREATE TABLE public.user_panel_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  panel_id TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_panel_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para que usuários vejam apenas suas próprias compras
CREATE POLICY "Users can view their own panel purchases" 
ON public.user_panel_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own panel purchases" 
ON public.user_panel_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_user_panel_purchases_updated_at
BEFORE UPDATE ON public.user_panel_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_user_panel_purchases_user_id ON public.user_panel_purchases(user_id);
CREATE INDEX idx_user_panel_purchases_panel_id ON public.user_panel_purchases(panel_id);
CREATE UNIQUE INDEX idx_user_panel_purchases_unique ON public.user_panel_purchases(user_id, panel_id);