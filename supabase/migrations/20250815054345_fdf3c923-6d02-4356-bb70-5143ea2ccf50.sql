-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view all media in media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own media" ON storage.objects;

-- Create secure storage policies for storage.buckets
CREATE POLICY IF NOT EXISTS "Authenticated users can create buckets" 
ON storage.buckets 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Anyone can view buckets" 
ON storage.buckets 
FOR SELECT 
TO public
USING (true);

-- Create secure storage policies for storage.objects  
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'media' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view media files" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'media');

CREATE POLICY "Users can update any media" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete any media" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);