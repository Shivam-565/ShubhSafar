import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'organizer' | 'admin';
  avatar_url?: string;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get roles
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    let role: 'customer' | 'organizer' | 'admin' = 'customer';
    if (rolesData && rolesData.length > 0) {
      const roles = rolesData.map(r => r.role);
      if (roles.includes('admin')) role = 'admin';
      else if (roles.includes('organizer')) role = 'organizer';
      else role = 'customer';
    }

    if (profileData) {
      const userProfile: UserProfile = {
        id: userId,
        name: profileData.full_name || 'User',
        email: profileData.email || '',
        role,
        avatar_url: profileData.avatar_url,
        createdAt: profileData.created_at,
      };
      setProfile(userProfile);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('shubhsafar_user', JSON.stringify({
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        createdAt: userProfile.createdAt,
      }));
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          localStorage.removeItem('shubhsafar_user');
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('shubhsafar_user');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return { user, session, profile, loading, signOut, refetchProfile: () => user && fetchProfile(user.id) };
}
