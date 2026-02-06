import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Star,
  Calendar,
  MapPin,
  Heart,
  CreditCard,
  Settings,
  Phone,
  Edit,
  Trash2,
  Loader2,
  User
} from "lucide-react";

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  trip: {
    id: string;
    title: string;
    destination: string;
    image_url: string | null;
  } | null;
}

export default function ReviewsPage() {
  const { profile, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchReviews();
    }
  }, [authLoading, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          trip:trips(id, title, destination, image_url)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews((data as unknown as UserReview[]) || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      toast.success("Review deleted");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  if (authLoading || loading) {
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
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                {/* Profile */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h2 className="font-display font-bold text-card-foreground">
                    {profile?.name || "User"}
                  </h2>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </Link>
                  <Link
                    to="/dashboard/reviews"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
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

                {/* Emergency Support */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">Need help?</div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="tel:+919876543210">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  My Reviews
                </h1>
                <span className="text-sm text-muted-foreground">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-card rounded-xl p-12 shadow-md text-center">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="font-display text-xl font-bold text-card-foreground mb-2">
                    No Reviews Yet
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    After completing a trip, share your experience to help fellow travelers.
                  </p>
                  <Button asChild>
                    <Link to="/trips">Explore Trips</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-card rounded-xl p-6 shadow-md">
                      <div className="flex gap-4">
                        {/* Trip Image */}
                        <Link to={`/trips/${review.trip?.id}`} className="shrink-0">
                          <img
                            src={review.trip?.image_url || "/placeholder.svg"}
                            alt={review.trip?.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        </Link>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link 
                                to={`/trips/${review.trip?.id}`}
                                className="font-semibold text-card-foreground hover:text-primary transition-colors"
                              >
                                {review.trip?.title || "Unknown Trip"}
                              </Link>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{review.trip?.destination}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteReview(review.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "fill-warning text-warning"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <p className="text-muted-foreground text-sm mt-3">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
