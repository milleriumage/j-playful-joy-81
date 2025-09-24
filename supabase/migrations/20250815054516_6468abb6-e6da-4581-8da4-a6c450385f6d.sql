-- Create secure storage policies for storage.objects only
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update any media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete any media" ON storage.objects;

-- Create new policies for storage.objects
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can view media files" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'media');

CREATE POLICY "Users can update media files" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY "Users can delete media files" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'media');