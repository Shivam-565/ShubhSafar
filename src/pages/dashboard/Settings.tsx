import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart,
  Calendar, 
  CreditCard, 
  Star,
  Settings,
  Phone,
  User,
  Bell,
  Shield,
  Globe,
  Loader2
} from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    location: ""
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    marketing: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/auth');
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
      setProfileForm({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
        location: profileData.location || ""
      });
    }

    // Fetch settings
    const { data: settingsData } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();
    
    if (settingsData) {
      setSettings(settingsData);
      setNotifications({
        email: settingsData.email_notifications ?? true,
        sms: settingsData.sms_notifications ?? false,
        marketing: settingsData.marketing_emails ?? false
      });
    }
    
    setLoading(false);
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        location: profileForm.location
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setProfile({ ...profile, ...profileForm });
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('user_settings')
      .update({
        email_notifications: notifications.email,
        sms_notifications: notifications.sms,
        marketing_emails: notifications.marketing
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update notification settings');
    } else {
      toast.success('Notification settings updated!');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    toast.error('Account deletion requires contacting support. Please email support@shubhsafar.com');
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Payments
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
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
            <main className="lg:col-span-3 space-y-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Settings
              </h1>

              {/* Profile Settings */}
              <div className="bg-card rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-card-foreground">Profile</h2>
                    <p className="text-sm text-muted-foreground">Manage your personal information</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="mt-1 bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 XXXXXXXXXX"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="City, State"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveProfile} className="mt-4" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              {/* Notification Settings */}
              <div className="bg-card rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-card-foreground">Notifications</h2>
                    <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive booking updates via email</p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                    </div>
                    <Switch 
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive offers and promotions</p>
                    </div>
                    <Switch 
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} variant="outline" className="mt-4" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Notifications'}
                </Button>
              </div>

              {/* Security Settings */}
              <div className="bg-card rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-card-foreground">Security</h2>
                    <p className="text-sm text-muted-foreground">Manage your account security</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full md:w-auto"
                    onClick={async () => {
                      const { error } = await supabase.auth.resetPasswordForEmail(user?.email);
                      if (error) {
                        toast.error('Failed to send password reset email');
                      } else {
                        toast.success('Password reset email sent!');
                      }
                    }}
                  >
                    Change Password
                  </Button>
                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="destructive" 
                      className="w-full md:w-auto"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      This action is irreversible. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
