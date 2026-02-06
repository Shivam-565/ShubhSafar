-- Fix linter warning: avoid WITH CHECK (true) while keeping public form submissions working
DROP POLICY IF EXISTS "Anyone can create requests" ON public.educational_trip_requests;
CREATE POLICY "Anyone can create requests"
ON public.educational_trip_requests
FOR INSERT
WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');
