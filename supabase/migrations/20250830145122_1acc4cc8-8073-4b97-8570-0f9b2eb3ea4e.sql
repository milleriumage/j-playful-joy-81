-- Add expires_at column to blocked_users table for temporary blocks
ALTER TABLE public.blocked_users 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;