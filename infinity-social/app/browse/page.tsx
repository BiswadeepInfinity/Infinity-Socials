'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaTitleCard from '@/components/MediaTitleCard';
import { getMediaCatalog } from '@/lib/media-data';
import { MediaType } from '@/types/media';

const CATEGORY_TABS: { label: string; value: 'all' | MediaType }[] = [
  { label: 'All Titles', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
  { label: 'Gaming', value: 'game' },
  { label: 'Anime', value: 'anime' },
];

const GENRE_PILLS = [
  'All',
  'Action',
  'Thriller',
  'Sci-Fi',
  'Crime',
  'Dark Fantasy',
  'Horror',
  'Comedy',
  'Mythology',
  'Open World',
  'Superhero',
];

export default function BrowsePage() {
  const [selectedType, setSelectedType] = useState<'all' | MediaType>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const catalog = useMemo(() => getMediaCatalog(), []);

  const filteredTitles = useMemo(() => {
    return catalog.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      // Genre filter
      if (
        selectedGenre !== 'All' &&
        !item.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      ) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDirector = item.directorOrDev?.toLowerCase().includes(q);
        const matchesGenre = item.genres.some((g) => g.toLowerCase().includes(q));
        const matchesTag = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDirector && !matchesGenre && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [catalog, selectedType, selectedGenre, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-rose-500/30">
      <Navbar />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
                Infinity Media Discovery
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Explore Titles & Sub-divided Hubs
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
              Instant access to movies, games, TV series, and anime with dedicated articles, trailers, and social discussions.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles, directors, genres..."
                className="w-full h-11 px-4 pl-10 rounded-xl bg-white/[0.04] border border-white/[0.12] text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
              />
              <span className="absolute left-3.5 top-3 text-white/40 text-xs">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Tabs & Genre Filters */}
        <div className="py-6 space-y-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedType(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all shrink-0 cursor-pointer ${
                  selectedType === tab.value
                    ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.3)]'
                    : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.09] border border-white/[0.06]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Genre Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-zinc-500 font-mono shrink-0 mr-1">GENRE:</span>
            {GENRE_PILLS.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between pb-6 text-xs text-zinc-400 font-mono">
          <span>SHOWING {filteredTitles.length} TITLES</span>
          {(selectedType !== 'all' || selectedGenre !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedGenre('All');
                setSearchQuery('');
              }}
              className="text-rose-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* The Title Cards Grid (Exactly like the Screenshot) */}
        {filteredTitles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredTitles.map((media) => (
              <MediaTitleCard key={media.id} media={media} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/[0.08] rounded-2xl bg-white/[0.02]">
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="text-lg font-bold text-white">No titles match your criteria</h3>
            <p className="text-sm text-zinc-400 mt-1">Try switching categories or clearing search keywords.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
