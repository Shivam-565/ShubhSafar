import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Removed mock data import - only using database trips
import { supabase } from "@/integrations/supabase/client";
import { WishlistButton } from "@/components/WishlistButton";
import { ShareButton } from "@/components/ShareButton";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { useAuth } from "@/hooks/useAuth";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  BadgeCheck, 
  Check,
  X,
  ChevronRight,
  Phone,
  Shield,
  AlertCircle,
  Loader2,
  PenLine,
  FileText
} from "lucide-react";

interface TripFromDB {
  id: string;
  title: string;
  description: string | null;
  destination: string;
  category: string;
  duration_days: number;
  price: number;
  original_price: number | null;
  image_url: string | null;
  itinerary_pdf_url?: string | null;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  current_participants: number | null;
  difficulty_level: string | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  itinerary: any;
  rating: number | null;
  review_count: number | null;
  is_featured: boolean | null;
  trip_type: string | null;
  meeting_point: string | null;
  organizer: {
    id: string;
    organization_name: string;
    organizer_name: string;
    logo_url: string | null;
    is_verified: boolean | null;
  } | null;
}

export default function TripDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [activeTab, setActiveTab] = useState<"itinerary" | "inclusions" | "reviews">("itinerary");
  const [dbTrip, setDbTrip] = useState<TripFromDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRefresh, setReviewRefresh] = useState(0);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select(`
            *,
            organizer:organizer_profiles (
              id,
              organization_name,
              organizer_name,
              logo_url,
              is_verified
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          setDbTrip(data as TripFromDB);
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use DB trip if available, otherwise use mock trip
  const trip = dbTrip ? {
    id: dbTrip.id,
    title: dbTrip.title,
    description: dbTrip.description || "",
    destination: dbTrip.destination,
    category: dbTrip.category,
    duration: `${dbTrip.duration_days} ${dbTrip.duration_days === 1 ? 'Day' : 'Days'}`,
    price: dbTrip.price,
    originalPrice: dbTrip.original_price,
    image: dbTrip.image_url || '/placeholder.svg',
    itineraryPdfUrl: dbTrip.itinerary_pdf_url || null,
    startDate: dbTrip.start_date || new Date().toISOString(),
    endDate: dbTrip.end_date || new Date().toISOString(),
    totalSpots: dbTrip.max_participants || 50,
    spotsLeft: (dbTrip.max_participants || 50) - (dbTrip.current_participants || 0),
    difficulty: dbTrip.difficulty_level || 'easy',
    inclusions: dbTrip.inclusions || [],
    exclusions: dbTrip.exclusions || [],
    itinerary: Array.isArray(dbTrip.itinerary) ? dbTrip.itinerary : [],
    rating: dbTrip.rating || 0,
    reviewCount: dbTrip.review_count || 0,
    isFeatured: dbTrip.is_featured,
    type: dbTrip.trip_type,
    highlights: [],
    meetingPoint: dbTrip.meeting_point,
    organizer: dbTrip.organizer ? {
      id: dbTrip.organizer.id,
      name: dbTrip.organizer.organizer_name,
      avatar: dbTrip.organizer.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${dbTrip.organizer.organization_name}`,
      verified: dbTrip.organizer.is_verified,
      rating: 4.8,
      tripCount: 10
    } : null
  } : null;

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Trip Not Found</h1>
          <Button asChild>
            <Link to="/trips">Browse Trips</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = trip.price * selectedSeats;
  const discountPercent = trip.originalPrice 
    ? Math.round((1 - trip.price / trip.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img 
          src={trip.image} 
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-24 left-4 flex flex-wrap gap-2">
          {trip.isFeatured && (
            <Badge className="bg-gradient-golden text-accent-foreground font-semibold">
              Featured
            </Badge>
          )}
          {trip.type === "college" && (
            <Badge className="bg-gradient-coral text-secondary-foreground">
              🎓 College Special
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge variant="destructive">
              {discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-24 right-4 flex gap-2">
          <WishlistButton tripId={trip.id} />
          <ShareButton title={trip.title} />
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <nav className="flex items-center gap-2 text-sm text-background/70 mb-3">
              <Link to="/" className="hover:text-background">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/trips" className="hover:text-background">Trips</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-background">{trip.destination}</span>
            </nav>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-3">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-background/80">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{trip.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-medium text-background">{trip.rating}</span>
                <span>({trip.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Organizer */}
              {trip.organizer && (
                <div className="bg-card rounded-xl p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={trip.organizer.avatar} 
                        alt={trip.organizer.name}
                        className="w-14 h-14 rounded-full bg-muted object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-card-foreground">{trip.organizer.name}</span>
                          {trip.organizer.verified && (
                            <BadgeCheck className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            {trip.organizer.rating}
                          </span>
                          <span>{trip.organizer.tripCount} trips organized</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/organizer/${trip.organizer.id}/profile`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-card rounded-xl p-6 shadow-md">
                <h2 className="font-display text-xl font-bold text-card-foreground mb-4">About This Trip</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {trip.description}
                </p>

                {/* Highlights */}
                {trip.highlights && trip.highlights.length > 0 && (
                  <>
                    <h3 className="font-semibold text-card-foreground mb-3">Highlights</h3>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {trip.highlights.map((highlight: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-card rounded-xl shadow-md overflow-hidden">
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setActiveTab("itinerary")}
                    className={`flex-1 py-4 px-6 font-medium text-sm transition-colors ${
                      activeTab === "itinerary" 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Day-wise Itinerary
                  </button>
                  <button
                    onClick={() => setActiveTab("inclusions")}
                    className={`flex-1 py-4 px-6 font-medium text-sm transition-colors ${
                      activeTab === "inclusions" 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Inclusions & Exclusions
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex-1 py-4 px-6 font-medium text-sm transition-colors ${
                      activeTab === "reviews" 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Reviews
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "itinerary" && (
                    <div className="space-y-6">
                      {trip.itineraryPdfUrl && (
                        <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-card-foreground">Itinerary PDF</p>
                              <p className="text-xs text-muted-foreground">Open the full itinerary document</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={trip.itineraryPdfUrl} target="_blank" rel="noopener noreferrer">
                              View PDF
                            </a>
                          </Button>
                        </div>
                      )}

                      {trip.itinerary && trip.itinerary.length > 0 ? (
                        trip.itinerary.map((day: any, index: number) => (
                          <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary/20 last:border-l-0 last:pb-0">
                            <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-primary -translate-x-[9px]" />
                            <div className="mb-2">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                Day {day.day || index + 1}
                              </span>
                            </div>
                            <h4 className="font-semibold text-card-foreground mb-2">{day.title}</h4>
                            <p className="text-muted-foreground text-sm mb-3">{day.description}</p>
                            {day.activities && (
                              <div className="flex flex-wrap gap-2">
                                {day.activities.map((activity: string, i: number) => (
                                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                                    {activity}
                                  </span>
                                ))}
                              </div>
                            )}
                            {day.meals && (
                              <div className="mt-3 text-xs text-muted-foreground">
                                <strong>Meals:</strong> {Array.isArray(day.meals) ? day.meals.join(", ") : day.meals}
                              </div>
                            )}
                            {day.accommodation && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                <strong>Stay:</strong> {day.accommodation}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Detailed itinerary will be shared upon booking</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "inclusions" && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                          <Check className="w-5 h-5 text-success" />
                          What's Included
                        </h4>
                        <ul className="space-y-2">
                          {trip.inclusions && trip.inclusions.length > 0 ? (
                            trip.inclusions.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))
                          ) : (
                            <li className="text-muted-foreground text-sm">Details to be shared upon booking</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                          <X className="w-5 h-5 text-destructive" />
                          Not Included
                        </h4>
                        <ul className="space-y-2">
                          {trip.exclusions && trip.exclusions.length > 0 ? (
                            trip.exclusions.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))
                          ) : (
                            <li className="text-muted-foreground text-sm">Details to be shared upon booking</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="space-y-6">
                      {/* Write Review Button */}
                      {user && !showReviewForm && (
                        <div className="flex justify-end">
                          <Button onClick={() => setShowReviewForm(true)}>
                            <PenLine className="w-4 h-4 mr-2" />
                            Write a Review
                          </Button>
                        </div>
                      )}

                      {/* Review Form */}
                      {showReviewForm && (
                        <div className="bg-muted/50 rounded-lg p-6">
                          <h4 className="font-semibold text-card-foreground mb-4">Write Your Review</h4>
                          <ReviewForm 
                            tripId={trip.id}
                            onSuccess={() => {
                              setShowReviewForm(false);
                              setReviewRefresh(prev => prev + 1);
                            }}
                            onCancel={() => setShowReviewForm(false)}
                          />
                        </div>
                      )}

                      {/* Reviews List */}
                      <ReviewList tripId={trip.id} refreshTrigger={reviewRefresh} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-lg sticky top-24">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold text-card-foreground">
                      ₹{trip.price.toLocaleString()}
                    </span>
                    {trip.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ₹{trip.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">per person</span>
                </div>

                {/* Trip Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </span>
                    <span className="font-medium text-card-foreground">
                      {new Date(trip.startDate).toLocaleDateString("en-IN", { 
                        day: "numeric", 
                        month: "short" 
                      })} - {new Date(trip.endDate).toLocaleDateString("en-IN", { 
                        day: "numeric", 
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Availability
                    </span>
                    <span className={`font-medium ${trip.spotsLeft <= 5 ? "text-destructive" : "text-success"}`}>
                      {trip.spotsLeft} spots left
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      trip.difficulty === "easy" 
                        ? "bg-success/10 text-success" 
                        : trip.difficulty === "moderate"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Seat Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Number of Travelers
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="font-semibold text-xl">{selectedSeats}</span>
                    <button
                      onClick={() => setSelectedSeats(Math.min(trip.spotsLeft, selectedSeats + 1))}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">
                      ₹{trip.price.toLocaleString()} × {selectedSeats} travelers
                    </span>
                    <span className="font-medium text-card-foreground">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full mb-4"
                  disabled={trip.spotsLeft === 0}
                  asChild={trip.spotsLeft > 0}
                >
                  {trip.spotsLeft > 0 ? (
                    <Link to={`/book/${trip.id}?seats=${selectedSeats}`}>
                      Book Now
                    </Link>
                  ) : (
                    <span>Sold Out</span>
                  )}
                </Button>

                {/* Low Availability Warning */}
                {trip.spotsLeft <= 5 && trip.spotsLeft > 0 && (
                  <div className="flex items-start gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3 mb-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>Only {trip.spotsLeft} spots left! Book now to secure your place.</span>
                  </div>
                )}

                {trip.spotsLeft === 0 && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>This trip is fully booked. Check back later for availability.</span>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-success" />
                    <span className="text-muted-foreground">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-success" />
                    <span className="text-muted-foreground">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
