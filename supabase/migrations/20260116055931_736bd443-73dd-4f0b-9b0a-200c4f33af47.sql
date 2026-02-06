-- Add new pricing columns to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS prebooking_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS early_bird_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS early_bird_deadline date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS couple_discount_percent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS couple_discount_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_min_purchases integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- Add comment for approval_status values
COMMENT ON COLUMN public.trips.approval_status IS 'pending, approved, rejected';

-- Create admin role assignment for the specified email
-- First, we need to get the user_id from auth.users by email and add admin role
-- This will be done when the user signs up or exists
-- For now, create a function to grant admin role by email

CREATE OR REPLACE FUNCTION public.grant_admin_by_email(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user_id from profiles table by email
  SELECT user_id INTO target_user_id
  FROM profiles
  WHERE email = admin_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Try to grant admin to the specified email (will work if user exists)
SELECT public.grant_admin_by_email('24092141@scale.iitrpr.ac.in');

-- Update trips RLS to show only approved trips to public (keep organizers seeing their own)
DROP POLICY IF EXISTS "Anyone can view active trips" ON public.trips;

CREATE POLICY "Anyone can view approved active trips"
ON public.trips
FOR SELECT
USING (
  (is_active = true AND approval_status = 'approved')
  OR
  EXISTS (
    SELECT 1 FROM organizer_profiles
    WHERE organizer_profiles.id = trips.organizer_id 
    AND organizer_profiles.user_id = auth.uid()
  )
  OR
  has_role(auth.uid(), 'admin')
);

-- Policy for admins to update trip approval status
CREATE POLICY "Admins can update trip approval status"
ON public.trips
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger to auto-grant admin on profile creation for specific email
CREATE OR REPLACE FUNCTION public.check_admin_email_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = '24092141@scale.iitrpr.ac.in' THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_admin_email_trigger ON public.profiles;
CREATE TRIGGER check_admin_email_trigger
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_admin_email_on_profile();