-- Política RLS para permitir que visitantes anônimos leiam arquivos do bucket media
CREATE POLICY "Allow public read access to media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

-- Garantir que o bucket media seja público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'media';