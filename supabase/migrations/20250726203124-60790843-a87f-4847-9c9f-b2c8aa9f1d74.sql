-- Create a table to track media interactions
CREATE TABLE public.media_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL,
  user_id UUID,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'share', 'view', 'click')),
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(media_id, user_id, interaction_type, user_ip)
);

-- Enable Row Level Security
ALTER TABLE public.media_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for interactions
CREATE POLICY "Anyone can insert interactions" 
ON public.media_interactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view interactions" 
ON public.media_interactions 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_media_interactions_media_id ON public.media_interactions(media_id);
CREATE INDEX idx_media_interactions_type ON public.media_interactions(interaction_type);
CREATE INDEX idx_media_interactions_created_at ON public.media_interactions(created_at);

-- Create a function to get interaction counts for a media item
CREATE OR REPLACE FUNCTION public.get_media_stats(media_uuid UUID)
RETURNS TABLE(
  likes_count BIGINT,
  shares_count BIGINT,
  views_count BIGINT,
  clicks_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'like') as likes_count,
    COUNT(*) FILTER (WHERE interaction_type = 'share') as shares_count,
    COUNT(*) FILTER (WHERE interaction_type = 'view') as views_count,
    COUNT(*) FILTER (WHERE interaction_type = 'click') as clicks_count
  FROM public.media_interactions
  WHERE media_id = media_uuid;
$$;