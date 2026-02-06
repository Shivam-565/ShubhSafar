import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  Star,
  Settings,
  Heart,
  Clock,
  ChevronRight,
  Phone,
  Pencil,
  Check,
  X,
  Camera,
  Loader2,
  Gift
} from "lucide-react";

interface Booking {
  id: string;
  trip_id: string;
  booking_status: string;
  participants_count: number;
  amount_paid: number;
  created_at: string;
  trip: {
    title: string;
    destination: string;
    duration_days: number;
    start_date: string;
    image_url: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
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
      
      if (profileData) {
        setProfile(profileData);
        setEditedName(profileData.full_name || "");
      }

      // Fetch bookings with trip details
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id,
          trip_id,
          booking_status,
          participants_count,
          amount_paid,
          created_at,
          trip:trips (
            title,
            destination,
            duration_days,
            start_date,
            image_url
          )
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (bookingsData) {
        // Transform the data to match our interface
        const transformedBookings = bookingsData.map((b: any) => ({
          ...b,
          trip: b.trip ? {
            title: b.trip.title,
            destination: b.trip.destination,
            duration_days: b.trip.duration_days,
            start_date: b.trip.start_date,
            image_url: b.trip.image_url
          } : null
        })).filter((b: any) => b.trip !== null);
        setBookings(transformedBookings);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || !user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editedName.trim() })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update name');
    } else {
      setProfile({ ...profile, full_name: editedName.trim() });
      setIsEditingName(false);
      toast.success('Name updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(profile?.full_name || "");
    setIsEditingName(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Calculate stats from bookings
  const stats = {
    totalTrips: bookings.length,
    upcoming: bookings.filter(b => b.booking_status === "confirmed" || b.booking_status === "pending").length,
    completed: bookings.filter(b => b.booking_status === "completed").length,
    totalSpent: bookings.reduce((sum, b) => sum + Number(b.amount_paid), 0),
  };

  const formatAmount = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Please Sign In</h1>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
        <Footer />
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
                {/* Profile */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img 
                      src={getAvatarUrl()} 
                      alt={profile?.full_name || "User"}
                      className="w-20 h-20 rounded-full mx-auto mb-4 bg-muted object-cover"
                    />
                    <label className="absolute bottom-3 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-primary-foreground" />
                      )}
                    </label>
                  </div>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 text-center text-sm max-w-32"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveName}
                        className="p-1 rounded hover:bg-success/10 text-success"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="font-display font-bold text-lg text-card-foreground">
                        {profile?.full_name || "User"}
                      </h2>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Payments
                  </Link>
                  <Link
                    to="/dashboard/referrals"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Gift className="w-5 h-5" />
                    Referrals
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                </nav>

                {/* Emergency Button */}
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
                My Bookings
              </h1>

              {/* Booking Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalTrips}</div>
                  <div className="text-sm text-muted-foreground">Total Trips</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-success">{stats.upcoming}</div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-primary">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-warning">{formatAmount(stats.totalSpent)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="bg-card rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Trip Image */}
                      <div className="w-full md:w-40 h-32 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={booking.trip?.image_url || '/placeholder.svg'} 
                          alt={booking.trip?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Trip Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                              booking.booking_status === "confirmed" 
                                ? "bg-success/10 text-success" 
                                : booking.booking_status === "completed"
                                ? "bg-primary/10 text-primary"
                                : booking.booking_status === "pending"
                                ? "bg-warning/10 text-warning"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
                            </span>
                            <h3 className="font-display font-bold text-lg text-card-foreground">
                              {booking.trip?.title}
                            </h3>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-card-foreground">
                              ₹{Number(booking.amount_paid).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.participants_count} {booking.participants_count === 1 ? "seat" : "seats"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.trip?.destination}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {booking.trip?.start_date ? new Date(booking.trip.start_date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            }) : "TBD"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.trip?.duration_days} {booking.trip?.duration_days === 1 ? "day" : "days"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Booked on {new Date(booking.created_at).toLocaleDateString("en-IN")}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/trips/${booking.trip_id}`}>
                              View Details <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Bookings */}
              {bookings.length === 0 && (
                <div className="text-center py-16 bg-card rounded-xl">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring amazing trips and book your next adventure!
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
