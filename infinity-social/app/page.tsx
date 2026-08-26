'use client';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturedArticles from '@/components/FeaturedArticles';
import CategorySections from '@/components/CategorySections';
import CommunityArticles from '@/components/CommunityArticles';
import Footer from '@/components/Footer';

export default function HomePage() {
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
