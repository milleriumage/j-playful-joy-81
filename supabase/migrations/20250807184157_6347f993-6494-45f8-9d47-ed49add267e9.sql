-- Adicionar campos de slots na tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN image_slots integer DEFAULT 2,
ADD COLUMN video_slots integer DEFAULT 0;

-- Atualizar registros existentes para garantir valores padrão
UPDATE public.subscriptions 
SET image_slots = 2, video_slots = 0 
WHERE image_slots IS NULL OR video_slots IS NULL;