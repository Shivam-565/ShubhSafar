import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Use localStorage for non-authenticated users
      const stored = localStorage.getItem('shubhsafar_wishlist');
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
      return;
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('trip_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setWishlistIds(data.map(w => w.trip_id));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const isInWishlist = (tripId: string) => wishlistIds.includes(tripId);

  const toggleWishlist = async (tripId: string) => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Handle non-authenticated users with localStorage
      const stored = localStorage.getItem('shubhsafar_wishlist');
      const currentList = stored ? JSON.parse(stored) : [];
      
      if (currentList.includes(tripId)) {
        const newList = currentList.filter((id: string) => id !== tripId);
        localStorage.setItem('shubhsafar_wishlist', JSON.stringify(newList));
        setWishlistIds(newList);
        toast.success('Removed from wishlist');
      } else {
        const newList = [...currentList, tripId];
        localStorage.setItem('shubhsafar_wishlist', JSON.stringify(newList));
        setWishlistIds(newList);
        toast.success('Added to wishlist');
      }
      setLoading(false);
      return;
    }

    try {
      if (isInWishlist(tripId)) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('trip_id', tripId);

        if (error) throw error;
        setWishlistIds(prev => prev.filter(id => id !== tripId));
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, trip_id: tripId });

        if (error) throw error;
        setWishlistIds(prev => [...prev, tripId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return { wishlistIds, isInWishlist, toggleWishlist, loading, refetch: fetchWishlist };
}
