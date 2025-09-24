-- Create policies to allow anonymous users to view creator's content

-- Allow anonymous users to view media items (for public sharing)
CREATE POLICY "Anonymous users can view public media" 
ON public.media_items 
FOR SELECT 
USING (true);

-- Allow anonymous users to view profiles (for public sharing)
CREATE POLICY "Anonymous users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow anonymous users to view social icons (for public sharing)  
CREATE POLICY "Anonymous users can view all social icons"
ON public.social_icons 
FOR SELECT 
USING (true);

-- Update existing policies to be more permissive for anonymous access
-- The existing "Anonymous users can view profiles" policy is already in place
-- but we need to ensure it works for all cases