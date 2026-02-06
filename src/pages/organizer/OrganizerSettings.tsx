import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BarChart3,
  MapPin,
  Calendar,
  Wallet,
  Settings,
  HelpCircle,
  BadgeCheck,
  Camera,
  AlertTriangle,
  Pencil,
  Check,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrganizerProfile {
  id: string;
  organization_name: string;
  organizer_name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  is_verified: boolean | null;
}

export default function OrganizerSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<'name' | 'photo' | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    organization_name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    website: '',
  });

  const MAX_EDITS = 3;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('organizer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } else if (data) {
      setProfile(data);
      setEditedName(data.organizer_name);
      setFormData({
        organization_name: data.organization_name || '',
        description: data.description || '',
        location: data.location || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
      });
      
      // Get edit count from localStorage (per user)
      const storedEditCount = localStorage.getItem(`organizer_edit_count_${user.id}`);
      setEditCount(storedEditCount ? parseInt(storedEditCount) : 0);
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('organizer_profiles')
      .update({
        organization_name: formData.organization_name,
        description: formData.description,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      fetchProfile();
    }
    setSaving(false);
  };

  const getWarningMessage = () => {
    const remaining = MAX_EDITS - editCount;
    if (remaining === MAX_EDITS) {
      return `You can change your ${pendingAction === 'name' ? 'name' : 'profile photo'} ${MAX_EDITS} more times. After that, you'll need to contact support to make changes.`;
    } else if (remaining === 2) {
      return `Warning: You have only ${remaining} changes left for your ${pendingAction === 'name' ? 'name' : 'profile photo'}. Use them wisely!`;
    } else if (remaining === 1) {
      return `⚠️ Last chance! This is your final change for your ${pendingAction === 'name' ? 'name' : 'profile photo'}. After this, you'll need to contact support.`;
    }
    return '';
  };

  const handleNameEdit = () => {
    if (editCount >= MAX_EDITS) {
      toast.error('You have reached the maximum number of edits. Please contact support to change your name.');
      return;
    }
    setPendingAction('name');
    setShowWarning(true);
  };

  const handlePhotoEdit = () => {
    if (editCount >= MAX_EDITS) {
      toast.error('You have reached the maximum number of edits. Please contact support to change your photo.');
      return;
    }
    setPendingAction('photo');
    setShowWarning(true);
  };

  const confirmEdit = async () => {
    setShowWarning(false);
    
    if (pendingAction === 'name') {
      setIsEditingName(true);
    } else if (pendingAction === 'photo') {
      fileInputRef.current?.click();
    }
    setPendingAction(null);
  };

  const handleSaveName = async () => {
    if (!profile || !editedName.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('organizer_profiles')
      .update({ organizer_name: editedName.trim() })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update name');
    } else {
      const newCount = editCount + 1;
      setEditCount(newCount);
      localStorage.setItem(`organizer_edit_count_${user.id}`, newCount.toString());
      toast.success('Name updated successfully!');
      setIsEditingName(false);
      fetchProfile();
      
      // Update localStorage for navbar sync
      const storedUser = localStorage.getItem('shubhsafar_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = editedName.trim();
        localStorage.setItem('shubhsafar_user', JSON.stringify(userData));
      }
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `organizers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Failed to upload photo');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('organizer_profiles')
      .update({ logo_url: publicUrl })
      .eq('id', profile.id);

    if (updateError) {
      toast.error('Failed to update profile photo');
    } else {
      const newCount = editCount + 1;
      setEditCount(newCount);
      localStorage.setItem(`organizer_edit_count_${user.id}`, newCount.toString());
      toast.success('Profile photo updated!');
      fetchProfile();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-4">Please complete your organizer registration first.</p>
            <Button asChild>
              <Link to="/organizer">Become an Organizer</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                {/* Profile */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img 
                      src={profile.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.organizer_name}`}
                      alt={profile.organizer_name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 bg-muted"
                    />
                    <button 
                      onClick={handlePhotoEdit}
                      className="absolute bottom-2 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {isEditingName ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="h-8 text-center text-sm max-w-32"
                          autoFocus
                        />
                        <button onClick={handleSaveName} className="p-1 rounded hover:bg-success/10 text-success">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setIsEditingName(false); setEditedName(profile.organizer_name); }} className="p-1 rounded hover:bg-destructive/10 text-destructive">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="font-display font-bold text-card-foreground">
                          {profile.organizer_name}
                        </h2>
                        <button onClick={handleNameEdit} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                        {profile.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-primary" />
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Organizer</p>
                  
                  {/* Edit count warning */}
                  {editCount > 0 && (
                    <p className="text-xs text-warning mt-2">
                      {MAX_EDITS - editCount} name/photo edits remaining
                    </p>
                  )}
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <Link
                    to="/organizer/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/organizer/trips"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    My Trips
                  </Link>
                  <Link
                    to="/organizer/bookings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    Bookings
                  </Link>
                  <Link
                    to="/organizer/earnings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    Earnings
                  </Link>
                  <Link
                    to="/organizer/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-medium"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <Link
                    to="/help"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Help Center
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-4">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                Settings
              </h1>

              {/* Profile Settings */}
              <div className="bg-card rounded-xl p-6 shadow-md mb-6">
                <h2 className="font-display font-bold text-lg text-card-foreground mb-6">
                  Organization Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="organization_name">Organization Name</Label>
                    <Input
                      id="organization_name"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="mt-1"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="description">About Your Organization</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    rows={4}
                    placeholder="Tell travelers about your organization..."
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {/* Edit Limit Info */}
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-warning mb-1">Profile Photo & Name Change Limit</h3>
                  <p className="text-sm text-muted-foreground">
                    You can change your profile photo and organizer name up to {MAX_EDITS} times. 
                    After that, you'll need to contact our support team to make changes. 
                    This helps maintain trust with travelers who book with you.
                  </p>
                  <p className="text-sm font-medium text-warning mt-2">
                    Edits used: {editCount}/{MAX_EDITS}
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Confirm {pendingAction === 'name' ? 'Name' : 'Photo'} Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getWarningMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEdit}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
