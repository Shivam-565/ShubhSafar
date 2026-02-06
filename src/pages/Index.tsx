import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/SearchBar";
import { TripCard } from "@/components/trips/TripCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useTrips, useTripStats, useCategories, useDestinations } from "@/hooks/useTrips";
// Removed mock data imports - only using database trips
import heroBg from "@/assets/hero-bg.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  Users, 
  Wallet, 
  Clock, 
  Star,
  ArrowRight,
  BadgeCheck,
  Sparkles
} from "lucide-react";

const Index = () => {
  const { trips: featuredTrips, loading: featuredLoading } = useTrips({ featured: true, limit: 6 });
  const { trips: allTrips, loading: allLoading } = useTrips({ limit: 8 });
  const { stats, loading: statsLoading } = useTripStats();
  const { categories: dbCategories, loading: categoriesLoading } = useCategories();
  const { destinations: dbDestinations, loading: destinationsLoading } = useDestinations();

  // Use only database data - no mock data fallback
  const displayFeaturedTrips = featuredTrips;
  const displayAllTrips = allTrips;
  const displayCategories = dbCategories;
  const displayDestinations = dbDestinations;

  // Dynamic stats with fallback
  const displayStats = {
    trips: stats.totalTrips > 0 ? `${stats.totalTrips}+` : '500+',
    organizers: stats.totalOrganizers > 0 ? `${stats.totalOrganizers}+` : '200+',
    bookings: stats.totalBookings > 0 ? `${Math.floor(stats.totalBookings / 1000)}K+` : '50K+',
    rating: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '4.8',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="Adventure awaits"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-md border border-background/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-warning" />
              <span className="text-background text-sm font-medium">Trusted by {displayStats.bookings} travelers</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 animate-slide-up">
              Discover Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-golden">
                Adventure
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-background/80 mb-8 max-w-2xl mx-auto animate-slide-up animation-delay-100">
              Book curated trips from verified organizers. Solo adventures, college getaways, or school excursions — find your perfect journey.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center">
            <SearchBar variant="hero" />
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-slide-up animation-delay-400">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-background">{displayStats.trips}</div>
              <div className="text-background/70 text-sm">Active Trips</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-background">{displayStats.organizers}</div>
              <div className="text-background/70 text-sm">Verified Organizers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-background">{displayStats.bookings}</div>
              <div className="text-background/70 text-sm">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-background">{displayStats.rating}</div>
              <div className="text-background/70 text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Browse by Category
              </h2>
              <p className="text-muted-foreground mt-1">Find trips that match your vibe</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/trips">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categoriesLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            ) : (
              displayCategories.slice(0, 8).map((category) => (
                <Link
                  key={category.name}
                  to={`/trips?category=${category.name}`}
                  className="bg-card rounded-xl p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{category.count} trips</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Featured Trips
              </h2>
              <p className="text-muted-foreground mt-1">Handpicked experiences just for you</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/trips">
                Explore All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFeaturedTrips.slice(0, 6).map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* College & School Trips CTA */}
      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-background/10 rounded-full px-4 py-2 mb-4">
                <span className="text-xl">🎓</span>
                <span className="font-medium">Special for Students</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                College & School Group Trips
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-6">
                Planning a trip for your class or college gang? Get exclusive group discounts, 
                dedicated coordinators, and customized itineraries. Safety certified and admin-approved.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="glass" size="lg" asChild>
                  <Link to="/trips?type=college">
                    College Trips
                  </Link>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <Link to="/trips?type=school">
                    School Trips
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/10 backdrop-blur-md rounded-xl p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3" />
                <div className="font-display text-2xl font-bold">50+</div>
                <div className="text-sm text-primary-foreground/70">College Trips Monthly</div>
              </div>
              <div className="bg-background/10 backdrop-blur-md rounded-xl p-6 text-center">
                <Shield className="w-8 h-8 mx-auto mb-3" />
                <div className="font-display text-2xl font-bold">100%</div>
                <div className="text-sm text-primary-foreground/70">Safety Verified</div>
              </div>
              <div className="bg-background/10 backdrop-blur-md rounded-xl p-6 text-center">
                <Wallet className="w-8 h-8 mx-auto mb-3" />
                <div className="font-display text-2xl font-bold">30%</div>
                <div className="text-sm text-primary-foreground/70">Group Discount</div>
              </div>
              <div className="bg-background/10 backdrop-blur-md rounded-xl p-6 text-center">
                <BadgeCheck className="w-8 h-8 mx-auto mb-3" />
                <div className="font-display text-2xl font-bold">{displayStats.organizers}</div>
                <div className="text-sm text-primary-foreground/70">Verified Organizers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Trips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Popular Trips
              </h2>
              <p className="text-muted-foreground mt-1">Most booked experiences this month</p>
            </div>
          </div>

          {allLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayAllTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/trips">
                View All Trips <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Why Book with ShubhSafar?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing how you discover and book trips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                Verified Organizers
              </h3>
              <p className="text-muted-foreground text-sm">
                Every organizer is ID verified and background checked for your safety
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                Best Price Guarantee
              </h3>
              <p className="text-muted-foreground text-sm">
                Competition drives prices down. Find the best deals from multiple organizers
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                Secure Payments
              </h3>
              <p className="text-muted-foreground text-sm">
                Your money is safe until you complete your trip. Full refund guarantee
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-warning" />
              </div>
              <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                24/7 Support
              </h3>
              <p className="text-muted-foreground text-sm">
                Emergency support button and dedicated helpline available round the clock
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become an Organizer CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-coral rounded-3xl p-8 md:p-12 text-secondary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-background/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-background/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Are You a Trip Organizer?
              </h2>
              <p className="text-secondary-foreground/80 text-lg mb-6">
                Join ShubhSafar and reach thousands of travelers. List your trips, manage bookings, 
                and grow your business with our powerful organizer tools.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="glass" 
                  size="lg"
                  className="bg-background/20 border-background/30 text-secondary-foreground hover:bg-background/30"
                  asChild
                >
                  <Link to="/organizer">
                    Start Listing Trips <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground">Trending places our travelers love</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            ) : (
              displayDestinations.map((dest) => (
                <Link
                  key={dest.name}
                  to={`/trips?destination=${dest.name}`}
                  className="bg-card rounded-xl p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="font-display font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {dest.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{dest.state}</div>
                  <div className="text-xs text-primary font-medium mt-1">{dest.tripCount} trips</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              What Travelers Say
            </h2>
            <p className="text-muted-foreground">Real experiences from our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                role: "College Student",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
                rating: 5,
                comment: "Our college trip to Coorg was absolutely amazing! The organizer was super helpful and everything was well planned. Will definitely book again!",
              },
              {
                name: "Rahul Verma",
                role: "Solo Traveler",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
                rating: 5,
                comment: "As a solo traveler, I was looking for a safe group to join. ShubhSafar made it so easy to find and book the perfect Himalayan trek.",
              },
              {
                name: "Anita Desai",
                role: "School Teacher",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anita",
                rating: 5,
                comment: "Organized a school trip for 40 students. The safety measures and coordination were top-notch. Highly recommend for educational tours!",
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full bg-muted"
                  />
                  <div>
                    <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground">{testimonial.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
