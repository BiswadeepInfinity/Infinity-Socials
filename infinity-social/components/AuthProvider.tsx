'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  needsOnboarding: false,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, userMeta?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else {
        // Fallback: create temporary profile record requiring onboarding
        const fallbackProfile = {
          id: userId,
          username: `user_temp_${userId.slice(0, 8)}`,
          display_name: userMeta?.user_metadata?.full_name || userMeta?.user_metadata?.name || '',
          avatar_url: userMeta?.user_metadata?.avatar_url || userMeta?.user_metadata?.picture || null,
          role: 'user' as const,
        };
        const { data: createdProf } = await supabase
          .from('profiles')
          .upsert(fallbackProfile)
          .select()
          .single();

        setProfile(createdProf ? (createdProf as Profile) : (fallbackProfile as any));
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  };

  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchProfile(session.user.id, session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.id) {
          await fetchProfile(session.user.id, session.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // If user is authenticated, but their profile username is missing or default temporary
  const needsOnboarding = Boolean(
    user && (!profile || !profile.username || profile.username.startsWith('user_temp_') || profile.username.includes('@'))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        needsOnboarding,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
