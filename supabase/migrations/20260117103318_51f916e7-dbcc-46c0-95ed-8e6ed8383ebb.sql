-- Create storage bucket for itinerary PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trip-itinerary', 'trip-itinerary', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for trip-itinerary bucket
CREATE POLICY "Organizers can upload itinerary PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trip-itinerary' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view itinerary PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trip-itinerary');

CREATE POLICY "Organizers can update their itinerary PDFs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trip-itinerary' AND auth.uid() IS NOT NULL);

CREATE POLICY "Organizers can delete their itinerary PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'trip-itinerary' AND auth.uid() IS NOT NULL);

-- Add itinerary_pdf_url column to trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS itinerary_pdf_url TEXT DEFAULT NULL;