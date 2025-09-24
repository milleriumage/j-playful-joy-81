-- Fix UPDATE policy for profiles table to allow users to modify their own settings
-- First check and recreate the UPDATE policy to ensure it works correctly

-- Drop existing UPDATE policy to recreate it properly
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate UPDATE policy with correct permissions
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also ensure INSERT policy exists for completeness
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);