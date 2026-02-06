-- Fix overly permissive INSERT policy on referrals
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON public.referrals;

-- More restrictive policy: only allow creating referrals where current user is involved
CREATE POLICY "Users can create referrals for their own signups"
  ON public.referrals FOR INSERT
  WITH CHECK (
    auth.uid() = referred_user_id 
    OR auth.uid() = referrer_id
  );