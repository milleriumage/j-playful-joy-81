-- Adicionar coluna hover_unblur à tabela media_items
ALTER TABLE public.media_items 
ADD COLUMN hover_unblur BOOLEAN DEFAULT false;