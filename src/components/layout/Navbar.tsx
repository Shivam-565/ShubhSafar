import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  User, 
  LogOut,
  LayoutDashboard,
  Search,
  ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserData {
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleOnBg = isScrolled || !isHome;
  const defaultText = visibleOnBg ? 'text-foreground' : 'text-background';
  const mutedText = visibleOnBg ? 'text-muted-foreground' : 'text-background/90';
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      // Check if organizer
      const { data: organizerProfile } = await supabase
        .from('organizer_profiles')
        .select('organizer_name')
        .eq('user_id', userId)
        .maybeSingle();

      let role: 'user' | 'organizer' | 'admin' = 'user';
      if (roleData?.role === 'admin') {
        role = 'admin';
      } else if (roleData?.role === 'organizer' || organizerProfile) {
        role = 'organizer';
      }

      const name = organizerProfile?.organizer_name || profile?.full_name || 'User';

      setUser({
        name,
        email: profile?.email || '',
        role,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logged out successfully');
      window.location.href = "/";
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    if (user.role === "admin") return "/admin";
    if (user.role === "organizer") return "/organizer/dashboard";
    return "/dashboard";
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50`}> 
      <div className={`transition-all duration-500 ease-in-out ${isScrolled ? 'mx-4 my-4 backdrop-blur-md bg-card/60 border-b border-border/10 shadow-lg rounded-xl' : (isHome ? 'bg-transparent rounded-none' : 'bg-card/95 backdrop-blur-md border-b border-border rounded-none')}`}> 
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16 lg:h-20 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ShubhSafar Logo" width={64} height={64} className="h-16 w-auto" />
            <span className={`font-display text-xl font-bold ${defaultText}`}>
              ShubhSafar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/trips"
              className={`font-medium transition-colors hover:text-primary ${
                mutedText
              } ${isActive('/trips') ? 'text-primary font-semibold' : ''}`}
            >
              Explore Trips
            </Link>
            <Link
              to="/educational"
              className={`font-medium transition-colors hover:text-primary ${
                mutedText
              } ${isActive('/educational') ? 'text-primary font-semibold' : ''}`}
            >
              Educational Trips
            </Link>
            <Link
              to="/organizer"
              className={`font-medium transition-colors hover:text-primary ${
                mutedText
              } ${isActive('/organizer') ? 'text-primary font-semibold' : ''}`}
            >
              Become an Organizer
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button 
              variant={isHome ? "glass" : "ghost"} 
              size="icon"
              asChild
            >
              <Link to="/trips">
                <Search className="w-5 h-5" />
              </Link>
            </Button>
            
            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={isHome ? "glass" : "outline"}
                    className="gap-2"
                  >
                    <User className="w-4 h-4" />
                    {user.name}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !loading ? (
              <>
                <Button 
                  variant={isHome ? "glass" : "ghost"}
                  asChild
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button 
                  variant={isHome ? "hero" : "default"}
                  asChild
                >
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg ${defaultText}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`lg:hidden absolute ${isScrolled ? 'top-24' : 'top-16'} left-0 right-0 bg-card border-t border-border shadow-lg ${isScrolled ? 'rounded-b-lg' : ''} animate-slide-up`}>
            <div className="container px-4 py-4 flex flex-col gap-2">
              <Link 
                to="/trips" 
                className={`py-3 px-4 rounded-lg hover:bg-muted ${defaultText} font-medium ${isActive('/trips') ? 'text-primary font-semibold' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Explore Trips
              </Link>
              <Link 
                to="/educational" 
                className={`py-3 px-4 rounded-lg hover:bg-muted ${defaultText} font-medium ${isActive('/educational') ? 'text-primary font-semibold' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Educational Trips
              </Link>
              <Link 
                to="/organizer" 
                className={`py-3 px-4 rounded-lg hover:bg-muted ${defaultText} font-medium ${isActive('/organizer') ? 'text-primary font-semibold' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Become an Organizer
              </Link>
              <div className="border-t border-border my-2" />
              {!loading && user ? (
                <>
                  <div className={`py-3 px-4 ${defaultText} font-medium flex items-center gap-2`}>
                    <User className="w-4 h-4" />
                    {user.name}
                  </div>
                  <Link 
                    to={getDashboardLink()} 
                    className="py-3 px-4 rounded-lg hover:bg-muted text-foreground font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="py-3 px-4 rounded-lg hover:bg-muted text-destructive font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : !loading ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="default" className="flex-1" asChild>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
