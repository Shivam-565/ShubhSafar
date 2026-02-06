import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, MapPin, Search, Eye, Edit, ToggleLeft, ToggleRight, 
  Calendar, Users, Loader2, Filter
} from "lucide-react";

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
  start_date: string | null;
  category: string;
  created_at: string;
}

export default function OrganizerTrips() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [organizerId, setOrganizerId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('organizer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        toast.error('Please complete organizer registration first');
        navigate('/organizer/register');
        return;
      }

      setOrganizerId(profile.id);

      const { data: tripsData, error } = await supabase
        .from('trips')
        .select('*')
        .eq('organizer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(tripsData || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const toggleTripStatus = async (tripId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ is_active: !currentStatus })
        .eq('id', tripId);

      if (error) throw error;

      setTrips(trips.map(t => 
        t.id === tripId ? { ...t, is_active: !currentStatus } : t
      ));
      toast.success(`Trip ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling trip status:', error);
      toast.error('Failed to update trip status');
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && trip.is_active) ||
                         (filterStatus === "inactive" && !trip.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                My Trips
              </h1>
              <p className="text-muted-foreground">Manage all your listed trips</p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/organizer/trips/new">
                <Plus className="w-4 h-4 mr-2" />
                Create New Trip
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl p-4 shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={filterStatus === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All ({trips.length})
                </Button>
                <Button 
                  variant={filterStatus === "active" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus("active")}
                >
                  Active ({trips.filter(t => t.is_active).length})
                </Button>
                <Button 
                  variant={filterStatus === "inactive" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterStatus("inactive")}
                >
                  Inactive ({trips.filter(t => !t.is_active).length})
                </Button>
              </div>
            </div>
          </div>

          {/* Trips List */}
          {filteredTrips.length === 0 ? (
            <div className="bg-card rounded-xl p-12 text-center shadow-md">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-card-foreground mb-2">
                {trips.length === 0 ? "No trips yet" : "No matching trips"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {trips.length === 0 
                  ? "Create your first trip to start accepting bookings"
                  : "Try adjusting your search or filters"}
              </p>
              {trips.length === 0 && (
                <Button asChild>
                  <Link to="/organizer/trips/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Trip
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTrips.map((trip) => (
                <div key={trip.id} className="bg-card rounded-xl shadow-md overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-48 h-32 md:h-auto">
                      <img 
                        src={trip.image_url || '/placeholder.svg'} 
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-lg text-card-foreground">
                              {trip.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              trip.is_active 
                                ? 'bg-success/10 text-success' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {trip.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {trip.destination}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {trip.duration_days} days
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {trip.current_participants}/{trip.max_participants} spots
                            </span>
                            <span className="capitalize px-2 py-0.5 bg-muted rounded text-xs">
                              {trip.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-primary">
                              ₹{trip.price.toLocaleString()}
                            </span>
                            {trip.start_date && (
                              <span className="text-sm text-muted-foreground">
                                Starts: {new Date(trip.start_date).toLocaleDateString('en-IN', { 
                                  day: 'numeric', month: 'short', year: 'numeric' 
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild title="View Trip">
                            <Link to={`/trips/${trip.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Edit Trip">
                            <Link to={`/organizer/trips/${trip.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleTripStatus(trip.id, trip.is_active)}
                            title={trip.is_active ? "Deactivate" : "Activate"}
                          >
                            {trip.is_active ? (
                              <ToggleRight className="w-4 h-4 text-success" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
