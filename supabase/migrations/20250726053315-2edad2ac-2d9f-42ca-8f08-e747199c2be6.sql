-- Update RLS policies to allow anonymous users to insert media
DROP POLICY IF EXISTS "Only authenticated users can insert media" ON media_items;

CREATE POLICY "Anyone can insert media" 
ON media_items 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated users can update media" ON media_items;

CREATE POLICY "Anyone can update media" 
ON media_items 
FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Only authenticated users can delete media" ON media_items;

CREATE POLICY "Anyone can delete media" 
ON media_items 
FOR DELETE 
USING (true);