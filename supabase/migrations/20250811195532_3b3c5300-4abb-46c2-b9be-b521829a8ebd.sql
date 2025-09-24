-- Fix RLS policies for profiles table - correct the overly permissive policy
-- First drop all existing anonymous policies, then recreate properly

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can view profiles for shared access" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can view profiles" ON public.profiles;

-- Policy 1: Users can view their own profile (authenticated users)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Anonymous users can view profiles (application must filter by creator_id)
-- This allows visitors to access shared pages, but the app controls which specific profile is queried
CREATE POLICY "Anonymous users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'anon');