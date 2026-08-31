'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let handled = false;

    const processAuth = async () => {
      // 1. First check active session or exchange token
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error in callback:', error);
      }

      if (session?.user) {
        handled = true;
        try {
          // Fetch existing profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile || !profile.username || profile.username.startsWith('user_temp_') || profile.username.includes('@')) {
            router.replace('/auth/onboarding');
          } else {
            router.replace('/');
          }
        } catch (e) {
          console.error('Profile fetch error, redirecting to onboarding:', e);
          router.replace('/auth/onboarding');
        }
      }
    };

    // Listen to onAuthStateChange in case session is being processed from hash tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !handled) {
        handled = true;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile || !profile.username || profile.username.startsWith('user_temp_') || profile.username.includes('@')) {
            router.replace('/auth/onboarding');
          } else {
            router.replace('/');
          }
        } catch (e) {
          router.replace('/auth/onboarding');
        }
      }
    });

    processAuth();

    // Fallback timeout: if still on callback page after 3.5s, redirect to onboarding or login
    const timeout = setTimeout(async () => {
      if (!handled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          router.replace('/auth/onboarding');
        } else {
          router.replace('/auth/login');
        }
      }
    }, 3500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#040406] flex items-center justify-center text-white">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto" />
        <p className="text-xs text-white/50">Completing sign in…</p>
      </div>
    </div>
  );
}
