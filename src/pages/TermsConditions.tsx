import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 2024
          </p>

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                By accessing and using ShubhSafar's services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the service constitutes acceptance of any changes.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                2. User Accounts
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  You must be at least 18 years old to create an account
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  You are responsible for maintaining the confidentiality of your account credentials
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  You agree to provide accurate and complete information during registration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  You are responsible for all activities that occur under your account
                </li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                3. Booking & Payment
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  All bookings are subject to availability and confirmation by the organizer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Prices displayed are in Indian Rupees (INR) unless otherwise stated
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Payment must be completed to confirm your booking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  ShubhSafar acts as an intermediary and is not responsible for the organizer's services
                </li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                4. User Conduct
              </h2>
              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Use the service for any unlawful purpose
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Post false, misleading, or defamatory content
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Harass, abuse, or harm other users or organizers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Attempt to gain unauthorized access to our systems
                </li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-muted-foreground">
                All content on ShubhSafar, including text, graphics, logos, and software, is the property of ShubhSafar or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                6. Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                ShubhSafar is a platform connecting travelers with trip organizers. We are not liable for any injuries, losses, or damages arising from trips booked through our platform. Organizers are independent contractors and are solely responsible for the services they provide.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                7. Contact Information
              </h2>
              <p className="text-muted-foreground">
                For questions about these Terms & Conditions, please contact us at:
                <br /><br />
                Email: support@shubhsafar.com<br />
                Address: Greater Noida, Uttar Pradesh, India
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
