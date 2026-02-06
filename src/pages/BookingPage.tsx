import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
// Removed mock data import - only using database trips
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import { z } from "zod";
import upiQr from "@/assets/upi-qr.jpeg";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Shield,
  Check,
  Loader2,
  ArrowLeft,
  CreditCard,
  User,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(15).regex(/^[0-9+\-\s]+$/, "Invalid phone number"),
  specialRequirements: z.string().max(500).optional(),
});

interface TripData {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  startDate: string;
  endDate: string;
  spotsLeft: number;
  organizer: {
    id: string;
    name: string;
  };
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSeats = parseInt(searchParams.get("seats") || "1", 10);

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [seats, setSeats] = useState(initialSeats);
  const [showUpiDialog, setShowUpiDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequirements: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { initiatePayment, loading: paymentLoading, scriptLoaded } = useRazorpay();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Get user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // Get profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            name: profileData.full_name || "",
            email: profileData.email || authUser.email || "",
            phone: profileData.phone || "",
            specialRequirements: "",
          });
        } else {
          setFormData(prev => ({ ...prev, email: authUser.email || "" }));
        }
      }

      // Fetch trip from database only
      const { data: dbTrip } = await supabase
        .from("trips")
        .select(`
          *,
          organizer:organizer_profiles (
            id,
            organizer_name
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (dbTrip) {
        setTrip({
          id: dbTrip.id,
          title: dbTrip.title,
          destination: dbTrip.destination,
          duration: `${dbTrip.duration_days} Days`,
          price: dbTrip.price,
          originalPrice: dbTrip.original_price,
          image: dbTrip.image_url || "/placeholder.svg",
          startDate: dbTrip.start_date || new Date().toISOString(),
          endDate: dbTrip.end_date || new Date().toISOString(),
          spotsLeft: (dbTrip.max_participants || 50) - (dbTrip.current_participants || 0),
          organizer: dbTrip.organizer ? {
            id: dbTrip.organizer.id,
            name: dbTrip.organizer.organizer_name,
          } : { id: "", name: "Unknown" },
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    try {
      bookingSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const startRazorpayPayment = (amount: number) => {
    if (!trip) return;

    initiatePayment({
      tripId: trip.id,
      organizerId: trip.organizer.id,
      amount,
      seats,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      specialRequirements: formData.specialRequirements,
      tripTitle: trip.title,
      onSuccess: (bookingId) => {
        navigate(`/booking/success?bookingId=${bookingId}`);
      },
      onError: (error) => {
        toast.error(error);
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to make a booking");
      navigate(`/auth?redirect=/book/${id}`);
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!trip) return;

    // Show UPI QR flow on Buy click
    setShowUpiDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Trip Not Found</h1>
            <Button asChild>
              <Link to="/trips">Browse Trips</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalAmount = trip.price * seats;
  const savings = trip.originalPrice ? (trip.originalPrice - trip.price) * seats : 0;

  const whatsappNumber = "8118825200";
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
    `Hi! I have paid for ${trip.title}.\n\nName: ${formData.name}\nPhone: ${formData.phone}\nTrip: ${trip.title}\nAmount: ₹${totalAmount}`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* UPI Payment Dialog */}
      <Dialog open={showUpiDialog} onOpenChange={setShowUpiDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay via UPI (Scan QR)</DialogTitle>
            <DialogDescription>
              Scan the QR and pay <strong>₹{totalAmount.toLocaleString()}</strong>. Then send the payment screenshot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <img
                src={upiQr}
                alt="UPI payment QR code"
                className="w-full h-auto rounded-md"
                loading="lazy"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Send your payment screenshot to{' '}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                WhatsApp {whatsappNumber}
              </a>
              {' '}with your name and phone number.
            </div>

            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
              >
                Open WhatsApp Chat
              </Button>

              <Button
                type="button"
                variant="hero"
                className="w-full"
                disabled={paymentLoading || !scriptLoaded}
                onClick={() => startRazorpayPayment(totalAmount)}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay Online (Razorpay)
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link to={`/trips/${trip.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trip
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-md">
                <h1 className="font-display text-2xl font-bold text-card-foreground mb-6">
                  Complete Your Booking
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Traveler Count */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Number of Travelers
                    </Label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                        className="w-12 h-12 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold w-12 text-center">{seats}</span>
                      <button
                        type="button"
                        onClick={() => setSeats(Math.min(trip.spotsLeft, seats + 1))}
                        className="w-12 h-12 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
                      >
                        +
                      </button>
                      <span className="text-muted-foreground text-sm">
                        ({trip.spotsLeft} spots available)
                      </span>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                    <h2 className="font-semibold text-lg text-card-foreground flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Lead Traveler Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
                      <Textarea
                        id="specialRequirements"
                        value={formData.specialRequirements}
                        onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                        placeholder="Any dietary requirements, medical conditions, or special requests"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/cancellation" className="text-primary hover:underline">
                        Cancellation Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    className="w-full"
                    disabled={paymentLoading || !scriptLoaded}
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay ₹{totalAmount.toLocaleString()}
                      </>
                    )}
                  </Button>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-success" />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-lg sticky top-24 overflow-hidden">
                {/* Trip Image */}
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-40 object-cover"
                />

                <div className="p-6 space-y-4">
                  <h2 className="font-display font-bold text-lg text-card-foreground">
                    {trip.title}
                  </h2>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })} - {new Date(trip.endDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{seats} {seats === 1 ? "Traveler" : "Travelers"}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ₹{trip.price.toLocaleString()} × {seats}
                      </span>
                      <span className="text-card-foreground">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>You save</span>
                        <span>₹{savings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Guarantees */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">Free cancellation up to 7 days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-muted-foreground">24/7 customer support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
