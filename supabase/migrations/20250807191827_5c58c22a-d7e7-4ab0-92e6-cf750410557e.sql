-- Adicionar coluna para armazenar tempo de auto-lock na tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS auto_lock_minutes integer DEFAULT 30;