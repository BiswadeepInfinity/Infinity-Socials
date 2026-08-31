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
    // If Google OAuth redirects directly to localhost:3000/#access_token=...
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          router.replace('/auth/onboarding');
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          router.replace('/auth/onboarding');
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
