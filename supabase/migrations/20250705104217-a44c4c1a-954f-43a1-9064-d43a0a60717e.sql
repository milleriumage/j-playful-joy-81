
-- Create a table for real-time messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'text-white',
  speech TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read messages (public chat)
CREATE POLICY "Anyone can view messages" 
  ON public.messages 
  FOR SELECT 
  USING (true);

-- Create policy to allow anyone to insert messages
CREATE POLICY "Anyone can create messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (true);

-- Enable realtime for the messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create a table for media items
CREATE TABLE public.media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  is_blurred BOOLEAN NOT NULL DEFAULT false,
  is_main BOOLEAN NOT NULL DEFAULT false,
  password TEXT,
  price TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Create policies for media items (public access for demo)
CREATE POLICY "Anyone can view media items" 
  ON public.media_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create media items" 
  ON public.media_items 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update media items" 
  ON public.media_items 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete media items" 
  ON public.media_items 
  FOR DELETE 
  USING (true);

-- Enable realtime for media items
ALTER TABLE public.media_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_items;
