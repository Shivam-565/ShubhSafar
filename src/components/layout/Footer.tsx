import { Link } from "react-router-dom";
import { Mail, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4" onClick={scrollToTop}>
              <img src={logo} alt="ShubhSafar Logo" className="h-16 w-auto" />
              <div>
                <span className="font-display text-xl font-bold block">ShubhSafar</span>
                <span className="text-background/70 text-sm italic">Safar, Bharose Ke Saath</span>
              </div>
            </Link>
            <p className="text-background/70 mb-6">
              Discover amazing trips curated by verified organizers. Your next adventure is just a click away.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/trips" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Explore Trips
                </Link>
              </li>
              <li>
                <Link to="/educational-trips" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Educational Trips
                </Link>
              </li>
              <li>
                <Link to="/organizer" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Become an Organizer
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/cancellation" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" onClick={scrollToTop} className="text-background/70 hover:text-background transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 text-primary" />
                <span className="text-background/70">support@shubhsafar.co.in</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                <span className="text-background/70">
                  Greater Noida,<br />
                  Uttar Pradesh, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2025 ShubhSafar. All rights reserved.
          </p>
          <p className="text-background/50 text-sm italic">
            Safar, Bharose Ke Saath ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
