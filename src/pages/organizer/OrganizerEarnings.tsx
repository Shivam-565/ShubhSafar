import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Wallet, TrendingUp, DollarSign, Clock, 
  ArrowUpRight, ArrowDownRight, Loader2, BanknoteIcon,
  Calendar, CheckCircle
} from "lucide-react";

interface EarningsSummary {
  totalEarnings: number;
  pendingPayout: number;
  platformFees: number;
  completedPayouts: number;
}

interface Transaction {
  id: string;
  amount: number;
  tripTitle: string;
  bookingDate: string;
  status: string;
  participantName: string;
}

export default function OrganizerEarnings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    pendingPayout: 0,
    platformFees: 0,
    completedPayouts: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('organizer_profiles')
        .select('id, total_earnings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        toast.error('Please complete organizer registration first');
        navigate('/organizer/register');
        return;
      }

      // Fetch all confirmed bookings with completed payments
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          id,
          amount_paid,
          booking_date,
          booking_status,
          payment_status,
          participant_name,
          trip:trips(title)
        `)
        .eq('organizer_id', profile.id)
        .eq('payment_status', 'completed')
        .order('booking_date', { ascending: false });

      if (error) throw error;

      // Calculate earnings
      const totalRevenue = (bookingsData || []).reduce((sum, b) => sum + Number(b.amount_paid), 0);
      const platformFees = totalRevenue * 0.15; // 15% platform fee
      const netEarnings = totalRevenue - platformFees;
      const completedPayouts = Number(profile.total_earnings) || 0;
      const pendingPayout = netEarnings - completedPayouts;

      setEarnings({
        totalEarnings: netEarnings,
        pendingPayout: Math.max(0, pendingPayout),
        platformFees,
        completedPayouts
      });

      // Transform transactions
      const txns: Transaction[] = (bookingsData || []).map(b => ({
        id: b.id,
        amount: Number(b.amount_paid) * 0.85, // Net after platform fee
        tripTitle: Array.isArray(b.trip) ? b.trip[0]?.title : (b.trip as any)?.title || 'Unknown Trip',
        bookingDate: b.booking_date,
        status: b.booking_status,
        participantName: b.participant_name || 'Guest'
      }));

      setTransactions(txns);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (earnings.pendingPayout < 500) {
      toast.error('Minimum payout amount is ₹500');
      return;
    }

    setRequestingPayout(true);
    // Simulate payout request - in production this would integrate with payment gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Payout request submitted! You will receive funds within 3-5 business days.');
    setRequestingPayout(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Earnings & Payouts
            </h1>
            <p className="text-muted-foreground">Track your revenue and manage payouts</p>
          </div>

          {/* Earnings Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Net Earnings</span>
              </div>
              <div className="text-2xl font-bold text-card-foreground">
                ₹{earnings.totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">After platform fees</p>
            </div>

            <div className="bg-gradient-hero rounded-xl p-5 shadow-md text-primary-foreground">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Available Payout</span>
              </div>
              <div className="text-2xl font-bold">
                ₹{earnings.pendingPayout.toLocaleString()}
              </div>
              <p className="text-xs opacity-75 mt-1">Ready to withdraw</p>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Platform Fees</span>
              </div>
              <div className="text-2xl font-bold text-card-foreground">
                ₹{earnings.platformFees.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">15% of revenue</p>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Paid Out</span>
              </div>
              <div className="text-2xl font-bold text-success">
                ₹{earnings.completedPayouts.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total withdrawn</p>
            </div>
          </div>

          {/* Payout Action */}
          <div className="bg-card rounded-xl p-6 shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg text-card-foreground mb-1">
                  Request Payout
                </h2>
                <p className="text-sm text-muted-foreground">
                  Minimum payout amount is ₹500. Funds will be transferred to your registered bank account.
                </p>
              </div>
              <Button 
                variant="hero" 
                size="lg"
                onClick={handleRequestPayout}
                disabled={earnings.pendingPayout < 500 || requestingPayout}
              >
                {requestingPayout ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BanknoteIcon className="w-4 h-4 mr-2" />
                )}
                Withdraw ₹{earnings.pendingPayout.toLocaleString()}
              </Button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-card rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-display font-bold text-lg text-card-foreground">
                Transaction History
              </h2>
              <p className="text-sm text-muted-foreground">Recent earnings from confirmed bookings</p>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-card-foreground mb-2">No transactions yet</h3>
                <p className="text-muted-foreground text-sm">
                  Transactions will appear here when you receive bookings
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((txn) => (
                  <div key={txn.id} className="p-4 md:px-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-card-foreground truncate">
                          {txn.tripTitle}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          txn.status === 'confirmed' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {txn.participantName} • {new Date(txn.bookingDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">+₹{txn.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Net amount</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
