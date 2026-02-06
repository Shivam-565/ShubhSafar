import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  totalSignups: number;
  totalPurchases: number;
  totalEarnings: number;
  pendingReferrals: number;
}

interface Referral {
  id: string;
  referral_type: 'signup' | 'purchase';
  status: 'pending' | 'completed' | 'cancelled';
  discount_amount: number;
  created_at: string;
  converted_at: string | null;
  referred_user?: {
    full_name: string | null;
    email: string | null;
  };
  trip?: {
    title: string;
    destination: string;
  };
}

export function useReferral(userId: string | null) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({
    totalSignups: 0,
    totalPurchases: 0,
    totalEarnings: 0,
    pendingReferrals: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchReferralData();
    }
  }, [userId]);

  const fetchReferralData = async () => {
    if (!userId) return;

    try {
      // Fetch referral code
      const { data: codeData } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)
        .maybeSingle();

      if (codeData) {
        setReferralCode(codeData.code);
      } else {
        // Generate code if not exists
        await generateReferralCode();
      }

      // Fetch referrals made by this user
      const { data: referralsData } = await supabase
        .from('referrals')
        .select(`
          id,
          referral_type,
          status,
          discount_amount,
          created_at,
          converted_at,
          referred_user_id,
          trip_id
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (referralsData) {
        // Fetch additional details
        const enrichedReferrals: Referral[] = await Promise.all(
          referralsData.map(async (ref) => {
            let referred_user = null;
            let trip = null;

            if (ref.referred_user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('user_id', ref.referred_user_id)
                .maybeSingle();
              referred_user = profile;
            }

            if (ref.trip_id) {
              const { data: tripData } = await supabase
                .from('trips')
                .select('title, destination')
                .eq('id', ref.trip_id)
                .maybeSingle();
              trip = tripData;
            }

            return {
              ...ref,
              referral_type: ref.referral_type as 'signup' | 'purchase',
              status: ref.status as 'pending' | 'completed' | 'cancelled',
              referred_user,
              trip,
            };
          })
        );

        setReferrals(enrichedReferrals);

        // Calculate stats
        const signups = enrichedReferrals.filter(r => r.referral_type === 'signup' && r.status === 'completed').length;
        const purchases = enrichedReferrals.filter(r => r.referral_type === 'purchase' && r.status === 'completed').length;
        const earnings = enrichedReferrals
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + (r.discount_amount || 0), 0);
        const pending = enrichedReferrals.filter(r => r.status === 'pending').length;

        setStats({
          totalSignups: signups,
          totalPurchases: purchases,
          totalEarnings: earnings,
          pendingReferrals: pending,
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    if (!userId) return;

    try {
      // Call database function to generate code
      const { data, error } = await supabase.rpc('generate_referral_code', {
        user_id: userId,
      });

      if (error) throw error;

      // Insert the generated code
      const { error: insertError } = await supabase
        .from('referral_codes')
        .insert({
          user_id: userId,
          code: data,
        });

      if (!insertError) {
        setReferralCode(data);
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const getReferralLink = () => {
    if (!referralCode) return null;
    return `${window.location.origin}/auth?mode=signup&ref=${referralCode}`;
  };

  const validateReferralCode = async (code: string) => {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('user_id, code')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  };

  const trackReferralSignup = async (referrerUserId: string, referredUserId: string) => {
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerUserId,
        referred_user_id: referredUserId,
        referral_type: 'signup',
        status: 'completed',
        converted_at: new Date().toISOString(),
      });

    return !error;
  };

  const trackReferralPurchase = async (
    referrerUserId: string,
    referredUserId: string,
    tripId: string,
    bookingId: string,
    discountAmount: number
  ) => {
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerUserId,
        referred_user_id: referredUserId,
        trip_id: tripId,
        booking_id: bookingId,
        referral_type: 'purchase',
        status: 'completed',
        discount_amount: discountAmount,
        converted_at: new Date().toISOString(),
      });

    return !error;
  };

  return {
    referralCode,
    stats,
    referrals,
    loading,
    getReferralLink,
    validateReferralCode,
    trackReferralSignup,
    trackReferralPurchase,
    refetch: fetchReferralData,
  };
}
