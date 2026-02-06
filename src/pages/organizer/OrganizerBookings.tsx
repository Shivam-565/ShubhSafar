import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Calendar, Search, Eye, CheckCircle, XCircle, Clock, 
  User, Phone, Mail, Loader2, Download, Filter
} from "lucide-react";

interface Booking {
  id: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  participants_count: number;
  amount_paid: number;
  booking_status: string;
  payment_status: string;
  booking_date: string;
  special_requirements: string | null;
  trip: {
    id: string;
    title: string;
    destination: string;
    start_date: string | null;
  };
}

export default function OrganizerBookings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('organizer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        toast.error('Please complete organizer registration first');
        navigate('/organizer/register');
        return;
      }

      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(id, title, destination, start_date)
        `)
        .eq('organizer_id', profile.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      
      // Type assertion to handle the joined data
      const typedBookings = (bookingsData || []).map(b => ({
        ...b,
        trip: Array.isArray(b.trip) ? b.trip[0] : b.trip
      })) as Booking[];
      
      setBookings(typedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, booking_status: newStatus } : b
      ));
      toast.success(`Booking ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.participant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.participant_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.trip?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.booking_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
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
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Bookings
              </h1>
              <p className="text-muted-foreground">Manage bookings for your trips</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl p-4 shadow-md">
              <div className="text-sm text-muted-foreground mb-1">Total Bookings</div>
              <div className="text-2xl font-bold text-card-foreground">{bookings.length}</div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-md">
              <div className="text-sm text-muted-foreground mb-1">Confirmed</div>
              <div className="text-2xl font-bold text-success">
                {bookings.filter(b => b.booking_status === 'confirmed').length}
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-md">
              <div className="text-sm text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold text-warning">
                {bookings.filter(b => b.booking_status === 'pending').length}
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-md">
              <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-primary">
                ₹{bookings.filter(b => b.payment_status === 'completed').reduce((sum, b) => sum + Number(b.amount_paid), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl p-4 shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or trip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "confirmed", "cancelled"].map(status => (
                  <Button 
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-card rounded-xl p-12 text-center shadow-md">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-card-foreground mb-2">
                {bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
              </h2>
              <p className="text-muted-foreground">
                {bookings.length === 0 
                  ? "Bookings will appear here when travelers book your trips"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-card rounded-xl shadow-md p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Participant Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-card-foreground">
                          {booking.participant_name || 'Guest'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                        {booking.participant_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {booking.participant_email}
                          </span>
                        )}
                        {booking.participant_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.participant_phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {booking.participants_count} {booking.participants_count === 1 ? 'person' : 'people'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/trips/${booking.trip?.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {booking.trip?.title}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          • {booking.trip?.destination}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="text-right">
                      <div className="font-bold text-lg text-card-foreground mb-1">
                        ₹{Number(booking.amount_paid).toLocaleString()}
                      </div>
                      <div className={`text-sm flex items-center justify-end gap-1 ${getPaymentStatusColor(booking.payment_status)}`}>
                        {booking.payment_status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        Payment {booking.payment_status}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      {booking.booking_status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.booking_status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {booking.special_requirements && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Special Requirements:</strong> {booking.special_requirements}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
