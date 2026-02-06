import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Wallet,
  Settings,
  HelpCircle,
  BadgeCheck,
  BarChart3,
  Loader2
} from "lucide-react";

interface OrganizerProfile {
  id: string;
  organization_name: string;
  organizer_name: string;
  logo_url: string | null;
  is_verified: boolean;
  total_earnings: number;
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  price: number;
  image_url: string | null;
  current_participants: number;
  max_participants: number;
  is_active: boolean;
}

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch organizer profile
      const { data: profileData, error: profileError } = await supabase
        .from('organizer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast.error('No organizer profile found. Please complete registration.');
        navigate('/organizer');
        return;
      }

      setOrganizerProfile(profileData);

      // Fetch trips
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .eq('organizer_id', profileData.id)
        .order('created_at', { ascending: false });

      if (tripsData) {
        setTrips(tripsData);
      }

      // Fetch bookings count
      const { count: bookingsCountData } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', profileData.id);

      setBookingsCount(bookingsCountData || 0);

      // Calculate pending payout (bookings with confirmed status)
      const { data: pendingBookings } = await supabase
        .from('bookings')
        .select('amount_paid')
        .eq('organizer_id', profileData.id)
        .eq('payment_status', 'completed')
        .eq('booking_status', 'confirmed');

      if (pendingBookings) {
        const pending = pendingBookings.reduce((sum, b) => sum + Number(b.amount_paid), 0);
        setPendingPayout(pending * 0.85); // 85% after platform fee
      }

    } catch (error) {
      console.error('Error fetching organizer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organizerProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Complete Your Registration</h1>
            <Button asChild>
              <Link to="/organizer">Register as Organizer</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = {
    totalTrips: trips.length,
    activeTrips: trips.filter(t => t.is_active).length,
    totalBookings: bookingsCount,
    totalEarnings: Number(organizerProfile.total_earnings) || 0,
    pendingPayout: pendingPayout,
    rating: 4.8, // Will be calculated from reviews
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                {/* Profile */}
                <div className="text-center mb-6">
                  <img 
                    src={organizerProfile.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${organizerProfile.organization_name}`} 
                    alt={organizerProfile.organization_name}
                    className="w-16 h-16 rounded-full mx-auto mb-3 bg-muted object-cover"
                  />
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <h2 className="font-display font-bold text-card-foreground">
                      {organizerProfile.organizer_name}
                    </h2>
                    {organizerProfile.is_verified && (
                      <BadgeCheck className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{organizerProfile.organization_name}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <Link
                    to="/organizer/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/organizer/trips"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    My Trips
                  </Link>
                  <Link
                    to="/organizer/bookings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    Bookings
                  </Link>
                  <Link
                    to="/organizer/earnings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    Earnings
                  </Link>
                  <Link
                    to="/organizer/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <Link
                    to="/help"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Help Center
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Welcome back, {organizerProfile.organizer_name.split(" ")[0]}!
                  </h1>
                  <p className="text-muted-foreground">Here's your business overview</p>
                </div>
                <Button variant="hero" asChild>
                  <Link to="/organizer/trips/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Trip
                  </Link>
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">Total Trips</span>
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalTrips}</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Active</span>
                  </div>
                  <div className="text-2xl font-bold text-success">{stats.activeTrips}</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Bookings</span>
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalBookings}</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Earnings</span>
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">
                    ₹{stats.totalEarnings >= 1000 ? `${(stats.totalEarnings/1000).toFixed(0)}K` : stats.totalEarnings}
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-warning">
                    ₹{stats.pendingPayout >= 1000 ? `${(stats.pendingPayout/1000).toFixed(0)}K` : stats.pendingPayout.toFixed(0)}
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats.rating}</div>
                </div>
              </div>

              {/* Recent Trips */}
              <div className="bg-card rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-card-foreground">My Trips</h2>
                  <Link to="/organizer/trips/new" className="text-sm text-primary hover:underline">
                    Create New
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {trips.length === 0 ? (
                    <div className="p-8 text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-card-foreground mb-2">No trips yet</h3>
                      <p className="text-muted-foreground text-sm mb-4">Create your first trip to start accepting bookings</p>
                      <Button asChild>
                        <Link to="/organizer/trips/new">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Trip
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    trips.slice(0, 5).map((trip) => (
                      <div key={trip.id} className="p-4 md:p-6 flex items-center gap-4">
                        <img 
                          src={trip.image_url || '/placeholder.svg'} 
                          alt={trip.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-card-foreground truncate">{trip.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs ${trip.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {trip.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{trip.destination}</span>
                            <span>{trip.duration_days} days</span>
                          </div>
                        </div>
                        <div className="text-right hidden md:block">
                          <div className="font-semibold text-card-foreground">₹{trip.price.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {trip.current_participants || 0}/{trip.max_participants || 50} spots
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/trips/${trip.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <div className="bg-gradient-hero rounded-xl p-6 text-primary-foreground">
                  <h3 className="font-display font-bold text-lg mb-2">Create New Trip</h3>
                  <p className="text-primary-foreground/80 text-sm mb-4">
                    List a new trip and start accepting bookings
                  </p>
                  <Button variant="glass" size="sm" asChild>
                    <Link to="/organizer/trips/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Trip
                    </Link>
                  </Button>
                </div>
                <div className="bg-gradient-coral rounded-xl p-6 text-secondary-foreground">
                  <h3 className="font-display font-bold text-lg mb-2">Request Payout</h3>
                  <p className="text-secondary-foreground/80 text-sm mb-4">
                    Withdraw your pending earnings to bank account
                  </p>
                  <Button variant="glass" size="sm" className="bg-background/20 border-background/30 hover:bg-background/30">
                    <Wallet className="w-4 h-4 mr-2" />
                    Withdraw ₹{stats.pendingPayout.toLocaleString()}
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
