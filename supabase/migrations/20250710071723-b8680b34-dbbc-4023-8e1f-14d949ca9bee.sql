
-- Create messages table for chat functionality
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  color TEXT DEFAULT '#000000',
  speech TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_items table for image gallery
CREATE TABLE public.media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  name TEXT,
  description TEXT,
  price TEXT,
  link TEXT,
  is_locked BOOLEAN DEFAULT false,
  is_blurred BOOLEAN DEFAULT false,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable real-time for both tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.media_items REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_items;

-- Create indexes for better performance
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_media_items_created_at ON public.media_items(created_at DESC);
CREATE INDEX idx_media_items_is_main ON public.media_items(is_main) WHERE is_main = true;
