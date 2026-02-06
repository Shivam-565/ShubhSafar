import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseTrip {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  image_url: string | null;
  price: number;
  original_price: number | null;
  duration_days: number;
  start_date: string | null;
  end_date: string | null;
  difficulty_level: string | null;
  trip_type: string | null;
  category: string;
  rating: number | null;
  review_count: number | null;
  current_participants: number | null;
  max_participants: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  meeting_point: string | null;
  organizer_id: string;
  organizer?: {
    id: string;
    organization_name: string;
    organizer_name: string;
    logo_url: string | null;
    is_verified: boolean | null;
    description: string | null;
  };
}

export interface TransformedTrip {
  id: string;
  title: string;
  destination: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  duration: string;
  startDate: string;
  endDate: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  type: 'solo' | 'group' | 'college' | 'school';
  category: string;
  rating: number;
  reviewCount: number;
  spotsLeft: number;
  totalSpots: number;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    tripCount: number;
    verified: boolean;
    description?: string;
  };
  inclusions: string[];
  exclusions: string[];
  itinerary: any[];
  highlights: string[];
  isFeatured: boolean;
}

export function transformTrip(trip: DatabaseTrip): TransformedTrip {
  const spotsLeft = (trip.max_participants || 50) - (trip.current_participants || 0);
  
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    description: trip.description || '',
    image: trip.image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    price: Number(trip.price),
    originalPrice: trip.original_price ? Number(trip.original_price) : undefined,
    duration: `${trip.duration_days} Day${trip.duration_days > 1 ? 's' : ''}`,
    startDate: trip.start_date || '',
    endDate: trip.end_date || '',
    difficulty: (trip.difficulty_level as 'easy' | 'moderate' | 'hard') || 'easy',
    type: (trip.trip_type as 'solo' | 'group' | 'college' | 'school') || 'group',
    category: trip.category,
    rating: Number(trip.rating) || 0,
    reviewCount: trip.review_count || 0,
    spotsLeft: Math.max(0, spotsLeft),
    totalSpots: trip.max_participants || 50,
    organizer: {
      id: trip.organizer?.id || trip.organizer_id,
      name: trip.organizer?.organization_name || 'Unknown Organizer',
      avatar: trip.organizer?.logo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.organizer_id}`,
      rating: 4.5,
      tripCount: 0,
      verified: trip.organizer?.is_verified || false,
      description: trip.organizer?.description || undefined,
    },
    inclusions: trip.inclusions || [],
    exclusions: trip.exclusions || [],
    itinerary: [],
    highlights: [],
    isFeatured: trip.is_featured || false,
  };
}

interface UseTripsOptions {
  featured?: boolean;
  category?: string | null;
  type?: string | null;
  difficulty?: string | null;
  destination?: string | null;
  limit?: number;
}

export function useTrips(options: UseTripsOptions = {}) {
  const [trips, setTrips] = useState<TransformedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('trips')
          .select(`
            *,
            organizer:organizer_profiles!trips_organizer_id_fkey (
              id,
              organization_name,
              organizer_name,
              logo_url,
              is_verified,
              description
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (options.featured) {
          query = query.eq('is_featured', true);
        }

        if (options.category) {
          query = query.eq('category', options.category);
        }

        if (options.type) {
          query = query.eq('trip_type', options.type);
        }

        if (options.difficulty) {
          query = query.eq('difficulty_level', options.difficulty);
        }

        if (options.destination) {
          query = query.ilike('destination', `%${options.destination}%`);
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const transformedTrips = (data || []).map(trip => transformTrip(trip as DatabaseTrip));
        setTrips(transformedTrips);
      } catch (err: any) {
        console.error('Error fetching trips:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [options.featured, options.category, options.type, options.difficulty, options.destination, options.limit]);

  return { trips, loading, error };
}

export function useTripStats() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalOrganizers: 0,
    totalBookings: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [tripsRes, organizersRes, bookingsRes] = await Promise.all([
          supabase.from('trips').select('id, rating', { count: 'exact' }).eq('is_active', true),
          supabase.from('organizer_profiles').select('id', { count: 'exact' }).eq('is_verified', true),
          supabase.from('bookings').select('id', { count: 'exact' }),
        ]);

        const trips = tripsRes.data || [];
        const avgRating = trips.length > 0 
          ? trips.reduce((sum, t) => sum + (Number(t.rating) || 0), 0) / trips.length 
          : 0;

        setStats({
          totalTrips: tripsRes.count || 0,
          totalOrganizers: organizersRes.count || 0,
          totalBookings: bookingsRes.count || 0,
          avgRating: Math.round(avgRating * 10) / 10,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}

export function useDestinations() {
  const [destinations, setDestinations] = useState<{ name: string; state: string; tripCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('destination')
          .eq('is_active', true);

        if (error) throw error;

        // Group by destination and count
        const destMap = new Map<string, number>();
        (data || []).forEach(trip => {
          const dest = trip.destination.split(',')[0].trim();
          destMap.set(dest, (destMap.get(dest) || 0) + 1);
        });

        const destList = Array.from(destMap.entries())
          .map(([name, tripCount]) => ({ name, state: '', tripCount }))
          .sort((a, b) => b.tripCount - a.tripCount)
          .slice(0, 6);

        setDestinations(destList);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, []);

  return { destinations, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<{ name: string; icon: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('category')
          .eq('is_active', true);

        if (error) throw error;

        // Group by category and count
        const catMap = new Map<string, number>();
        (data || []).forEach(trip => {
          catMap.set(trip.category, (catMap.get(trip.category) || 0) + 1);
        });

        const categoryIcons: Record<string, string> = {
          'Adventure': '⛰️',
          'Beach': '🏖️',
          'Heritage': '🏛️',
          'Wildlife': '🦁',
          'College Special': '🎓',
          'School Trips': '🎒',
          'Spiritual': '🕉️',
          'International': '✈️',
          'Nature': '🌲',
          'Trekking': '🥾',
        };

        const catList = Array.from(catMap.entries())
          .map(([name, count]) => ({ 
            name, 
            icon: categoryIcons[name] || '🌍', 
            count 
          }))
          .sort((a, b) => b.count - a.count);

        setCategories(catList);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading };
}
