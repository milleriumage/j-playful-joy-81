-- Create storage policies for media uploads
CREATE POLICY "Allow authenticated users to upload their own media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to view all media in media bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Allow users to update their own media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);