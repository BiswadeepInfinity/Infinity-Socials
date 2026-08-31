'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getMediaById } from '@/lib/media-data';
import { MediaTitle } from '@/types/media';

export default function TitleDetailPage() {
  const params = useParams();
  const idOrSlug = params?.id as string;

  const [media, setMedia] = useState<MediaTitle | null>(null);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [inCollection, setInCollection] = useState(false);
  const [collectionCount, setCollectionCount] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'cast' | 'discussion'>('overview');

  useEffect(() => {
    if (idOrSlug) {
      const found = getMediaById(idOrSlug);
      if (found) {
        setMedia(found);
        setInterestedCount(found.interestedCount);
        setCollectionCount(found.collectionCount || 100);
      }
    }
  }, [idOrSlug]);

  if (!media && idOrSlug) {
    // If not found in catalog
    const fallback = getMediaById(idOrSlug);
    if (!fallback) {
      // Not found
      // we can also auto-create a dynamic mock if needed
    }
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-4">🌀</div>
          <p className="text-zinc-400 font-mono">Loading cinematic hub...</p>
        </div>
      </div>
    );
  }

  const handleInterestedToggle = () => {
    if (isInterested) {
      setIsInterested(false);
      setInterestedCount((prev) => prev - 1);
    } else {
      setIsInterested(true);
      setInterestedCount((prev) => prev + 1);
    }
  };

  const handleCollectionToggle = () => {
    if (inCollection) {
      setInCollection(false);
      setCollectionCount((prev) => prev - 1);
    } else {
      setInCollection(true);
      setCollectionCount((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-rose-500/30">
      <Navbar />

      {/* Cinematic Hero Backdrop matching Moctale UI */}
      <div className="relative w-full min-h-[460px] sm:min-h-[540px] flex items-center justify-center overflow-hidden border-b border-white/[0.08]">
        {/* Background Image with Blur and Gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url(${media.backdropUrl || media.posterUrl})`,
            filter: 'brightness(0.35) contrast(1.1) blur(1px)',
          }}
        />

        {/* Ambient Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/90 via-transparent to-[#050508]/90" />

        {/* Floating Play Trailer Button in Center */}
        {media.trailerYoutubeId && (
          <button
            onClick={() => setShowTrailer(true)}
            className="group relative z-20 flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-110 cursor-pointer"
            aria-label="Play Trailer"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.25)] group-hover:border-white group-hover:bg-white/20 group-hover:shadow-[0_0_40px_rgba(244,63,94,0.5)] transition-all">
              <span className="text-white text-2xl sm:text-3xl ml-1">▶</span>
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white/80 group-hover:text-white drop-shadow">
              Watch Official Trailer
            </span>
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      <main className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 -mt-36 sm:-mt-44 z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Vertical Poster Card & Metadata */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div className="w-60 sm:w-72 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-black relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.posterUrl}
                alt={media.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-lg">
                  {media.badge}
                </span>
              </div>
            </div>

            {/* Quick Metadata List */}
            <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-400">Category</span>
                <span className="font-semibold text-white capitalize">{media.type}</span>
              </div>
              {media.directorOrDev && (
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-zinc-400">
                    {media.type === 'game' ? 'Developer' : 'Directed By'}
                  </span>
                  <span className="font-semibold text-white text-right">{media.directorOrDev}</span>
                </div>
              )}
              {media.country && (
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-zinc-400">Country</span>
                  <span className="font-semibold text-white">{media.country}</span>
                </div>
              )}
              {media.language && (
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-zinc-400">Language</span>
                  <span className="font-semibold text-white">{media.language}</span>
                </div>
              )}
              {media.durationOrPlatforms && (
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-zinc-400">
                    {media.type === 'game' ? 'Platforms' : 'Runtime'}
                  </span>
                  <span className="font-semibold text-white text-right truncate max-w-[180px]">
                    {media.durationOrPlatforms}
                  </span>
                </div>
              )}
              {media.status && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status</span>
                  <span className="font-mono text-emerald-400 font-bold">{media.status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title Header, Actions, Overview & Sub-divided Articles */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Header & Badges */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
                <span>{media.type.toUpperCase()}</span>
                <span>•</span>
                <span>{media.releaseYear}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {media.title}
              </h1>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {media.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/[0.06] border border-white/[0.1] text-zinc-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Glowing Action Buttons (Match Moctale Screenshot 2) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleInterestedToggle}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isInterested
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                    : 'bg-gradient-to-r from-rose-600/90 to-orange-600/90 hover:from-rose-500 hover:to-orange-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                }`}
              >
                <span>🔥</span>
                <span>{isInterested ? 'Marked as Interested' : 'Mark as Interested'}</span>
                <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">
                  {interestedCount}
                </span>
              </button>

              <button
                onClick={handleCollectionToggle}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  inCollection
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.12] text-white'
                }`}
              >
                <span>📑</span>
                <span>{inCollection ? 'In Collection' : 'Add to Collection'}</span>
                <span className="text-zinc-400 font-mono text-[11px]">({collectionCount})</span>
              </button>

              <Link
                href={`/channels?discuss=${encodeURIComponent(media.title)}`}
                className="px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-white flex items-center justify-center gap-2 no-underline"
              >
                <span>💬</span>
                <span>Community Channel</span>
              </Link>
            </div>

            {/* Navigation Tabs for Sub-divided Content */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] pt-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-bold tracking-tight transition-all border-b-2 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'text-white border-rose-500'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab('articles')}
                className={`pb-3 text-sm font-bold tracking-tight transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'articles'
                    ? 'text-white border-rose-500'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`}
              >
                <span>Articles & Critiques</span>
                {media.relatedArticles && media.relatedArticles.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-mono">
                    {media.relatedArticles.length}
                  </span>
                )}
              </button>

              {media.cast && media.cast.length > 0 && (
                <button
                  onClick={() => setActiveTab('cast')}
                  className={`pb-3 text-sm font-bold tracking-tight transition-all border-b-2 cursor-pointer ${
                    activeTab === 'cast'
                      ? 'text-white border-rose-500'
                      : 'text-zinc-400 border-transparent hover:text-zinc-200'
                  }`}
                >
                  Cast & Crew
                </button>
              )}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-base font-bold text-white mb-2">Overview</h3>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                    {media.overview}
                  </p>
                </div>

                {/* Sub-divided Related Articles Preview Inside Overview */}
                {media.relatedArticles && media.relatedArticles.length > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Featured Coverage & Editorials
                      </h4>
                      <button
                        onClick={() => setActiveTab('articles')}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        View All ({media.relatedArticles.length}) →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {media.relatedArticles.map((art) => (
                        <Link
                          key={art.id}
                          href={`/reviews?article=${art.slug}`}
                          className="group block p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all no-underline"
                        >
                          <div className="flex items-start gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={art.thumbnail}
                              alt={art.title}
                              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono font-bold uppercase text-rose-400">
                                {art.category} • {art.readTime}
                              </span>
                              <h5 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-2 mt-0.5 group-hover:text-rose-300 transition-colors">
                                {art.title}
                              </h5>
                              <span className="text-[10px] text-zinc-500 block mt-1">
                                By {art.author} • {art.publishedAt}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Subdivided Articles Hub */}
            {activeTab === 'articles' && (
              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    All Articles, Breakdowns & Reviews for {media.title}
                  </h3>
                  <Link
                    href="/reviews"
                    className="text-xs text-rose-400 hover:underline no-underline"
                  >
                    Explore Global Reviews →
                  </Link>
                </div>

                {media.relatedArticles && media.relatedArticles.length > 0 ? (
                  <div className="space-y-3">
                    {media.relatedArticles.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.thumbnail}
                            alt={art.title}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white">
                                {art.category}
                              </span>
                              <span className="text-xs text-zinc-400">{art.readTime}</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                              {art.title}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              Written by <span className="text-zinc-200">{art.author}</span> • {art.publishedAt}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/reviews?article=${art.slug}`}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white text-center no-underline transition-all shrink-0"
                        >
                          Read Article
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-white/[0.08] rounded-xl bg-white/[0.02]">
                    <p className="text-zinc-400 text-sm">
                      No dedicated articles published yet for this title.
                    </p>
                    <Link
                      href="/channels"
                      className="inline-block mt-3 px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold no-underline"
                    >
                      Start First Community Post
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Cast & Crew */}
            {activeTab === 'cast' && media.cast && (
              <div className="pt-2">
                <h3 className="text-base font-bold text-white mb-4">Cast, Crew & Key Creatives</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {media.cast.map((c) => (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white truncate">{c.name}</h5>
                        <p className="text-[10px] text-zinc-400 truncate">{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎬</span> {media.title} — Official Trailer
              </h3>
              <button
                onClick={() => setShowTrailer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${media.trailerYoutubeId}?autoplay=1&rel=0`}
                title={`${media.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
