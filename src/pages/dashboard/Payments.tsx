import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart,
  Calendar, 
  CreditCard, 
  Star,
  Settings,
  Phone,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  payment_status: string | null;
  payment_method: string | null;
  payment_date: string | null;
  transaction_id: string | null;
  created_at: string;
  booking: {
    id: string;
    trip: {
      title: string;
    } | null;
  } | null;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setLoading(false);
      return;
    }
    setUser(authUser);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();
    setProfile(profileData);

    // Fetch payments with booking and trip info
    const { data: paymentsData, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        payment_status,
        payment_method,
        payment_date,
        transaction_id,
        created_at,
        booking:bookings (
          id,
          trip:trips (
            title
          )
        )
      `)
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });

    if (!error && paymentsData) {
      const transformedPayments = paymentsData.map((p: any) => ({
        ...p,
        booking: p.booking ? {
          id: p.booking.id,
          trip: p.booking.trip ? { title: p.booking.trip.title } : null
        } : null
      }));
      setPayments(transformedPayments);
    }
    setLoading(false);
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`;
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "pending": return <Clock className="w-4 h-4 text-warning" />;
      case "failed": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success";
      case "pending": return "bg-warning/10 text-warning";
      case "failed": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const stats = {
    totalPaid: payments.filter(p => p.payment_status === "completed").reduce((sum, p) => sum + Number(p.amount), 0),
    successful: payments.filter(p => p.payment_status === "completed").length,
    pending: payments.filter(p => p.payment_status === "pending").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                <div className="text-center mb-6">
                  <img 
                    src={getAvatarUrl()} 
                    alt={profile?.full_name || "User"}
                    className="w-20 h-20 rounded-full mx-auto mb-4 bg-muted object-cover"
                  />
                  <h2 className="font-display font-bold text-lg text-card-foreground">
                    {profile?.full_name || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>

                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    My Bookings
                  </Link>
                  <Link
                    to="/dashboard/wishlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </Link>
                  <Link
                    to="/dashboard/reviews"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    My Reviews
                  </Link>
                  <Link
                    to="/dashboard/payments"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
                  >
                    <CreditCard className="w-5 h-5" />
                    Payments
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                </nav>

                <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <Phone className="w-5 h-5" />
                    Emergency Support
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Need urgent help during your trip?
                  </p>
                  <Button variant="destructive" size="sm" className="w-full">
                    Call Now
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Payment History
              </h1>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-card-foreground">
                    ₹{stats.totalPaid.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Paid</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-success">
                    {stats.successful}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-warning">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>

              {/* Payments List */}
              {payments.length > 0 ? (
                <div className="bg-card rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Trip</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-card-foreground">
                                  {payment.booking?.trip?.title || 'Unknown Trip'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.transaction_id || payment.id.slice(0, 8)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-card-foreground">
                                ₹{Number(payment.amount).toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {payment.payment_method || 'Razorpay'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.payment_status)}`}>
                                {getStatusIcon(payment.payment_status)}
                                {(payment.payment_status || 'pending').charAt(0).toUpperCase() + (payment.payment_status || 'pending').slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(payment.payment_date || payment.created_at).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-6 py-4">
                              {payment.payment_status === "completed" && (
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <Download className="w-4 h-4" />
                                  Receipt
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-xl">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    No payments yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your payment history will appear here after you book a trip.
                  </p>
                  <Button asChild>
                    <Link to="/trips">Explore Trips</Link>
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
