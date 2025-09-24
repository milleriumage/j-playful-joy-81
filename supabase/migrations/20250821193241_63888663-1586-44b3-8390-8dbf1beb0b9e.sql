-- Create table to map secondary emails to users for login
CREATE TABLE public.user_email_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alias_email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_email_aliases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own email aliases" 
ON public.user_email_aliases 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can read active aliases for login" 
ON public.user_email_aliases 
FOR SELECT 
USING (is_active = true);

-- Add trigger for timestamps
CREATE TRIGGER update_user_email_aliases_updated_at
BEFORE UPDATE ON public.user_email_aliases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get primary email from alias
CREATE OR REPLACE FUNCTION public.get_primary_email_from_alias(alias_email TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.settings->>'email' as primary_email
  FROM user_email_aliases uea
  JOIN profiles p ON p.user_id = uea.user_id
  WHERE uea.alias_email = alias_email 
    AND uea.is_active = true
  LIMIT 1;
$$;