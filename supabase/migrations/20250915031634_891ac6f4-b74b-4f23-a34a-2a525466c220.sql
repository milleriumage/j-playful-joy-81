-- Update RLS policies to allow anonymous users to follow creators
DROP POLICY IF EXISTS "Users can follow creators" ON public.followers;
DROP POLICY IF EXISTS "Users can unfollow creators" ON public.followers;

-- Allow anonymous users to follow creators
CREATE POLICY "Anyone can follow creators" 
ON public.followers 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous users to unfollow creators  
CREATE POLICY "Anyone can unfollow creators"
ON public.followers 
FOR DELETE 
USING (true);