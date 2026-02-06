import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, AlertTriangle, Phone, Heart, MapPin, Users } from "lucide-react";

export default function SafetyGuidelines() {
  const guidelines = [
    {
      icon: Shield,
      title: "Verified Organizers",
      description: "All trip organizers on ShubhSafar go through a rigorous verification process. We verify their identity, past experience, and customer reviews before they can list trips on our platform."
    },
    {
      icon: AlertTriangle,
      title: "Emergency Preparedness",
      description: "Every trip includes emergency contact information and protocols. Organizers are required to have first-aid kits and emergency evacuation plans for all adventure activities."
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Our customer support team is available around the clock. In case of any emergency during your trip, you can reach us immediately through the app or by calling our helpline."
    },
    {
      icon: Heart,
      title: "Health & Safety Standards",
      description: "We ensure all accommodations and transport meet basic health and safety standards. COVID-19 safety protocols are followed as per government guidelines."
    },
    {
      icon: MapPin,
      title: "Location Tracking",
      description: "With your consent, we offer real-time location sharing with your emergency contacts. This helps your loved ones know your whereabouts during the trip."
    },
    {
      icon: Users,
      title: "Group Safety",
      description: "Our organizers maintain appropriate group sizes to ensure everyone's safety. Solo travelers are paired with verified groups for enhanced security."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Safety Guidelines
          </h1>
          <p className="text-muted-foreground mb-12">
            Your safety is our top priority. Here's how we ensure you have a secure and enjoyable travel experience.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {guidelines.map((item, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary/5 rounded-xl">
            <h2 className="font-display font-bold text-xl text-foreground mb-4">
              Before You Travel
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Always inform a family member or friend about your travel plans
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Carry valid ID proof and keep digital copies safe
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Check weather conditions and pack accordingly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Ensure you have travel insurance for adventure activities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Keep emergency contact numbers saved offline
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
