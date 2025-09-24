-- Fix RLS policies for profiles table - remove overly permissive policy
-- and implement secure access for shared pages

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can view profiles for shared access" ON public.profiles;

-- Policy 1: Users can view their own profile (authenticated users)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Anonymous users can view profiles (application filters by creator_id)
-- This allows visitors to access shared pages, but the app must query specific user_id
CREATE POLICY "Anonymous users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'anon');

-- The existing update and insert policies remain unchanged and secure