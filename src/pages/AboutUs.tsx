import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Users, Target, Heart, Award } from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: Heart,
      title: "Passion for Travel",
      description: "We believe travel transforms lives. Every trip we facilitate is an opportunity for discovery, connection, and unforgettable memories."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We've built a thriving community of travelers and organizers who share their love for exploration and adventure."
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Every organizer on our platform is vetted for quality and safety. We maintain high standards so you can travel with confidence."
    },
    {
      icon: Target,
      title: "Accessible Adventures",
      description: "We're making travel accessible to everyone. From budget-friendly trips to premium experiences, there's something for everyone."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              About ShubhSafar
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connecting travelers with unforgettable experiences across India
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-card rounded-xl p-8 shadow-md mb-12">
            <h2 className="font-display font-bold text-2xl text-card-foreground mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                ShubhSafar was born from a simple observation: there are countless amazing trip organizers across India, but travelers struggle to discover them. We set out to bridge this gap.
              </p>
              <p>
                Founded in Greater Noida, we started with a mission to make travel planning effortless and trustworthy. Today, we connect thousands of travelers with verified organizers offering unique experiences – from Himalayan treks to Goa beach parties, from spiritual journeys to adventure expeditions.
              </p>
              <p>
                Our name "ShubhSafar" means "auspicious journey" in Hindi, reflecting our belief that every trip should be a positive, transformative experience. We're not just a booking platform; we're your travel companion, ensuring every journey is memorable.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-12">
            <h2 className="font-display font-bold text-2xl text-foreground mb-8 text-center">
              What We Stand For
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-primary/5 rounded-xl p-8 mb-12">
            <h2 className="font-display font-bold text-2xl text-foreground mb-8 text-center">
              ShubhSafar in Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground text-sm">Verified Organizers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-muted-foreground text-sm">Happy Travelers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground text-sm">Trips Completed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground text-sm">Destinations</div>
              </div>
            </div>
          </div>

          {/* Team/Contact Section */}
          <div className="bg-card rounded-xl p-8 shadow-md text-center">
            <h2 className="font-display font-bold text-2xl text-card-foreground mb-4">
              Join Our Journey
            </h2>
            <p className="text-muted-foreground mb-6">
              Whether you're a traveler looking for your next adventure or an organizer wanting to reach more travelers, we'd love to have you on board.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/trips" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Explore Trips
              </a>
              <a href="/organizer" className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors">
                Become an Organizer
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
