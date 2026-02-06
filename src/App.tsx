import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Wishlist from "./pages/dashboard/Wishlist";
import Payments from "./pages/dashboard/Payments";
import Reviews from "./pages/dashboard/Reviews";
import Settings from "./pages/dashboard/Settings";
import Referrals from "./pages/dashboard/Referrals";
import OrganizerLanding from "./pages/OrganizerLanding";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerRegistration from "./pages/organizer/OrganizerRegistration";
import OrganizerTrips from "./pages/organizer/OrganizerTrips";
import OrganizerBookings from "./pages/organizer/OrganizerBookings";
import OrganizerEarnings from "./pages/organizer/OrganizerEarnings";
import OrganizerProfile from "./pages/organizer/OrganizerProfile";
import OrganizerSettings from "./pages/organizer/OrganizerSettings";
import CreateTrip from "./pages/organizer/CreateTrip";
import EditTrip from "./pages/organizer/EditTrip";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import HelpCenter from "./pages/HelpCenter";
import SafetyGuidelines from "./pages/SafetyGuidelines";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import EducationalTrips from "./pages/EducationalTrips";
import NotFound from "./pages/NotFound";
import { AIChatWidget } from "./components/chat/AIChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/educational" element={<EducationalTrips />} />
          
          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/wishlist" element={<Wishlist />} />
          <Route path="/dashboard/payments" element={<Payments />} />
          <Route path="/dashboard/reviews" element={<Reviews />} />
          <Route path="/dashboard/referrals" element={<Referrals />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          
          {/* Organizer Routes */}
          <Route path="/organizer" element={<OrganizerLanding />} />
          <Route path="/organizer/register" element={<OrganizerRegistration />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/trips" element={<OrganizerTrips />} />
          <Route path="/organizer/trips/new" element={<CreateTrip />} />
          <Route path="/organizer/trips/:id/edit" element={<EditTrip />} />
          <Route path="/organizer/bookings" element={<OrganizerBookings />} />
          <Route path="/organizer/earnings" element={<OrganizerEarnings />} />
          <Route path="/organizer/profile" element={<OrganizerProfile />} />
          <Route path="/organizer/settings" element={<OrganizerSettings />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Info Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/safety" element={<SafetyGuidelines />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cancellation" element={<CancellationPolicy />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
