'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaTitleCard from '@/components/MediaTitleCard';
import { MediaTitle, MediaType } from '@/types/media';

const PAGE_SIZE = 20; // cards per batch

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const CATEGORY_TABS: { label: string; value: 'all' | 'upcoming' | MediaType; emoji: string }[] = [
  { label: 'All Titles', value: 'all', emoji: '✦' },
  { label: 'Movies', value: 'movie', emoji: '🎬' },
  { label: 'TV Shows', value: 'tv', emoji: '📺' },
  { label: 'Gaming', value: 'game', emoji: '🎮' },
  { label: 'Anime', value: 'anime', emoji: '⛩️' },
  { label: 'Upcoming', value: 'upcoming', emoji: '🗓️' },
];

const GENRE_PILLS_BY_TYPE: Record<string, string[]> = {
  all:       ['All', 'Action', 'Adventure', 'Sci-Fi', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Fantasy', 'Romance', 'Crime'],
  movie:     ['All', 'Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'],
  tv:        ['All', 'Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'],
  game:      ['All', 'Action RPGs', 'Open World', 'FPS & Shooters', 'Survival Horror', 'Strategy', 'Sports', 'Indie', 'Platformer'],
  anime:     ['All', 'Shonen Battle', 'Isekai', 'Dark Fantasy & Seinen', 'Mecha & Sci-Fi', 'Slice of Life', 'Romance', 'Horror'],
  upcoming:  ['All', 'Action', 'Adventure', 'Sci-Fi', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Fantasy', 'Romance'],
};

// Fuzzy sub-genre alias matching — covers both MAL tags and TMDB TV fallback genres
const SUB_GENRE_ALIASES: Record<string, string[]> = {
  // Games
  'action rpgs':            ['action', 'rpg', 'role-playing', 'role playing'],
  'fps & shooters':         ['fps', 'shooter', 'first-person', 'tactical shooter'],
  'survival horror':        ['survival', 'horror', 'survival horror'],
  'indie gems':             ['indie', 'independent'],
  'open world':             ['open world', 'sandbox', 'exploration'],
  // Anime — MAL genre names & card titles
  'shonen battle':          ['shonen', 'shounen', 'action', 'battle', 'fighting'],
  'dark fantasy & seinen':  ['dark fantasy', 'seinen', 'dark', 'psychological', 'gore', 'supernatural', 'war & politics'],
  'mecha & sci-fi':         ['mecha', 'sci-fi', 'science fiction', 'robot', 'space', 'sci-fi & fantasy'],
  'cyberpunk & mecha':      ['mecha', 'sci-fi', 'science fiction', 'robot', 'cyberpunk'],
  'isekai':                 ['isekai', 'fantasy', 'adventure', 'sci-fi & fantasy'],
  'isekai & power fantasy': ['isekai', 'fantasy', 'adventure', 'action'],
  'slice of life':          ['slice of life', 'everyday life', 'school', 'romance'],
  'slice of life & romance':['slice of life', 'everyday life', 'school', 'romance'],
  // Movies / TV genres & card titles
  'sci-fi & cyberpunk':     ['sci-fi', 'science fiction', 'cyberpunk', 'futuristic', 'sci-fi & fantasy'],
  'cinematic epics':        ['adventure', 'epic', 'action', 'war', 'history', 'drama'],
  'psychological thrillers':['psychological', 'thriller', 'mystery', 'crime'],
  'blockbuster universes':  ['action', 'adventure', 'sci-fi', 'superhero', 'fantasy'],
  'auteur & indie cinema':  ['drama', 'independent', 'indie', 'auteur', 'festival'],
  // TMDB TV fallback — these show when Jikan is rate-limited
  'action & adventure':     ['action', 'battle', 'shonen', 'adventure'],
  'sci-fi & fantasy':       ['sci-fi', 'fantasy', 'mecha', 'isekai'],
  'war & politics':         ['seinen', 'war', 'dark fantasy'],
};

// Map category card names from homepage to standard browse genre pills
const CATEGORY_TO_PILL_MAP: Record<string, string> = {
  // Cinema & Film Spotlight
  'sci-fi & cyberpunk': 'Sci-Fi',
  'cinematic epics': 'Adventure',
  'psychological thrillers': 'Thriller',
  'blockbuster universes': 'Action',
  'auteur & indie cinema': 'Drama',
  // Games
  'action rpgs': 'Action RPGs',
  'open world': 'Open World',
  'indie gems': 'Indie',
  'fps & shooters': 'FPS & Shooters',
  'survival horror': 'Survival Horror',
  // Anime & Manga Radar
  'shonen battle': 'Shonen Battle',
  'dark fantasy & seinen': 'Dark Fantasy & Seinen',
  'isekai & power fantasy': 'Isekai',
  'cyberpunk & mecha': 'Mecha & Sci-Fi',
  'slice of life & romance': 'Slice of Life',
};

function resolveGenrePill(rawGenre: string | null): string {
  if (!rawGenre || !rawGenre.trim()) return 'All';
  const decoded = decodeURIComponent(rawGenre).trim();
  const lower = decoded.toLowerCase();
  if (CATEGORY_TO_PILL_MAP[lower]) {
    return CATEGORY_TO_PILL_MAP[lower];
  }
  return decoded;
}

function genreMatchesPill(itemGenres: string[], itemTags: string[] | undefined, pill: string): boolean {
  if (pill === 'All') return true;
  const pillLower = pill.toLowerCase();

  // Combine genres + tags into one searchable pool (all lowercase)
  const allText = [
    ...(itemGenres || []).map((g) => g.toLowerCase()),
    ...(itemTags || []).map((t) => t.toLowerCase()),
  ];

  // Use alias map if it exists, otherwise split the pill on & and ,
  const aliases = SUB_GENRE_ALIASES[pillLower] ||
    pillLower.split(/\s*[&,]\s*/).map((t) => t.trim());

  return aliases.some((alias) => allText.some((text) => text.includes(alias)));
}

// ─────────────────────────────────────────────────────────────
// Inner component (needs Suspense because of useSearchParams)
// ─────────────────────────────────────────────────────────────
function BrowsePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialType = (searchParams.get('type') as MediaType | 'all' | 'upcoming') || 'all';
  const initialGenre = resolveGenrePill(searchParams.get('genre'));

  const [selectedType, setSelectedType] = useState<'all' | 'upcoming' | MediaType>(initialType);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [titles, setTitles] = useState<MediaTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ── Infinite scroll state ─────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastFetchedKeyRef = useRef<string>('');
  const genrePills = GENRE_PILLS_BY_TYPE[selectedType] || GENRE_PILLS_BY_TYPE['all'];

  // ── Fetch from /api/media/search ──────────────────────────
  const fetchTitles = useCallback(async (type: string, query: string) => {
    const fetchKey = `${type}::${query}`;
    if (lastFetchedKeyRef.current === fetchKey && titles.length > 0) {
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    try {
      const apiType = type === 'all' ? 'all' : type;
      let res: Response;

      if (type === 'upcoming') {
        res = await fetch(`/api/media/upcoming?type=all`, { signal: ctrl.signal });
      } else if (!query.trim()) {
        // No search query → hit catalog endpoint (returns 80+ titles for movies/tv)
        res = await fetch(`/api/media/search?type=${apiType}`, { signal: ctrl.signal });
      } else {
        // Keyword search — single request
        res = await fetch(
          `/api/media/search?q=${encodeURIComponent(query)}&type=${apiType}`,
          { signal: ctrl.signal }
        );
      }

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (!ctrl.signal.aborted) {
        setTitles((data.data as MediaTitle[]) || []);
        lastFetchedKeyRef.current = fetchKey;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to load titles. Try again.');
      }
    } finally {
      if (!ctrl.signal.aborted) {
        setLoading(false);
      }
    }
  }, [titles.length]);

  // Sync state when URL params change (e.g. clicking category cards on homepage)
  useEffect(() => {
    const t = (searchParams.get('type') as MediaType | 'all') || 'all';
    const g = resolveGenrePill(searchParams.get('genre'));
    setSelectedType(t);
    setSelectedGenre(g);
    fetchTitles(t, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => fetchTitles(selectedType, searchQuery), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ── Client-side genre filtering ───────────────────────────
  const filteredTitles = titles.filter((item) => {
    if (!genreMatchesPill(item.genres, item.tags, selectedGenre)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ok =
        item.title.toLowerCase().includes(q) ||
        item.directorOrDev?.toLowerCase().includes(q) ||
        item.genres.some((g) => g.toLowerCase().includes(q)) ||
        item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!ok) return false;
    }
    return true;
  });

  // Reset visible count whenever the filtered list changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredTitles.length, selectedType, selectedGenre]);

  // ── IntersectionObserver sentinel ─────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loadingMore) {
          setVisibleCount((prev) => {
            if (prev >= filteredTitles.length) return prev;
            setLoadingMore(true);
            setTimeout(() => setLoadingMore(false), 300); // brief debounce
            return Math.min(prev + PAGE_SIZE, filteredTitles.length);
          });
        }
      },
      { rootMargin: '200px' } // trigger 200px before bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredTitles.length, loadingMore]);

  const visibleTitles = filteredTitles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTitles.length;

  // ── Handlers ──────────────────────────────────────────────
  function handleTypeChange(type: 'all' | 'upcoming' | MediaType) {
    setSelectedType(type);
    setSelectedGenre('All');
    router.push(`/browse?type=${type}`, { scroll: false });
    fetchTitles(type, searchQuery);
  }

  function handleGenreChange(genre: string) {
    setSelectedGenre(genre);
    const params = new URLSearchParams({ type: selectedType });
    if (genre !== 'All') params.set('genre', genre);
    router.push(`/browse?${params.toString()}`, { scroll: false });
  }

  function handleReset() {
    setSelectedType('all');
    setSelectedGenre('All');
    setSearchQuery('');
    router.push('/browse', { scroll: false });
    fetchTitles('all', '');
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-rose-500/30">
      <Navbar />
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
                Infinity Media Discovery
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Explore Titles &amp; Sub-divided Hubs
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
              Instant access to movies, games, TV series, and anime — powered by TMDB, RAWG &amp; MAL.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, games, anime..."
                className="w-full h-11 px-4 pl-10 rounded-xl bg-white/[0.04] border border-white/[0.12] text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
              />
              <svg className="absolute left-3.5 top-3 w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white px-1.5 py-0.5 rounded bg-white/10">
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Type Tabs */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTypeChange(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all shrink-0 cursor-pointer ${
                  selectedType === tab.value
                    ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.3)]'
                    : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.09] border border-white/[0.06]'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Genre Pills — differ per type */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-zinc-500 font-mono shrink-0 mr-1">GENRE:</span>
            {genrePills.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
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

        {/* Results count + reset */}
        <div className="flex items-center justify-between pb-6 text-xs text-zinc-400 font-mono">
          <span>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin text-rose-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                LOADING TITLES…
              </span>
            ) : hasMore
              ? `SHOWING ${visibleCount} OF ${filteredTitles.length} TITLES`
              : `SHOWING ALL ${filteredTitles.length} TITLES`}
          </span>
          {(selectedType !== 'all' || selectedGenre !== 'All' || searchQuery) && (
            <button onClick={handleReset} className="text-rose-400 hover:underline cursor-pointer">
              Reset Filters
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : filteredTitles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {visibleTitles.map((media) => (
                <MediaTitleCard key={media.id} media={media} />
              ))}
            </div>

            {/* Sentinel — triggers next batch when scrolled into view */}
            <div ref={sentinelRef} className="h-1" aria-hidden />

            {/* Loading more indicator */}
            {hasMore && (
              <div className="flex justify-center py-10">
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                  <svg className="w-4 h-4 animate-spin text-rose-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  LOADING MORE…
                </div>
              </div>
            )}

            {/* End of results */}
            {!hasMore && filteredTitles.length > PAGE_SIZE && (
              <div className="flex justify-center py-10">
                <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
                  <span className="w-8 h-px bg-zinc-700" />
                  ALL {filteredTitles.length} TITLES LOADED
                  <span className="w-8 h-px bg-zinc-700" />
                </div>
              </div>
            )}
          </>
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

// Suspense wrapper required by Next.js for useSearchParams() in client components
export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050508] flex items-center justify-center">
          <div className="text-zinc-400 text-sm font-mono animate-pulse">Loading media discovery…</div>
        </div>
      }
    >
      <BrowsePageInner />
    </Suspense>
  );
}
