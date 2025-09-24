-- Create wishlist table for persistent storage
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  model_file_url TEXT,
  model_file_type TEXT, -- 'obj', 'gltf', 'usdz'
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_favorite BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  external_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own wishlist items" 
ON public.wishlist_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist items" 
ON public.wishlist_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items" 
ON public.wishlist_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" 
ON public.wishlist_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wishlist_items_updated_at
BEFORE UPDATE ON public.wishlist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user preferences table for customization
CREATE TABLE public.user_wishlist_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  background_color TEXT DEFAULT 'default',
  glassmorphism_intensity TEXT DEFAULT 'medium' CHECK (glassmorphism_intensity IN ('low', 'medium', 'high')),
  view_mode TEXT DEFAULT 'grid' CHECK (view_mode IN ('grid', 'list')),
  item_size TEXT DEFAULT 'medium' CHECK (item_size IN ('small', 'medium', 'large')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for preferences
ALTER TABLE public.user_wishlist_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_wishlist_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_wishlist_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_wishlist_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for preferences
CREATE TRIGGER update_user_wishlist_preferences_updated_at
BEFORE UPDATE ON public.user_wishlist_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();