-- Fix function search path security issue
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
SET search_path = 'public'
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'like') as likes_count,
    COUNT(*) FILTER (WHERE interaction_type = 'share') as shares_count,
    COUNT(*) FILTER (WHERE interaction_type = 'view') as views_count,
    COUNT(*) FILTER (WHERE interaction_type = 'click') as clicks_count
  FROM public.media_interactions
  WHERE media_id = media_uuid;
$$;