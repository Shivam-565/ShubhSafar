import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone,
  Download,
  Share2,
  Loader2
} from "lucide-react";

interface BookingDetails {
  id: string;
  trip: {
    title: string;
    destination: string;
    start_date: string;
    duration_days: number;
  };
  participants_count: number;
  amount_paid: number;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  created_at: string;
}

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          participants_count,
          amount_paid,
          participant_name,
          participant_email,
          participant_phone,
          created_at,
          trip:trips (
            title,
            destination,
            start_date,
            duration_days
          )
        `)
        .eq("id", bookingId)
        .maybeSingle();

      if (!error && data) {
        setBooking(data as unknown as BookingDetails);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your trip has been successfully booked. We've sent the confirmation details to your email.
            </p>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-hero p-6 text-primary-foreground">
                <p className="text-sm opacity-80 mb-1">Booking Reference</p>
                <p className="font-mono text-xl font-bold">{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Trip Info */}
                <div>
                  <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                    {booking.trip?.title || "Trip Booked"}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.trip?.destination || "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {booking.trip?.start_date 
                          ? new Date(booking.trip.start_date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{booking.participants_count} {booking.participants_count === 1 ? "Traveler" : "Travelers"}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-card-foreground">
                      <span>₹{Number(booking.amount_paid).toLocaleString()} paid</span>
                    </div>
                  </div>
                </div>

                {/* Traveler Info */}
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-card-foreground mb-3">Lead Traveler</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-card-foreground font-medium">{booking.participant_name}</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{booking.participant_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{booking.participant_phone}</span>
                    </div>
                  </div>
                </div>

                {/* What's Next */}
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-card-foreground mb-3">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                      <span>Check your email for booking confirmation and trip details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                      <span>The organizer will contact you with meeting point details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                      <span>Pack your bags and get ready for an amazing adventure!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/dashboard">
                View My Bookings
              </Link>
            </Button>
            <Button variant="hero" size="lg" asChild>
              <Link to="/trips">
                Explore More Trips
              </Link>
            </Button>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:support@shubhsafar.com" className="text-primary hover:underline">
                support@shubhsafar.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
