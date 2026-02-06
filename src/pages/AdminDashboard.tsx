import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Users,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Settings,
  BarChart3,
  AlertTriangle,
  Loader2,
  BadgeCheck,
  FileText
} from "lucide-react";

type AdminTab = "overview" | "organizers" | "trips" | "users" | "bookings";

interface PendingOrganizer {
  id: string;
  organization_name: string;
  organizer_name: string;
  email: string;
  phone: string;
  created_at: string;
  verification_status: string;
  id_document_url: string | null;
  certificate_url: string | null;
}

interface PendingTrip {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration_days: number;
  created_at: string;
  is_active: boolean;
  organizer: {
    organization_name: string;
    organizer_name: string;
  } | null;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  user_id: string;
  roles: string[];
}

interface BookingRow {
  id: string;
  participant_name: string;
  participant_email: string;
  amount_paid: number;
  booking_status: string;
  payment_status: string;
  created_at: string;
  trip: {
    title: string;
    destination: string;
  } | null;
}

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalTrips: 0,
    totalBookings: 0,
    pendingOrganizers: 0,
    totalRevenue: 0,
  });
  
  // Data
  const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizer[]>([]);
  const [allOrganizers, setAllOrganizers] = useState<PendingOrganizer[]>([]);
  const [trips, setTrips] = useState<PendingTrip[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  useEffect(() => {
    if (!authLoading && profile) {
      if (profile.role !== 'admin') {
        toast.error("Access denied. Admin privileges required.");
        navigate('/');
        return;
      }
      fetchAdminData();
    }
  }, [authLoading, profile]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const [usersCount, organizersData, tripsCount, bookingsData] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('organizer_profiles').select('*'),
        supabase.from('trips').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('amount_paid, booking_status, payment_status'),
      ]);

      const organizers = organizersData.data || [];
      const pendingCount = organizers.filter(o => o.verification_status === 'pending').length;
      const revenue = (bookingsData.data || [])
        .filter(b => b.payment_status === 'completed')
        .reduce((sum, b) => sum + Number(b.amount_paid), 0);

      setStats({
        totalUsers: usersCount.count || 0,
        totalOrganizers: organizers.length,
        totalTrips: tripsCount.count || 0,
        totalBookings: (bookingsData.data || []).length,
        pendingOrganizers: pendingCount,
        totalRevenue: revenue,
      });

      // Fetch pending organizers
      const { data: pendingOrgs } = await supabase
        .from('organizer_profiles')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      setPendingOrganizers(pendingOrgs || []);
      setAllOrganizers(organizers);

      // Fetch trips with organizer info
      const { data: tripsData } = await supabase
        .from('trips')
        .select(`
          id, title, destination, price, duration_days, created_at, is_active,
          organizer:organizer_profiles(organization_name, organizer_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setTrips((tripsData as unknown as PendingTrip[]) || []);

      // Fetch users with roles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(50);

      if (profilesData) {
        // Get roles for all users
        const userIds = profilesData.map(p => p.user_id);
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        const usersWithRoles = profilesData.map(p => ({
          ...p,
          roles: (rolesData || []).filter(r => r.user_id === p.user_id).map(r => r.role),
        }));
        setUsers(usersWithRoles);
      }

      // Fetch bookings
      const { data: bookingsDataFull } = await supabase
        .from('bookings')
        .select(`
          id, participant_name, participant_email, amount_paid, booking_status, payment_status, created_at,
          trip:trips(title, destination)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setBookings((bookingsDataFull as unknown as BookingRow[]) || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganizer = async (organizerId: string) => {
    try {
      const { error } = await supabase
        .from('organizer_profiles')
        .update({ verification_status: 'approved', is_verified: true })
        .eq('id', organizerId);

      if (error) throw error;
      
      toast.success('Organizer approved successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error approving organizer:', error);
      toast.error('Failed to approve organizer');
    }
  };

  const handleRejectOrganizer = async (organizerId: string) => {
    try {
      const { error } = await supabase
        .from('organizer_profiles')
        .update({ verification_status: 'rejected', is_verified: false })
        .eq('id', organizerId);

      if (error) throw error;
      
      toast.success('Organizer rejected');
      fetchAdminData();
    } catch (error) {
      console.error('Error rejecting organizer:', error);
      toast.error('Failed to reject organizer');
    }
  };

  const handleToggleTripStatus = async (tripId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ is_active: !currentStatus })
        .eq('id', tripId);

      if (error) throw error;
      
      toast.success(`Trip ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchAdminData();
    } catch (error) {
      console.error('Error updating trip status:', error);
      toast.error('Failed to update trip status');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  const filteredOrganizers = allOrganizers.filter(o => 
    o.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.organizer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrips = trips.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-hero mx-auto mb-3 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="font-display font-bold text-card-foreground">Admin Panel</h2>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>

                <nav className="space-y-1">
                  {[
                    { id: "overview" as AdminTab, label: "Overview", icon: BarChart3 },
                    { id: "organizers" as AdminTab, label: "Organizers", icon: Building2, badge: stats.pendingOrganizers },
                    { id: "trips" as AdminTab, label: "Trips", icon: MapPin },
                    { id: "users" as AdminTab, label: "Users", icon: Users },
                    { id: "bookings" as AdminTab, label: "Bookings", icon: Calendar },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </span>
                      {item.badge ? (
                        <Badge variant="destructive" className="text-xs">{item.badge}</Badge>
                      ) : null}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-4 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search organizers, trips, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                />
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-card rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs">Users</span>
                      </div>
                      <div className="text-2xl font-bold text-card-foreground">{stats.totalUsers}</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Building2 className="w-4 h-4" />
                        <span className="text-xs">Organizers</span>
                      </div>
                      <div className="text-2xl font-bold text-card-foreground">{stats.totalOrganizers}</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">Trips</span>
                      </div>
                      <div className="text-2xl font-bold text-card-foreground">{stats.totalTrips}</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Bookings</span>
                      </div>
                      <div className="text-2xl font-bold text-card-foreground">{stats.totalBookings}</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Pending</span>
                      </div>
                      <div className="text-2xl font-bold text-warning">{stats.pendingOrganizers}</div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs">Revenue</span>
                      </div>
                      <div className="text-2xl font-bold text-success">
                        ₹{stats.totalRevenue >= 1000 ? `${(stats.totalRevenue/1000).toFixed(1)}K` : stats.totalRevenue}
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  {pendingOrganizers.length > 0 && (
                    <div className="bg-card rounded-xl shadow-md overflow-hidden">
                      <div className="p-6 border-b border-border flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <h2 className="font-display font-bold text-lg text-card-foreground">
                          Pending Organizer Approvals ({pendingOrganizers.length})
                        </h2>
                      </div>
                      <div className="divide-y divide-border">
                        {pendingOrganizers.slice(0, 5).map((org) => (
                          <div key={org.id} className="p-4 md:p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-card-foreground">{org.organization_name}</h3>
                              <p className="text-sm text-muted-foreground">{org.organizer_name} • {org.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Applied {new Date(org.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {org.id_document_url && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={org.id_document_url} target="_blank" rel="noopener noreferrer">
                                    <FileText className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => handleRejectOrganizer(org.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90 text-success-foreground"
                                onClick={() => handleApproveOrganizer(org.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {pendingOrganizers.length > 5 && (
                        <div className="p-4 text-center border-t border-border">
                          <Button variant="ghost" onClick={() => setActiveTab("organizers")}>
                            View All Pending
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recent Trips */}
                  <div className="bg-card rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                      <h2 className="font-display font-bold text-lg text-card-foreground">Recent Trips</h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("trips")}>
                        View All
                      </Button>
                    </div>
                    <div className="divide-y divide-border">
                      {trips.slice(0, 5).map((trip) => (
                        <div key={trip.id} className="p-4 md:p-6 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-card-foreground truncate">{trip.title}</h3>
                              <Badge variant={trip.is_active ? "default" : "secondary"}>
                                {trip.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {trip.destination} • {trip.duration_days} days • ₹{trip.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {trip.organizer?.organization_name || "Unknown"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/trips/${trip.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleTripStatus(trip.id, trip.is_active)}
                            >
                              {trip.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Organizers Tab */}
              {activeTab === "organizers" && (
                <div className="bg-card rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-display font-bold text-lg text-card-foreground">
                      All Organizers ({filteredOrganizers.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {filteredOrganizers.map((org) => (
                      <div key={org.id} className="p-4 md:p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-card-foreground">{org.organization_name}</h3>
                            {org.verification_status === 'approved' && (
                              <BadgeCheck className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{org.organizer_name} • {org.email}</p>
                        </div>
                        <Badge
                          variant={
                            org.verification_status === 'approved' ? 'default' :
                            org.verification_status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {org.verification_status}
                        </Badge>
                        {org.verification_status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleRejectOrganizer(org.id)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleApproveOrganizer(org.id)}
                            >
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredOrganizers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No organizers found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trips Tab */}
              {activeTab === "trips" && (
                <div className="bg-card rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-display font-bold text-lg text-card-foreground">
                      All Trips ({filteredTrips.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {filteredTrips.map((trip) => (
                      <div key={trip.id} className="p-4 md:p-6 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-card-foreground truncate">{trip.title}</h3>
                            <Badge variant={trip.is_active ? "default" : "secondary"}>
                              {trip.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {trip.destination} • {trip.duration_days} days • ₹{trip.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {trip.organizer?.organization_name || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/trips/${trip.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleTripStatus(trip.id, trip.is_active)}
                          >
                            {trip.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredTrips.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No trips found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="bg-card rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-display font-bold text-lg text-card-foreground">
                      All Users ({filteredUsers.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="p-4 md:p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-card-foreground">{user.full_name || "No name"}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.roles.map((role) => (
                            <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div className="bg-card rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-display font-bold text-lg text-card-foreground">
                      All Bookings ({bookings.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-4 md:p-6 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-card-foreground">{booking.trip?.title || "Unknown Trip"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.participant_name} • {booking.participant_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-card-foreground">₹{Number(booking.amount_paid).toLocaleString()}</div>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            <Badge 
                              variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {booking.payment_status}
                            </Badge>
                            <Badge 
                              variant={booking.booking_status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {booking.booking_status}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No bookings found
                      </div>
                    )}
                  </div>
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
