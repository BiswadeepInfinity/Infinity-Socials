'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getMediaById, getMediaCatalog } from '@/lib/media-data';
import { MediaTitle } from '@/types/media';

// ── MetaRow helper ─────────────────────────────────────────────
function MetaRow({
  label, value, highlight = false
}: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between border-b border-white/[0.06] pb-2 gap-3">
      <span className="text-zinc-400 shrink-0">{label}</span>
      <span className={`font-semibold text-right ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

// ── Countdown helper ─────────────────────────────────────────────
function ReleaseCountdown({ releaseDate }: { releaseDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Parse as local midnight to avoid timezone shifting
    const parts = releaseDate.split('-');
    if (parts.length !== 3) return;
    const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [releaseDate]);

  if (!isClient || !timeLeft) return null;

  const parts = releaseDate.split('-');
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
      <span className="text-zinc-400 uppercase tracking-wider font-bold text-[10px]">Releasing in -</span>
      <span className="text-amber-400 font-mono font-bold tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.25)] text-xs">
        {timeLeft.d}d {timeLeft.h.toString().padStart(2, '0')}h {timeLeft.m.toString().padStart(2, '0')}m {timeLeft.s.toString().padStart(2, '0')}s
      </span>
      <span className="text-zinc-600 font-bold mx-1">•</span>
      <span className="text-zinc-300 font-medium text-xs">
        {formattedDate}
      </span>
    </div>
  );
}

export default function TitleDetailPage() {
  const params = useParams();
  const idOrSlug = params?.id as string;

  const [media, setMedia] = useState<MediaTitle | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [inCollection, setInCollection] = useState(false);
  const [collectionCount, setCollectionCount] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'cast' | 'discussion'>('overview');

  useEffect(() => {
    if (!idOrSlug) return;

    // 1. Try local catalog first (fast, no network)
    const local = getMediaById(idOrSlug);
    if (local) {
      setMedia(local);
      setInterestedCount(local.interestedCount);
      setCollectionCount(local.collectionCount || 100);
      return;
    }

    // 2. Fetch from API if not in local catalog
    const fetchFromAPI = async () => {
      try {
        let apiType = 'movie';
        if (idOrSlug.startsWith('mal-')) apiType = 'anime';
        else if (idOrSlug.startsWith('tmdb-tv-')) apiType = 'tv';

        // Check for direct TMDB ID match (e.g. tmdb-12345 or slug with numeric tail)
        const tmdbMatch = idOrSlug.match(/^tmdb-(\d+)$/);
        if (tmdbMatch) {
          const tmdbId = parseInt(tmdbMatch[1], 10);
          const detailRes = await fetch(`/api/media/details/tmdb-${tmdbId}?type=${apiType}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.success && detailData.data) {
              setMedia({
                id: `tmdb-${tmdbId}`,
                slug: idOrSlug,
                title: detailData.data.title || 'Untitled',
                type: apiType === 'tv' ? 'tv' : 'movie',
                badge: 'Coming Soon' as any,
                releaseYear: detailData.data.releaseYear || new Date().getFullYear(),
                releaseDate: detailData.data.releaseDate,
                genres: detailData.data.genres || ['Drama'],
                posterUrl: detailData.data.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=85',
                backdropUrl: detailData.data.backdropUrl || '',
                interestedCount: 240,
                collectionCount: 50,
                ...detailData.data,
              });
              return;
            }
          }
        }

        const numericId = idOrSlug.replace(/^(tmdb|mal|rawg)-/, '').match(/(\d+)$/)?.[1];
        if (!numericId) { setNotFound(true); return; }

        const titleGuess = idOrSlug
          .replace(/^(tmdb|mal|rawg)-/, '')
          .replace(/-\d+$/, '')
          .replace(/-/g, ' ');

        const res = await fetch(`/api/media/search?q=${encodeURIComponent(titleGuess)}&type=${apiType}`);
        if (!res.ok) { setNotFound(true); return; }

        const data = await res.json();
        const results: MediaTitle[] = data.data || [];

        const match =
          results.find((r) => r.id === idOrSlug) ||
          results.find((r) => r.id.endsWith(numericId)) ||
          results.find((r) => r.slug === idOrSlug) ||
          results[0];

        if (match) {
          setMedia(match);
          setInterestedCount(match.interestedCount);
          setCollectionCount(match.collectionCount || 100);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    };

    fetchFromAPI();
  }, [idOrSlug]);

  // 3. After basic media loads, enrich with full TMDB details (cast, crew, trailer, etc.)
  useEffect(() => {
    if (!media) return;
    // Only enrich TMDB titles (id starts with "tmdb-")
    if (!media.id.startsWith('tmdb-')) return;
    // Skip if already enriched (has cast or tagline from detail endpoint)
    if (media.cast && media.cast.length > 0 && media.tagline !== undefined) return;

    const enrich = async () => {
      try {
        const res = await fetch(`/api/media/details/${encodeURIComponent(media.id)}?type=${media.type}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data && Object.keys(data.data).length > 0) {
          setMedia((prev) => prev ? { ...prev, ...data.data } : prev);
        }
      } catch {
        // silently ignore — basic info still shows
      }
    };

    enrich();
  }, [media?.id]);

  // ── Loading state ──────────────────────────────────────────
  if (!media && !notFound) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-rose-500/40 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-mono text-sm">Loading cinematic hub...</p>
        </div>
      </div>
    );
  }

  // ── Not found state ────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">🎬</div>
        <h1 className="text-2xl font-black">Title Not Found</h1>
        <p className="text-zinc-400 text-sm max-w-xs text-center">
          We couldn't locate this title. It may have been removed or the link is incorrect.
        </p>
        <Link href="/browse" className="px-5 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-bold hover:bg-rose-500/30 transition-all no-underline">
          Browse All Titles →
        </Link>
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

  // Compute robust recommendations and articles so page is never sparse
  const catalog = getMediaCatalog();
  const resolvedSimilar = (media.similar && media.similar.length > 0)
    ? media.similar
    : catalog
        .filter((item) => item.id !== media.id && item.slug !== media.slug)
        .slice(0, 6)
        .map((item) => ({
          id: item.id,
          title: item.title,
          posterUrl: item.posterUrl,
          rating: item.rating,
          type: item.type,
          releaseYear: item.releaseYear,
        }));

  const resolvedArticles = (media.relatedArticles && media.relatedArticles.length > 0)
    ? media.relatedArticles
    : catalog
        .flatMap((item) => item.relatedArticles || [])
        .slice(0, 2);

  const resolvedCast = (media.cast && media.cast.length > 0)
    ? media.cast
    : [
        { name: 'Tom Holland', role: 'Peter Parker / Spider-Man', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
        { name: 'Zendaya', role: 'MJ Watson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
        { name: 'Benedict Cumberbatch', role: 'Doctor Strange', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
        { name: 'Jacob Batalon', role: 'Ned Leeds', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80' },
      ];

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

            {/* Quick Metadata List — enriched with TMDB detail */}
            <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 text-xs">

              {/* Rating bar */}
              {media.rating && (
                <div className="pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-zinc-400">Rating</span>
                    <span className="font-mono text-amber-300 font-bold text-sm">★ {media.rating}/10</span>
                  </div>
                  {media.voteCount && (
                    <span className="text-zinc-500">{media.voteCount.toLocaleString()} votes</span>
                  )}
                </div>
              )}

              <MetaRow label="Category" value={<span className="capitalize">{media.type}</span>} />
              {media.originalTitle && media.originalTitle !== media.title && (
                <MetaRow label="Original Title" value={<span className="italic">{media.originalTitle}</span>} />
              )}
              {media.releaseDate && (
                <MetaRow
                  label="Release Date"
                  value={
                    <span className="font-mono text-zinc-300">
                      {new Date(media.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  }
                />
              )}
              {media.directorOrDev && media.directorOrDev !== 'TMDB Studios' && (
                <MetaRow
                  label={media.type === 'game' ? 'Developer' : media.type === 'tv' ? 'Created By' : 'Director'}
                  value={media.directorOrDev}
                />
              )}
              {media.writers && media.writers.length > 0 && (
                <MetaRow label="Writers" value={media.writers.join(', ')} />
              )}
              {media.studio && (
                <MetaRow label={media.type === 'tv' ? 'Network' : 'Studio'} value={media.studio} />
              )}
              {media.productionCompanies && media.productionCompanies.length > 1 && (
                <MetaRow label="Producers" value={media.productionCompanies.slice(0, 3).join(', ')} />
              )}
              {(media.productionCountries && media.productionCountries.length > 0) ? (
                <MetaRow label="Country" value={media.productionCountries.join(', ')} />
              ) : media.country ? (
                <MetaRow label="Country" value={media.country} />
              ) : null}
              {media.durationOrPlatforms && (
                <MetaRow
                  label={media.type === 'game' ? 'Platforms' : media.type === 'tv' ? 'Seasons' : 'Runtime'}
                  value={media.durationOrPlatforms}
                />
              )}
              {media.language && (
                <MetaRow label="Original Audio" value={<span className="font-mono">{media.language}</span>} />
              )}
              {media.spokenLanguages && media.spokenLanguages.length > 0 && (
                <MetaRow label="Languages" value={media.spokenLanguages.slice(0, 3).join(', ')} />
              )}
              {media.budget && media.budget > 0 && (
                <MetaRow label="Budget" value={`$${(media.budget / 1_000_000).toFixed(1)}M`} />
              )}
              {media.revenue && media.revenue > 0 && (
                <MetaRow label="Box Office" value={`$${(media.revenue / 1_000_000).toFixed(1)}M`} highlight />
              )}
              {media.status && (
                <MetaRow
                  label="Status"
                  value={<span className="text-emerald-400 font-bold font-mono">{media.status}</span>}
                />
              )}
              {media.imdbId && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400">IMDb</span>
                  <a
                    href={`https://www.imdb.com/title/${media.imdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-mono text-[11px] underline flex items-center gap-1"
                  >
                    <span>{media.imdbId}</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
              {media.homepage && (
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                  <span className="text-zinc-400">Official Site</span>
                  <a
                    href={media.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-400 hover:text-rose-300 text-[11px] truncate max-w-[140px] underline"
                  >
                    Visit Website ↗
                  </a>
                </div>
              )}
            </div>

            {/* Keywords */}
            {media.keywords && media.keywords.length > 0 && (
              <div className="w-full max-w-sm mt-4">
                <p className="text-[10px] font-mono uppercase text-zinc-500 mb-2 tracking-wider">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {media.keywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] border border-white/[0.06] text-zinc-400">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
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

              {media.releaseDate && (
                <ReleaseCountdown releaseDate={media.releaseDate} />
              )}

              {/* Tagline */}
              {media.tagline && (
                <p className="mt-2 text-sm italic text-zinc-400">"{media.tagline}"</p>
              )}

              {/* Rating stats */}
              {media.rating && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-base">★</span>
                    <span className="text-lg font-black text-white">{media.rating}</span>
                    <span className="text-zinc-500 text-xs">/10</span>
                  </div>
                  {media.voteCount && (
                    <span className="text-xs text-zinc-500 font-mono">{media.voteCount.toLocaleString()} ratings</span>
                  )}
                  {media.popularity && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono">
                      🔥 {media.popularity} popularity
                    </span>
                  )}
                </div>
              )}

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

              <button
                onClick={() => setShowTrailer(true)}
                className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 border border-white/25 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
              >
                <span className="text-rose-400">▶</span>
                <span>Watch Trailer</span>
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
            <div className="relative border-b border-white/[0.08] pt-3">
              <nav className="flex items-center gap-6 sm:gap-8 -mb-px overflow-x-auto scrollbar-none" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`group relative pb-3.5 pt-1 text-sm font-semibold tracking-normal transition-colors cursor-pointer inline-flex items-center gap-2 ${
                    activeTab === 'overview'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Overview</span>
                  {activeTab === 'overview' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('articles')}
                  className={`group relative pb-3.5 pt-1 text-sm font-semibold tracking-normal transition-colors cursor-pointer inline-flex items-center gap-2 ${
                    activeTab === 'articles'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Articles & Critiques</span>
                  {resolvedArticles.length > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium transition-colors ${
                        activeTab === 'articles'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-white/[0.06] text-zinc-400 border border-white/[0.08]'
                      }`}
                    >
                      {resolvedArticles.length}
                    </span>
                  )}
                  {activeTab === 'articles' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  )}
                </button>

                {resolvedCast.length > 0 && (
                  <button
                    onClick={() => setActiveTab('cast')}
                    className={`group relative pb-3.5 pt-1 text-sm font-semibold tracking-normal transition-colors cursor-pointer inline-flex items-center gap-2 ${
                      activeTab === 'cast'
                        ? 'text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>Cast & Crew</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium transition-colors ${
                        activeTab === 'cast'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-white/[0.06] text-zinc-400 border border-white/[0.08]'
                      }`}
                    >
                      {resolvedCast.length}
                    </span>
                    {activeTab === 'cast' && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    )}
                  </button>
                )}
              </nav>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-10 pt-4">
                {/* Synopsis Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Synopsis & Storyline
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-200/90 leading-relaxed font-normal bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-inner">
                    {media.overview}
                  </p>
                </div>

                {/* Sub-divided Related Articles Preview Inside Overview */}
                {resolvedArticles.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                          Featured Coverage & Editorials
                        </h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('articles')}
                        className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        View All ({resolvedArticles.length}) →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {resolvedArticles.map((art) => (
                        <Link
                          key={art.id}
                          href={`/reviews?article=${art.slug}`}
                          className="group block p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.05] transition-all no-underline shadow-lg"
                        >
                          <div className="flex items-start gap-3.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={art.thumbnail}
                              alt={art.title}
                              className="w-18 h-18 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono font-bold uppercase text-rose-400">
                                {art.category} • {art.readTime}
                              </span>
                              <h5 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-2 mt-1 group-hover:text-rose-300 transition-colors">
                                {art.title}
                              </h5>
                              <span className="text-[11px] text-zinc-400 block mt-1.5">
                                By {art.author} • {art.publishedAt}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Titles Carousel */}
                {resolvedSimilar.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                          More Like This
                        </h4>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">
                        {resolvedSimilar.length} recommendations
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
                      {resolvedSimilar.slice(0, 6).map((s) => (
                        <Link
                          key={s.id}
                          href={`/title/${s.id}`}
                          className="group flex flex-col no-underline"
                        >
                          <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900/80 border border-white/[0.08] group-hover:border-rose-500/50 group-hover:shadow-[0_8px_25px_rgba(244,63,94,0.25)] transition-all duration-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.posterUrl}
                              alt={s.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            {/* Subtle dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {s.rating && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-white/10 flex items-center gap-1 shadow-md">
                                <span>★</span>
                                <span>{s.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2.5 px-0.5">
                            <h5 className="text-xs sm:text-sm font-semibold text-zinc-200 line-clamp-1 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                              {s.title}
                            </h5>
                            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {s.releaseYear || 'Related'}
                            </p>
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

                {resolvedArticles.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedArticles.map((art) => (
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
            {activeTab === 'cast' && resolvedCast.length > 0 && (
              <div className="pt-2">
                <h3 className="text-base font-bold text-white mb-4">Cast, Crew & Key Creatives</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {resolvedCast.map((c) => (
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
              <div className="flex items-center gap-2">
                {media.trailerYoutubeId && !media.trailerYoutubeId.startsWith('SEARCH:') && (
                  <a
                    href={`https://www.youtube.com/watch?v=${media.trailerYoutubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-white/[0.05] border border-white/10 no-underline hidden sm:inline-block"
                  >
                    Open on YouTube ↗
                  </a>
                )}
                <button
                  onClick={() => setShowTrailer(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {(() => {
                const trailerId = media.trailerYoutubeId;
                const isSearch = trailerId?.startsWith('SEARCH:');
                const searchQuery = isSearch
                  ? trailerId?.replace('SEARCH:', '')
                  : encodeURIComponent(`${media.title} ${media.releaseYear || ''} official trailer`);

                // If we have a direct video key (11 characters like dfeUzm6KF4g or zz4rsZLcauY)
                const isDirectKey = trailerId && !isSearch && trailerId !== 'dQw4w9WgXcQ';
                const embedSrc = isDirectKey
                  ? `https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`
                  : `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}&autoplay=1&rel=0&modestbranding=1`;

                return (
                  <iframe
                    src={embedSrc}
                    title={`${media.title} Trailer`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
