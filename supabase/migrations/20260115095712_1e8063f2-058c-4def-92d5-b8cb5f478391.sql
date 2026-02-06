-- Create referral_codes table (username-based codes)
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  referral_type TEXT NOT NULL CHECK (referral_type IN ('signup', 'purchase')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  discount_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Add referral settings to trips table for organizer-controlled discounts
ALTER TABLE public.trips 
ADD COLUMN referral_discount_percent NUMERIC DEFAULT 0,
ADD COLUMN referral_enabled BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral code"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can lookup referral codes by code"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they made"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals they received"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referred_user_id);

CREATE POLICY "Authenticated users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can update referral status"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Create function to generate username-based referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  base_code TEXT;
  final_code TEXT;
  counter INT := 0;
BEGIN
  -- Get user's name from profile
  SELECT UPPER(REGEXP_REPLACE(COALESCE(full_name, 'USER'), '[^A-Za-z0-9]', '', 'g'))
  INTO user_name
  FROM profiles
  WHERE profiles.user_id = generate_referral_code.user_id;
  
  -- Create base code (first 6 chars of name + random suffix)
  base_code := LEFT(COALESCE(user_name, 'REF'), 6) || TO_CHAR(EXTRACT(YEAR FROM NOW()), 'FM0000');
  final_code := base_code;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Auto-generate referral code when profile is created
CREATE OR REPLACE FUNCTION public.create_referral_code_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate code
  new_code := generate_referral_code(NEW.user_id);
  
  -- Insert referral code
  INSERT INTO referral_codes (user_id, code)
  VALUES (NEW.user_id, new_code)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
CREATE TRIGGER on_profile_created_create_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_code_for_user();