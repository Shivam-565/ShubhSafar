-- 1) Trip-level referral discount as fixed amount (₹)
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS referral_discount_amount numeric DEFAULT 0;

-- 2) Storage policies for trip image uploads (bucket: trip-images)
-- NOTE: storage.objects is managed by the platform; policies are the supported way to control access.

DROP POLICY IF EXISTS "Public read trip images" ON storage.objects;
CREATE POLICY "Public read trip images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'trip-images');

DROP POLICY IF EXISTS "Authenticated upload trip images" ON storage.objects;
CREATE POLICY "Authenticated upload trip images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'trip-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update trip images" ON storage.objects;
CREATE POLICY "Authenticated update trip images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'trip-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'trip-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete trip images" ON storage.objects;
CREATE POLICY "Authenticated delete trip images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'trip-images' AND auth.role() = 'authenticated');
