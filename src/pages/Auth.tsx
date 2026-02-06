import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Loader2, Gift, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logo from "@/assets/logo.png";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = authSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignup = searchParams.get("mode") === "signup";
  const redirectTo = searchParams.get("redirect");
  const referralCode = searchParams.get("ref");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validReferrer, setValidReferrer] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "customer" | "organizer",
  });

  // Check if already logged in and validate referral code
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectTo || "/");
      }
    });

    // Validate referral code if present
    if (referralCode) {
      validateReferralCode(referralCode);
    }
  }, [navigate, redirectTo, referralCode]);

  const validateReferralCode = async (code: string) => {
    const { data } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    
    if (data) {
      setValidReferrer(data.user_id);
    }
  };

  const validateForm = () => {
    try {
      if (isSignup) {
        signupSchema.parse(formData);
      } else {
        authSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignup) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        // If organizer, create organizer profile
        if (data.user && formData.role === "organizer") {
          const { error: orgError } = await supabase
            .from("organizer_profiles")
            .insert({
              user_id: data.user.id,
              organizer_name: formData.name,
              organization_name: formData.name + "'s Organization",
            });

          if (orgError) {
            console.error("Error creating organizer profile:", orgError);
          }

          // Update role
          await supabase
            .from("user_roles")
            .update({ role: "organizer" })
            .eq("user_id", data.user.id);
        }

        // Track referral signup if valid referrer
        if (data.user && validReferrer) {
          await supabase
            .from('referrals')
            .insert({
              referrer_id: validReferrer,
              referred_user_id: data.user.id,
              referral_type: 'signup',
              status: 'completed',
              converted_at: new Date().toISOString(),
            });
        }

        toast.success("Account created successfully! Please check your email to verify.");
        navigate(redirectTo || "/");
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Welcome back!");
        navigate(redirectTo || "/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <img src={logo} alt="ShubhSafar Logo" className="h-16 w-auto" />
            <span className="font-display text-xl font-bold text-foreground">ShubhSafar</span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignup 
              ? "Start your journey with us today" 
              : "Sign in to continue your adventure"
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {isSignup && (
              <>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <Label>I want to</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "customer" })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.role === "customer"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="font-semibold text-card-foreground">Book Trips</div>
                      <div className="text-sm text-muted-foreground">As a traveler</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "organizer" })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.role === "organizer"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="font-semibold text-card-foreground">List Trips</div>
                      <div className="text-sm text-muted-foreground">As an organizer</div>
                    </button>
                  </div>
                </div>

                {/* Referral Code */}
                <div>
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <div className="relative mt-1">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code"
                      defaultValue={referralCode || ""}
                      readOnly={!!validReferrer}
                      className={`pl-10 uppercase ${validReferrer ? "border-success bg-success/5" : ""}`}
                    />
                    {validReferrer && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
                    )}
                  </div>
                  {validReferrer && (
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Valid referral code applied!
                    </p>
                  )}
                </div>
              </>
            )}

            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {isSignup ? (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/auth?mode=signup" className="text-primary font-medium hover:underline">
                  Create one
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground max-w-lg">
            <h2 className="font-display text-3xl font-bold mb-4">
              Your Next Adventure Awaits
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Join thousands of travelers discovering amazing trips curated by verified organizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
