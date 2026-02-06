import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/TripCard";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/hooks/useWishlist";
import { 
  Heart,
  Calendar, 
  MapPin, 
  CreditCard, 
  Star,
  Settings,
  Phone,
  Loader2
} from "lucide-react";

interface Trip {
  id: string;
  title: string;
  destination: string;
  price: number;
  original_price: number | null;
  duration_days: number;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  category: string;
}

export default function WishlistPage() {
  const [wishlistTrips, setWishlistTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { wishlistIds, refetch } = useWishlist();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (wishlistIds.length > 0) {
      fetchWishlistTrips();
    } else {
      setWishlistTrips([]);
      setIsLoading(false);
    }
  }, [wishlistIds]);

  const fetchUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUser(authUser);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();
      setProfile(profileData);
    }
  };

  const fetchWishlistTrips = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .in('id', wishlistIds)
      .eq('is_active', true);

    if (!error && data) {
      setWishlistTrips(data);
    }
    setIsLoading(false);
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`;
  };

  const transformTrip = (trip: Trip): any => ({
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    description: '',
    price: trip.price,
    originalPrice: trip.original_price || undefined,
    duration: `${trip.duration_days} Days`,
    startDate: '',
    endDate: '',
    difficulty: 'easy' as const,
    type: 'group' as const,
    category: trip.category,
    image: trip.image_url || '/placeholder.svg',
    rating: trip.rating || 0,
    reviewCount: trip.review_count || 0,
    spotsLeft: 10,
    totalSpots: 30,
    organizer: { id: '', name: 'Organizer', avatar: '', rating: 0, tripCount: 0, verified: false },
    inclusions: [],
    exclusions: [],
    itinerary: [],
    highlights: [],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                {/* Profile */}
                <div className="text-center mb-6">
                  <img 
                    src={getAvatarUrl()} 
                    alt={profile?.full_name || "User"}
                    className="w-20 h-20 rounded-full mx-auto mb-4 bg-muted object-cover"
                  />
                  <h2 className="font-display font-bold text-lg text-card-foreground">
                    {profile?.full_name || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {new Date(profile?.created_at || user?.created_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    My Bookings
                  </Link>
                  <Link
                    to="/dashboard/wishlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </Link>
                  <Link
                    to="/dashboard/reviews"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    My Reviews
                  </Link>
                  <Link
                    to="/dashboard/payments"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Payments
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                </nav>

                {/* Emergency Button */}
                <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <Phone className="w-5 h-5" />
                    Emergency Support
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Need urgent help during your trip?
                  </p>
                  <Button variant="destructive" size="sm" className="w-full">
                    Call Now
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  My Wishlist
                </h1>
                <span className="text-muted-foreground">
                  {wishlistTrips.length} {wishlistTrips.length === 1 ? 'trip' : 'trips'}
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : wishlistTrips.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {wishlistTrips.map((trip) => (
                    <TripCard key={trip.id} trip={transformTrip(trip)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-xl">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring trips and save your favorites!
                  </p>
                  <Button asChild>
                    <Link to="/trips">Explore Trips</Link>
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
