-- Adicionar coluna para salvar se auto lock está desativado
ALTER TABLE public.subscriptions 
ADD COLUMN auto_lock_disabled boolean DEFAULT false;