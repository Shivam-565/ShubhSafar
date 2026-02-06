import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useReferral } from "@/hooks/useReferral";
import { toast } from "sonner";
import {
  User,
  Settings,
  Heart,
  Calendar,
  CreditCard,
  Star,
  Users,
  Gift,
  Copy,
  Share2,
  UserPlus,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function ReferralsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const { referralCode, stats, referrals, loading: referralLoading, getReferralLink } = useReferral(user?.id);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const shareReferral = async () => {
    const link = getReferralLink();
    if (!link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ShubhSafar',
          text: 'Sign up using my referral link and get exclusive discounts on trips!',
          url: link,
        });
      } catch (error) {
        copyToClipboard(link, 'Referral link');
      }
    } else {
      copyToClipboard(link, 'Referral link');
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'User'}`;
  };

  if (loading || referralLoading) {
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
            <h1 className="font-display text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to view your referrals.</p>
            <Button asChild>
              <Link to="/auth?redirect=/dashboard/referrals">Login</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const referralLink = getReferralLink();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                <div className="flex flex-col items-center text-center mb-6">
                  <img
                    src={getAvatarUrl()}
                    alt={profile?.full_name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                  <h2 className="font-semibold text-card-foreground">{profile?.full_name || 'User'}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <nav className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    to="/dashboard/wishlist"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                  </Link>
                  <Link
                    to="/dashboard/payments"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Payments</span>
                  </Link>
                  <Link
                    to="/dashboard/reviews"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    <span>My Reviews</span>
                  </Link>
                  <Link
                    to="/dashboard/referrals"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                  >
                    <Gift className="w-5 h-5" />
                    <span>Referrals</span>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Referral Code Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Your Referral Code
                  </CardTitle>
                  <CardDescription>
                    Share your unique code with friends and earn rewards when they sign up or book trips!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Your Code
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={referralCode || 'Loading...'}
                          readOnly
                          className="font-mono text-lg font-bold"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(referralCode || '', 'Referral code')}
                          disabled={!referralCode}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Share Link
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={referralLink || 'Loading...'}
                          readOnly
                          className="text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(referralLink || '', 'Referral link')}
                          disabled={!referralLink}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button onClick={shareReferral} className="w-full sm:w-auto" disabled={!referralLink}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Friends
                  </Button>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalSignups}</p>
                        <p className="text-sm text-muted-foreground">Signups</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                        <p className="text-sm text-muted-foreground">Purchases</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Earnings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Referral History */}
              <Card>
                <CardHeader>
                  <CardTitle>Referral History</CardTitle>
                  <CardDescription>
                    Track all your referrals and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No referrals yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Share your referral code with friends to start earning rewards!
                      </p>
                      <Button onClick={shareReferral}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {referrals.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              referral.referral_type === 'signup' 
                                ? 'bg-blue-100 dark:bg-blue-900' 
                                : 'bg-green-100 dark:bg-green-900'
                            }`}>
                              {referral.referral_type === 'signup' ? (
                                <UserPlus className={`w-4 h-4 ${
                                  referral.referral_type === 'signup' 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-green-600 dark:text-green-400'
                                }`} />
                              ) : (
                                <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {referral.referred_user?.full_name || referral.referred_user?.email || 'Anonymous User'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {referral.referral_type === 'signup' ? 'Signed up' : 'Purchased trip'}
                                {referral.trip && ` - ${referral.trip.title}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(referral.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                referral.status === 'completed' ? 'default' :
                                referral.status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {referral.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                            </Badge>
                            {referral.discount_amount > 0 && (
                              <p className="text-sm font-medium text-success mt-1">
                                +₹{referral.discount_amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle>How Referrals Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Share2 className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">1. Share Your Code</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your unique referral code or link with friends and family
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">2. Friends Sign Up</h3>
                      <p className="text-sm text-muted-foreground">
                        When they sign up using your code, you both get tracked
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
                      <p className="text-sm text-muted-foreground">
                        Get discounts when they book trips with referral-enabled discounts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
