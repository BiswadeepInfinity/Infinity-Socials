'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch existing profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (!profile || !profile.username || profile.username.startsWith('user_temp_') || profile.username.includes('@')) {
          router.push('/auth/onboarding');
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
    });
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
