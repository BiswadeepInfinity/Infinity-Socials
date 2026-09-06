'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturedArticles from '@/components/FeaturedArticles';
import CategorySections from '@/components/CategorySections';
import CommunityArticles from '@/components/CommunityArticles';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If Google OAuth redirects with an access token in the hash
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const checkAndRedirect = async (sessionUser: any) => {
        if (!sessionUser) return;
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (!prof || !prof.username || prof.username.startsWith('user_temp_') || prof.username.includes('@')) {
            router.replace('/auth/onboarding');
          } else {
            // Already has valid profile, remove hash and stay on homepage
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch {
          // If error, stay on page
        }
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          checkAndRedirect(session.user);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          checkAndRedirect(session.user);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [router]);

  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedArticles />
      <CommunityArticles />
      <CategorySections />
      <Footer />
    </main>
  );
}
