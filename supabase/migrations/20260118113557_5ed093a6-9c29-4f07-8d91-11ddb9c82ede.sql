-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view approved active trips" ON public.trips;

-- Create a permissive policy for public access to approved active trips
CREATE POLICY "Public can view approved active trips"
ON public.trips
FOR SELECT
USING (
  (is_active = true AND approval_status = 'approved')
  OR (EXISTS (
    SELECT 1 FROM organizer_profiles
    WHERE organizer_profiles.id = trips.organizer_id
    AND organizer_profiles.user_id = auth.uid()
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);