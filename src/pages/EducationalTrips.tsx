import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TripCard } from "@/components/trips/TripCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, School, Users, MapPin, Calendar, Shield, Phone, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function EducationalTripsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "college" | "school">("all");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [educationalTrips, setEducationalTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    requesterName: "",
    institutionName: "",
    institutionType: "college" as "college" | "school",
    email: "",
    phone: "",
    location: "",
    studentCount: "",
    preferredDestinations: "",
    preferredDates: "",
    specialRequirements: ""
  });

  // Fetch educational trips from database
  useEffect(() => {
    const fetchEducationalTrips = async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, organizer_profiles(*)')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .or('is_educational.eq.true,trip_type.eq.college,trip_type.eq.school,category.ilike.%college%,category.ilike.%school%,category.ilike.%educational%');
      
      if (error) {
        console.error('Error fetching educational trips:', error);
      } else if (data) {
        const mappedTrips = data.map(trip => ({
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
            name: trip.organizer_profiles?.organizer_name || 'Organizer',
            avatar: trip.organizer_profiles?.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${trip.organizer_profiles?.organizer_name || 'O'}`,
            rating: 4.8,
            tripCount: 0,
            verified: trip.organizer_profiles?.is_verified || false,
          },
          inclusions: trip.inclusions || [],
          exclusions: trip.exclusions || [],
          itinerary: (trip.itinerary as any[]) || [],
          highlights: [],
          isFeatured: trip.is_featured || false,
        }));
        setEducationalTrips(mappedTrips);
      }
      setLoading(false);
    };

    fetchEducationalTrips();
  }, []);

  const filteredTrips = activeTab === "all" 
    ? educationalTrips 
    : educationalTrips.filter(trip => trip.type === activeTab);

  const features = [
    {
      icon: Shield,
      title: "Safety First",
      description: "All trips are supervised by experienced guides with proper safety protocols"
    },
    {
      icon: Users,
      title: "Group Discounts",
      description: "Special pricing for large student groups and educational institutions"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Trips can be customized to fit your academic calendar"
    },
    {
      icon: MapPin,
      title: "Educational Value",
      description: "Learning experiences combined with adventure and fun activities"
    }
  ];

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("educational_trip_requests").insert({
        requester_name: formData.requesterName,
        institution_name: formData.institutionName,
        institution_type: formData.institutionType,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        student_count: formData.studentCount ? parseInt(formData.studentCount) : null,
        preferred_destinations: formData.preferredDestinations,
        preferred_dates: formData.preferredDates,
        special_requirements: formData.specialRequirements,
        status: "pending"
      });

      if (error) throw error;

      toast.success("Request submitted successfully! We'll get in touch with the best organizers for you.");
      setShowContactForm(false);
      setFormData({
        requesterName: "",
        institutionName: "",
        institutionType: "college",
        email: "",
        phone: "",
        location: "",
        studentCount: "",
        preferredDestinations: "",
        preferredDates: "",
        specialRequirements: ""
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm font-medium">Educational Tours</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Educational Trips for Schools & Colleges
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Combine learning with adventure. We organize safe, fun, and educational trips 
              for students of all ages with customized itineraries and group packages.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="glass" 
                size="lg" 
                onClick={() => setShowContactForm(true)}
              >
                <Phone className="w-5 h-5 mr-2" />
                Get in Touch
              </Button>
              <Button 
                variant="glass" 
                size="lg"
                asChild
              >
                <Link to="/organizer">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  List Your College Trip
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-card-foreground mb-2">
              Request Educational Trip
            </h2>
            <p className="text-muted-foreground mb-6">
              Fill in your details and we'll connect you with the best organizers in your area.
            </p>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Your Name *
                  </label>
                  <Input
                    required
                    value={formData.requesterName}
                    onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Institution Name *
                  </label>
                  <Input
                    required
                    value={formData.institutionName}
                    onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
                    placeholder="School/College name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Institution Type *
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.institutionType}
                    onChange={(e) => setFormData({...formData, institutionType: e.target.value as "college" | "school"})}
                  >
                    <option value="college">College</option>
                    <option value="school">School</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Number of Students
                  </label>
                  <Input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({...formData, studentCount: e.target.value})}
                    placeholder="Approx. count"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Email *
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@institution.edu"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">
                    Phone *
                  </label>
                  <Input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">
                  Your Location *
                </label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">
                  Preferred Destinations
                </label>
                <Input
                  value={formData.preferredDestinations}
                  onChange={(e) => setFormData({...formData, preferredDestinations: e.target.value})}
                  placeholder="e.g., Manali, Goa, Rishikesh"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">
                  Preferred Dates
                </label>
                <Input
                  value={formData.preferredDates}
                  onChange={(e) => setFormData({...formData, preferredDates: e.target.value})}
                  placeholder="e.g., Feb 2025, Spring break"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">
                  Special Requirements
                </label>
                <Textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                  placeholder="Any specific requirements, dietary needs, accessibility requirements..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowContactForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Options Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
            How would you like to proceed?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Whether you're looking for an organizer or want to organize trips yourself, we've got you covered.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Option 1: Get in Touch */}
            <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
              <div className="w-16 h-16 rounded-2xl bg-background/20 flex items-center justify-center mb-6">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Get in Touch</h3>
              <p className="text-primary-foreground/80 mb-6">
                Looking for an organizer? Submit your requirements and we'll connect you with the 
                best verified organizers near your location. They'll handle everything from itinerary 
                planning to transportation.
              </p>
              <ul className="space-y-2 mb-6 text-primary-foreground/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                  Auto-assigned nearest organizer
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                  Customized quotes within 24 hours
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                  Verified and trusted organizers only
                </li>
              </ul>
              <Button 
                variant="glass" 
                size="lg" 
                className="w-full"
                onClick={() => setShowContactForm(true)}
              >
                Request Quote <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Option 2: List Your Trip */}
            <div className="bg-gradient-coral rounded-2xl p-8 text-secondary-foreground">
              <div className="w-16 h-16 rounded-2xl bg-background/20 flex items-center justify-center mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">List Your College Trip</h3>
              <p className="text-secondary-foreground/80 mb-6">
                Are you a teacher or professor? Create and manage trips for your students. 
                Students can view details, make payments, and you can manage all participant 
                information in one place.
              </p>
              <ul className="space-y-2 mb-6 text-secondary-foreground/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                  Easy trip creation wizard
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                  Student portal for bookings & payments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                  Manage student info & documents
                </li>
              </ul>
              <Button 
                variant="glass" 
                size="lg" 
                className="w-full bg-background/20 border-background/30 hover:bg-background/30"
                asChild
              >
                <Link to="/organizer">
                  Start Listing <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs & Trips */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
            Browse Educational Trips
          </h2>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Users className="w-5 h-5" />
              All Educational Trips
            </button>
            <button
              onClick={() => setActiveTab("college")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === "college"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              College Trips
            </button>
            <button
              onClick={() => setActiveTab("school")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === "school"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <School className="w-5 h-5" />
              School Trips
            </button>
          </div>

          {/* Trips Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}

          {filteredTrips.length === 0 && (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No trips found
              </h3>
              <p className="text-muted-foreground">
                Check back later for more educational trips.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
