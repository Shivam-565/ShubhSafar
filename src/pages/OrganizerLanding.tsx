import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useTripStats } from "@/hooks/useTrips";
import { 
  BadgeCheck, 
  TrendingUp, 
  Users, 
  Shield, 
  DollarSign,
  ArrowRight,
  Star
} from "lucide-react";

export default function OrganizerLandingPage() {
  const { stats } = useTripStats();

  const benefits = [
    {
      icon: Users,
      title: "Reach Thousands of Travelers",
      description: "Access our growing community of adventure seekers looking for their next trip.",
    },
    {
      icon: DollarSign,
      title: "Easy Payment Collection",
      description: "Receive payments securely through our platform. No more chasing payments.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Our marketing helps your trips get discovered. Focus on what you do best.",
    },
    {
      icon: Shield,
      title: "Trust & Verification",
      description: "Our verification badge builds trust with travelers and sets you apart.",
    },
  ];

  const steps = [
    { step: 1, title: "Sign Up", description: "Create your organizer account in minutes" },
    { step: 2, title: "Get Verified", description: "Submit ID and get your verification badge" },
    { step: 3, title: "List Trips", description: "Create beautiful trip listings with our easy tools" },
    { step: 4, title: "Start Earning", description: "Accept bookings and grow your business" },
  ];

  const displayStats = {
    earnings: '₹4.5Cr+',
    organizers: stats.totalOrganizers > 0 ? `${stats.totalOrganizers}+` : '200+',
    travelers: stats.totalBookings > 0 ? `${Math.floor(stats.totalBookings / 1000)}K+` : '50K+',
    rating: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '4.8',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-background rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-background rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-md border border-background/20 rounded-full px-4 py-2 mb-6">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Join {displayStats.organizers} Verified Organizers</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Turn Your Passion for Travel into a Business
            </h1>
            
            <p className="text-xl text-primary-foreground/80 mb-8">
              List your trips, reach thousands of travelers, and grow your travel business with ShubhSafar.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="glass" size="xl" className="bg-background text-foreground hover:bg-background/90" asChild>
                <Link to="/organizer/register">
                  Start Listing Free <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="#how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">{displayStats.earnings}</div>
              <div className="text-muted-foreground">Paid to Organizers</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">{displayStats.organizers}</div>
              <div className="text-muted-foreground">Verified Organizers</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">{displayStats.travelers}</div>
              <div className="text-muted-foreground">Travelers Served</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">{displayStats.rating}</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Organizers Love ShubhSafar
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run a successful trip business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div 
                key={benefit.title}
                className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Get started in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-warning text-warning" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-foreground mb-6">
              "ShubhSafar transformed my hobby into a thriving business. I now organize 10+ trips a month and have built a loyal customer base. The platform handles all the payments and marketing!"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=organizer" 
                alt="Organizer"
                className="w-12 h-12 rounded-full bg-muted"
              />
              <div className="text-left">
                <div className="font-semibold text-foreground">Rahul Mehta</div>
                <div className="text-sm text-muted-foreground">Mountain Explorers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-coral text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-secondary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of organizers who are growing their travel business with ShubhSafar.
          </p>
          <Button 
            variant="glass" 
            size="xl" 
            className="bg-background text-foreground hover:bg-background/90"
            asChild
          >
            <Link to="/organizer/register">
              Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
