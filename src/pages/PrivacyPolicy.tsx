import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 2024
          </p>

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Introduction
              </h2>
              <p className="text-muted-foreground">
                ShubhSafar ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application. Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Information We Collect
              </h2>
              <h3 className="font-semibold text-card-foreground mb-2">Personal Information</h3>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Name, email address, phone number
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Date of birth and gender
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Government ID (for verification purposes)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Payment information
                </li>
              </ul>
              <h3 className="font-semibold text-card-foreground mb-2">Usage Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Device information and IP address
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Browsing history and search queries
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Location data (with your consent)
                </li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                How We Use Your Information
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  To process and manage your bookings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  To communicate with you about your trips and account
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  To improve our services and user experience
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  To send promotional offers and updates (with your consent)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  To prevent fraud and ensure platform security
                </li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Data Sharing
              </h2>
              <p className="text-muted-foreground mb-4">We may share your information with:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Trip organizers to facilitate your booking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Payment processors to complete transactions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Service providers who assist in our operations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Law enforcement when required by law
                </li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Data Security
              </h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Your Rights
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Access and update your personal information
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Request deletion of your data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Opt-out of marketing communications
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Withdraw consent for data processing
                </li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at:
                <br /><br />
                Email: privacy@shubhsafar.com<br />
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
