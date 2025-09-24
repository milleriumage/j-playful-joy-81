-- Remove any existing conflicting policies first
DROP POLICY IF EXISTS "Authenticated users can create buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Anyone can view buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update any media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete any media" ON storage.objects;

-- Enable RLS on storage tables
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create secure storage policies for storage.buckets
CREATE POLICY "Authenticated users can create buckets" 
ON storage.buckets 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view buckets" 
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