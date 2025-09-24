-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Create storage policies for media bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Anyone can upload media"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media');

CREATE POLICY "Anyone can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');