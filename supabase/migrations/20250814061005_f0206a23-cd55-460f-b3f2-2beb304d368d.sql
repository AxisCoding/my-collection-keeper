-- Create the items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author_or_director TEXT,
  year INTEGER,
  rating NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
  status TEXT NOT NULL,
  summary TEXT,
  personal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific access
CREATE POLICY "Users can view their own items" 
ON public.items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items" 
ON public.items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" 
ON public.items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
ON public.items 
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
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for exports (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('User-Data-Exports', 'User-Data-Exports', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for user exports
CREATE POLICY "Users can view their own exports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'User-Data-Exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own exports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'User-Data-Exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own exports" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'User-Data-Exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own exports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'User-Data-Exports' AND auth.uid()::text = (storage.foldername(name))[1]);