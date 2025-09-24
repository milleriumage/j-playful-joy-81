-- Allow anonymous users to read visibility settings from profiles
-- This is needed so visitors can see shared pages with correct visibility settings

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies that allow more flexible access
-- Policy 1: Users can view their own profile (authenticated users)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Anonymous users can read basic profile data for shared pages
-- This allows visitors to see visibility settings when accessing shared links
CREATE POLICY "Anonymous users can view profiles for shared access" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'anon');

-- Keep update/insert policies restrictive (only owners can modify)
-- The existing update and insert policies should remain unchanged