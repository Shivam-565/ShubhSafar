import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/TripCard";
import { supabase } from "@/integrations/supabase/client";
// Removed mock data import - only using database trips
import { 
  MapPin, 
  Star, 
  BadgeCheck, 
  Calendar,
  Users,
  Phone,
  Mail,
  Globe,
  ArrowLeft
} from "lucide-react";

interface OrganizerData {
  id: string;
  organization_name: string;
  organizer_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  is_verified: boolean | null;
  total_earnings: number | null;
  created_at: string;
}

export default function OrganizerProfilePage() {
  const { id } = useParams();
  const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripCount, setTripCount] = useState(0);
  const [rating, setRating] = useState(4.8);
  const [organizerTrips, setOrganizerTrips] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrganizer = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('organizer_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching organizer:', error);
      } else if (data) {
        setOrganizer(data);
        
        // Fetch trip count
        const { count } = await supabase
          .from('trips')
          .select('*', { count: 'exact', head: true })
          .eq('organizer_id', id)
          .eq('is_active', true)
          .eq('approval_status', 'approved');
        
        setTripCount(count || 0);

        // Fetch trips for this organizer
        const { data: tripsData } = await supabase
          .from('trips')
          .select('*')
          .eq('organizer_id', id)
          .eq('is_active', true)
          .eq('approval_status', 'approved')
          .limit(4);
        
        if (tripsData && tripsData.length > 0) {
          // Map database trips to the expected format
          setOrganizerTrips(tripsData.map(trip => ({
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            description: trip.description || '',
            image: trip.image_url || '/placeholder.svg',
            price: Number(trip.price),
            originalPrice: trip.original_price ? Number(trip.original_price) : undefined,
            duration: `${trip.duration_days} Days`,
            startDate: trip.start_date || '',
            endDate: trip.end_date || '',
            difficulty: (trip.difficulty_level as 'easy' | 'moderate' | 'hard') || 'easy',
            type: (trip.trip_type as 'solo' | 'group' | 'college' | 'school') || 'group',
            category: trip.category,
            rating: Number(trip.rating) || 4.5,
            reviewCount: trip.review_count || 0,
            spotsLeft: (trip.max_participants || 50) - (trip.current_participants || 0),
            totalSpots: trip.max_participants || 50,
            organizer: {
              id: trip.organizer_id,
              name: data.organizer_name,
              avatar: data.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${data.organizer_name}`,
              rating: 4.8,
              tripCount: tripCount,
              verified: data.is_verified || false,
            },
            inclusions: trip.inclusions || [],
            exclusions: trip.exclusions || [],
            itinerary: (trip.itinerary as any[]) || [],
            highlights: [],
            isFeatured: trip.is_featured || false,
          })));
        }
      }
      setLoading(false);
    };

    fetchOrganizer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Organizer Not Found</h1>
            <Button asChild>
              <Link to="/trips">Browse Trips</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link 
            to="/trips" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trips
          </Link>

          {/* Organizer Header */}
          <div className="bg-card rounded-xl p-8 shadow-md mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img 
                src={organizer.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${organizer.organizer_name}`}
                alt={organizer.organizer_name}
                className="w-24 h-24 rounded-full bg-muted"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-card-foreground">
                    {organizer.organizer_name}
                  </h1>
                  {organizer.is_verified && (
                    <BadgeCheck className="w-6 h-6 text-primary" />
                  )}
                </div>
                <p className="text-muted-foreground mb-4">
                  {organizer.organization_name}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {organizer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {organizer.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium text-card-foreground">{rating}</span>
                    <span>rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{tripCount} trips organized</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Member since {new Date(organizer.created_at).getFullYear()}</span>
                  </div>
                </div>

                {organizer.description && (
                  <p className="text-muted-foreground mb-4">
                    {organizer.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {organizer.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${organizer.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                  {organizer.email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${organizer.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                  {organizer.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={organizer.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Organizer's Trips */}
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              Trips by {organizer.organizer_name}
            </h2>
            
            {organizerTrips.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {organizerTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold text-card-foreground mb-2">
                  No trips yet
                </h3>
                <p className="text-muted-foreground">
                  This organizer hasn't listed any trips yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
