import https from 'https';
import { MediaTitle } from '@/types/media';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '6da3b3b644bf384ba7e639ce08ff0fb1';
const TMDB_TOKEN   = process.env.TMDB_READ_ACCESS_TOKEN || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // TV specific genres
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export interface TMDBRawItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: string;
}

/** Extended MediaTitle for upcoming releases — adds countdown fields */
export interface UpcomingTitle extends Omit<MediaTitle, 'badge'> {
  badge: 'Coming Soon';
  releaseDateFull: string;  // full YYYY-MM-DD
  daysUntilRelease: number; // negative = already released (shouldn't appear here)
}

/** Compute days between today and a YYYY-MM-DD date string */
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = new Date(dateStr);
  release.setHours(0, 0, 0, 0);
  return Math.round((release.getTime() - today.getTime()) / 86_400_000);
}

function formatUpcoming(item: TMDBRawItem, type: 'movie' | 'tv'): UpcomingTitle | null {
  const releaseDateStr = item.release_date || item.first_air_date || '';
  if (!releaseDateStr) return null;

  const rawDays = daysUntil(releaseDateStr);
  if (rawDays < 0) return null;

  const base = formatTMDBMedia(item, type);
  return {
    ...base,
    badge: 'Coming Soon',
    status: 'Upcoming',
    releaseDate: releaseDateStr,
    releaseDateFull: releaseDateStr,
    daysUntilRelease: rawDays,
  } as UpcomingTitle;
}

export function formatTMDBMedia(item: TMDBRawItem, explicitType?: 'movie' | 'tv'): MediaTitle {
  const isTV = explicitType === 'tv' || item.media_type === 'tv' || (!item.title && !!item.name);
  const type = isTV ? 'tv' : 'movie';
  const title = item.title || item.name || 'Untitled';
  const releaseDateStr = item.release_date || item.first_air_date || '';
  const releaseYear = releaseDateStr ? parseInt(releaseDateStr.split('-')[0], 10) : new Date().getFullYear();

  // Extract genre names
  const genres: string[] = [];
  if (item.genres && item.genres.length > 0) {
    item.genres.forEach((g) => genres.push(g.name));
  } else if (item.genre_ids && item.genre_ids.length > 0) {
    item.genre_ids.forEach((id) => {
      if (GENRE_MAP[id]) genres.push(GENRE_MAP[id]);
    });
  }
  if (genres.length === 0) {
    genres.push(isTV ? 'Drama' : 'Action');
  }

  // Generate URL slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + `-${item.id}`;

  const posterUrl = item.poster_path
    ? `${IMAGE_BASE_URL}/w500${item.poster_path}`
    : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=85';

  const backdropUrl = item.backdrop_path
    ? `${IMAGE_BASE_URL}/original${item.backdrop_path}`
    : posterUrl;

  const rating = item.vote_average ? Number(item.vote_average.toFixed(1)) : 8.0;

  return {
    id: `tmdb-${item.id}`,
    slug,
    title,
    type,
    badge: (isTV ? 'Season 1 Episode 3' : 'New Movie') as any,
    releaseYear: isNaN(releaseYear) ? 2026 : releaseYear,
    releaseDate: releaseDateStr || '2026',
    status: 'Released',
    genres,
    posterUrl,
    backdropUrl,
    rating,
    directorOrDev: 'TMDB Studios',
    durationOrPlatforms: isTV ? 'Episodes • Streaming' : 'Theatrical / Streaming',
    overview: item.overview || 'No synopsis available for this title.',
    interestedCount: Math.round((item.vote_count || 120) * 4.5),
    collectionCount: Math.round((item.vote_count || 120) * 1.2),
    tags: genres.slice(0, 3),
  };
}

// ─── Native HTTPS helper (avoids ECONNRESET on Windows) ───────────────────────
const httpsAgent = new https.Agent({ keepAlive: false });

function httpGetJSON(url: string, extraHeaders: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; InfinitySocials/1.0)',
      ...extraHeaders,
    };
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers,
        agent: httpsAgent,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`TMDB ${res.statusCode}: ${raw.slice(0, 200)}`));
            } else {
              resolve(JSON.parse(raw));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function fetchFromTMDB(path: string, retries = 3): Promise<any> {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${path}${sep}api_key=${TMDB_API_KEY}`;
  const extraHeaders: Record<string, string> = {};
  if (TMDB_TOKEN) extraHeaders['Authorization'] = `Bearer ${TMDB_TOKEN}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await httpGetJSON(url, extraHeaders);
    } catch (err: any) {
      const isRetryable = err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT';
      if (isRetryable && attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Search TMDB for Movies, TV, or Anime (Japanese animation)
 */
export async function searchTMDB(query: string, type: 'movie' | 'tv' | 'anime' = 'movie'): Promise<MediaTitle[]> {
  try {
    const endpoint = (type === 'tv' || type === 'anime') ? '/search/tv' : '/search/movie';
    const data = await fetchFromTMDB(`${endpoint}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
    const results: TMDBRawItem[] = data.results || [];
    return results.slice(0, 20).map((item) => {
      const formatted = formatTMDBMedia(item, (type === 'tv' || type === 'anime') ? 'tv' : 'movie');
      if (type === 'anime') {
        formatted.type = 'anime';
        if (!formatted.genres.includes('Anime')) formatted.genres.unshift('Anime');
      }
      return formatted;
    });
  } catch (error) {
    console.error('Failed to search TMDB:', error);
    return [];
  }
}

/**
 * Get Trending Movies / TV
 */
export async function getTrendingTMDB(type: 'movie' | 'tv' = 'movie'): Promise<MediaTitle[]> {
  try {
    const data = await fetchFromTMDB(`/trending/${type}/week`);
    const results: TMDBRawItem[] = data.results || [];
    return results.slice(0, 20).map((item) => formatTMDBMedia(item, type));
  } catch (error) {
    console.error('Failed to fetch trending from TMDB:', error);
    return [];
  }
}

/**
 * Get a large catalog of movies from multiple TMDB discovery endpoints.
 * Pulls popular + top_rated + now_playing + trending across 2 pages = 80+ titles.
 */
export async function getCatalogMovies(): Promise<MediaTitle[]> {
  const endpoints = [
    '/movie/popular?language=en-US&page=1',
    '/movie/popular?language=en-US&page=2',
    '/movie/top_rated?language=en-US&page=1',
    '/movie/top_rated?language=en-US&page=2',
    '/movie/now_playing?language=en-US&page=1',
    '/trending/movie/week?language=en-US',
  ];

  try {
    const chunks = await Promise.allSettled(endpoints.map((ep) => fetchFromTMDB(ep)));
    const seen = new Set<number>();
    const all: MediaTitle[] = [];

    for (const chunk of chunks) {
      if (chunk.status !== 'fulfilled') continue;
      const results: TMDBRawItem[] = chunk.value.results || [];
      for (const item of results) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          all.push(formatTMDBMedia(item, 'movie'));
        }
      }
    }
    return all;
  } catch (err) {
    console.error('getCatalogMovies error:', err);
    return [];
  }
}

/**
 * Get a large catalog of TV shows from multiple TMDB discovery endpoints.
 */
export async function getCatalogTV(): Promise<MediaTitle[]> {
  const endpoints = [
    '/tv/popular?language=en-US&page=1',
    '/tv/popular?language=en-US&page=2',
    '/tv/top_rated?language=en-US&page=1',
    '/tv/on_the_air?language=en-US&page=1',
    '/trending/tv/week?language=en-US',
  ];

  try {
    const chunks = await Promise.allSettled(endpoints.map((ep) => fetchFromTMDB(ep)));
    const seen = new Set<number>();
    const all: MediaTitle[] = [];

    for (const chunk of chunks) {
      if (chunk.status !== 'fulfilled') continue;
      const results: TMDBRawItem[] = chunk.value.results || [];
      for (const item of results) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          all.push(formatTMDBMedia(item, 'tv'));
        }
      }
    }
    return all;
  } catch (err) {
    console.error('getCatalogTV error:', err);
    return [];
  }
}

const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';

/**
 * Get full TMDB movie details including cast, crew, trailer, budget, IMDb ID, etc.
 * Uses ?append_to_response=credits,videos,keywords,similar to fetch everything in one call.
 */
export async function getMovieDetails(tmdbId: number): Promise<Partial<MediaTitle>> {
  try {
    const data = await fetchFromTMDB(
      `/movie/${tmdbId}?append_to_response=credits,videos,keywords,similar&language=en-US`
    );

    // ── Director & Writers ──────────────────────────────────────
    const crew: { job: string; name: string; profile_path?: string }[] = data.credits?.crew || [];
    const director = crew.find((c) => c.job === 'Director')?.name || 'N/A';
    const writers = crew
      .filter((c) => ['Screenplay', 'Writer', 'Story', 'Author'].includes(c.job))
      .slice(0, 3)
      .map((c) => c.name);

    // ── Cast ───────────────────────────────────────────────────
    const rawCast: { name: string; character: string; profile_path?: string; id: number }[] =
      data.credits?.cast || [];
    const cast = rawCast.slice(0, 12).map((c) => ({
      name: c.name,
      role: c.character || 'Unknown Role',
      character: c.character,
      avatar: c.profile_path ? `${PROFILE_BASE}${c.profile_path}` : undefined,
      tmdbId: c.id,
    }));

    const crewFormatted = crew
      .filter((c) => ['Director', 'Director of Photography', 'Original Music Composer', 'Editor'].includes(c.job))
      .slice(0, 6)
      .map((c) => ({
        name: c.name,
        role: c.job,
        avatar: c.profile_path ? `${PROFILE_BASE}${c.profile_path}` : undefined,
      }));

    // ── Trailer ────────────────────────────────────────────────
    const videos: { type: string; site: string; key: string; official: boolean }[] =
      data.videos?.results || [];
    const ytVideos = videos.filter((v) => v.site === 'YouTube' && v.key);
    const trailer =
      ytVideos.find((v) => v.type === 'Trailer' && v.official) ||
      ytVideos.find((v) => v.type === 'Trailer') ||
      ytVideos.find((v) => v.type === 'Teaser') ||
      ytVideos.find((v) => v.type === 'Clip') ||
      ytVideos[0];

    // ── Keywords ───────────────────────────────────────────────
    const keywords: string[] = (data.keywords?.keywords || []).slice(0, 10).map((k: any) => k.name);

    // ── Similar ────────────────────────────────────────────────
    const similar = (data.similar?.results || []).slice(0, 8).map((s: any) => ({
      id: `tmdb-${s.id}`,
      title: s.title || s.name || 'Unknown',
      posterUrl: s.poster_path
        ? `${IMAGE_BASE_URL}/w342${s.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
      rating: s.vote_average ? Number(s.vote_average.toFixed(1)) : undefined,
      type: 'movie' as const,
    }));

    // ── Runtime ────────────────────────────────────────────────
    const runtimeMinutes: number | undefined = data.runtime || undefined;
    const hours = runtimeMinutes ? Math.floor(runtimeMinutes / 60) : 0;
    const mins = runtimeMinutes ? runtimeMinutes % 60 : 0;
    const runtimeStr = runtimeMinutes
      ? `${hours > 0 ? `${hours}h ` : ''}${mins}m`
      : undefined;

    // ── Spoken Languages ───────────────────────────────────────
    const spokenLanguages: string[] = (data.spoken_languages || []).map((l: any) => l.english_name);

    // ── Production Companies ───────────────────────────────────
    const productionCompanies: string[] = (data.production_companies || []).slice(0, 3).map((p: any) => p.name);

    // ── Production Countries ───────────────────────────────────
    const productionCountries = (data.production_countries || []).map((c: any) => c.name);
    const country = productionCountries[0] || undefined;

    // Fallback YouTube trailer key if not found in TMDB videos
    const cleanTitle = (data.title || data.original_title || '').trim();
    const releaseYearStr = data.release_date ? data.release_date.split('-')[0] : '';
    const trailerKey = trailer?.key || (cleanTitle ? `SEARCH:${encodeURIComponent(`${cleanTitle} ${releaseYearStr} official trailer`)}` : undefined);

    return {
      title: data.title || undefined,
      genres: (data.genres || []).map((g: any) => g.name),
      posterUrl: data.poster_path ? `${IMAGE_BASE_URL}/w500${data.poster_path}` : undefined,
      backdropUrl: data.backdrop_path ? `${IMAGE_BASE_URL}/original${data.backdrop_path}` : undefined,
      overview: data.overview || undefined,
      directorOrDev: director,
      writers: writers.length > 0 ? writers : undefined,
      originalTitle: data.original_title || undefined,
      homepage: data.homepage || undefined,
      studio: productionCompanies[0] || undefined,
      productionCompanies,
      country,
      productionCountries,
      language: data.original_language?.toUpperCase() || undefined,
      spokenLanguages,
      runtimeMinutes,
      durationOrPlatforms: runtimeStr,
      tagline: data.tagline || undefined,
      budget: data.budget || undefined,
      revenue: data.revenue || undefined,
      imdbId: data.imdb_id || undefined,
      status: data.status || undefined,
      releaseDate: data.release_date || undefined,
      releaseYear: data.release_date ? parseInt(data.release_date.split('-')[0], 10) : undefined,
      voteCount: data.vote_count || undefined,
      popularity: data.popularity ? Math.round(data.popularity) : undefined,
      trailerYoutubeId: trailerKey,
      keywords,
      cast,
      crew: crewFormatted,
      similar,
    };
  } catch (err) {
    console.error('getMovieDetails error:', err);
    return {};
  }
}

/**
 * Get full TMDB TV show details including cast, crew, trailer, seasons, etc.
 */
export async function getTVDetails(tmdbId: number): Promise<Partial<MediaTitle>> {
  try {
    const data = await fetchFromTMDB(
      `/tv/${tmdbId}?append_to_response=credits,videos,keywords,similar&language=en-US`
    );

    const crew: { job: string; name: string; profile_path?: string }[] = data.credits?.crew || [];
    const creators: string[] = (data.created_by || []).map((c: any) => c.name);
    const director = creators[0] || crew.find((c) => ['Director', 'Executive Producer'].includes(c.job))?.name || 'N/A';

    const rawCast: { name: string; character: string; profile_path?: string; id: number }[] =
      data.credits?.cast || [];
    const cast = rawCast.slice(0, 12).map((c) => ({
      name: c.name,
      role: c.character || 'Unknown Role',
      character: c.character,
      avatar: c.profile_path ? `${PROFILE_BASE}${c.profile_path}` : undefined,
      tmdbId: c.id,
    }));

    const videos: { type: string; site: string; key: string; official: boolean }[] =
      data.videos?.results || [];
    const ytVideos = videos.filter((v) => v.site === 'YouTube' && v.key);
    const trailer =
      ytVideos.find((v) => v.type === 'Trailer' && v.official) ||
      ytVideos.find((v) => v.type === 'Trailer') ||
      ytVideos.find((v) => v.type === 'Teaser') ||
      ytVideos.find((v) => v.type === 'Clip') ||
      ytVideos[0];

    const keywords: string[] = (data.keywords?.results || []).slice(0, 10).map((k: any) => k.name);

    const similar = (data.similar?.results || []).slice(0, 8).map((s: any) => ({
      id: `tmdb-${s.id}`,
      title: s.name || s.title || 'Unknown',
      posterUrl: s.poster_path
        ? `${IMAGE_BASE_URL}/w342${s.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
      rating: s.vote_average ? Number(s.vote_average.toFixed(1)) : undefined,
      type: 'tv' as const,
    }));

    const seasons = data.number_of_seasons;
    const episodes = data.number_of_episodes;
    const durationOrPlatforms = [
      seasons ? `${seasons} Season${seasons > 1 ? 's' : ''}` : '',
      episodes ? `${episodes} Episodes` : '',
    ].filter(Boolean).join(' · ');

    const spokenLanguages: string[] = (data.spoken_languages || []).map((l: any) => l.english_name);
    const productionCompanies: string[] = (data.production_companies || []).slice(0, 3).map((p: any) => p.name);
    const networks: string[] = (data.networks || []).slice(0, 2).map((n: any) => n.name);

    const cleanName = (data.name || data.original_name || '').trim();
    const firstAirYearStr = data.first_air_date ? data.first_air_date.split('-')[0] : '';
    const trailerKey = trailer?.key || (cleanName ? `SEARCH:${encodeURIComponent(`${cleanName} ${firstAirYearStr} series official trailer`)}` : undefined);

    return {
      title: data.name || undefined,
      genres: (data.genres || []).map((g: any) => g.name),
      posterUrl: data.poster_path ? `${IMAGE_BASE_URL}/w500${data.poster_path}` : undefined,
      backdropUrl: data.backdrop_path ? `${IMAGE_BASE_URL}/original${data.backdrop_path}` : undefined,
      overview: data.overview || undefined,
      directorOrDev: director,
      writers: creators.length > 1 ? creators.slice(1) : undefined,
      originalTitle: data.original_name || undefined,
      homepage: data.homepage || undefined,
      studio: networks[0] || productionCompanies[0] || undefined,
      productionCompanies: [...networks, ...productionCompanies].slice(0, 3),
      country: data.origin_country?.[0] || undefined,
      language: data.original_language?.toUpperCase() || undefined,
      spokenLanguages,
      durationOrPlatforms: durationOrPlatforms || 'Streaming Series',
      tagline: data.tagline || undefined,
      status: data.status || undefined,
      releaseDate: data.first_air_date || undefined,
      releaseYear: data.first_air_date ? parseInt(data.first_air_date.split('-')[0], 10) : undefined,
      voteCount: data.vote_count || undefined,
      popularity: data.popularity ? Math.round(data.popularity) : undefined,
      trailerYoutubeId: trailerKey,
      keywords,
      cast,
      similar,
    };
  } catch (err) {
    console.error('getTVDetails error:', err);
    return {};
  }
}

/**
 * Get upcoming movie releases from TMDB.
 * TMDB's /movie/upcoming automatically only returns movies not yet released.
 * Once a movie releases, TMDB removes it from here → it appears in /movie/now_playing.
 * This is the "automated" removal — no cron or DB needed.
 */
export async function getUpcomingMovies(): Promise<UpcomingTitle[]> {
  const endpoints = [
    '/movie/upcoming?language=en-US&page=1',
    '/movie/upcoming?language=en-US&page=2',
    '/movie/upcoming?language=en-US&page=3',
    '/movie/upcoming?language=en-US&page=4',
    '/movie/upcoming?language=en-US&page=5',
  ];

  try {
    const chunks = await Promise.allSettled(endpoints.map((ep) => fetchFromTMDB(ep)));
    const seen = new Set<number>();
    const all: UpcomingTitle[] = [];

    for (const chunk of chunks) {
      if (chunk.status !== 'fulfilled') continue;
      for (const item of (chunk.value.results || []) as TMDBRawItem[]) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        const formatted = formatUpcoming(item, 'movie');
        if (formatted) all.push(formatted);
      }
    }

    // Sort soonest first
    return all.sort((a, b) => a.daysUntilRelease - b.daysUntilRelease);
  } catch (err) {
    console.error('getUpcomingMovies error:', err);
    return [];
  }
}

/**
 * Get upcoming TV shows from TMDB /tv/on_the_air (airing within the next 7 days)
 * plus /tv/airing_today for shows that premiere today.
 */
export async function getUpcomingTV(): Promise<UpcomingTitle[]> {
  const endpoints = [
    '/tv/on_the_air?language=en-US&page=1',
    '/tv/on_the_air?language=en-US&page=2',
    '/tv/on_the_air?language=en-US&page=3',
    '/tv/airing_today?language=en-US&page=1',
  ];

  try {
    const chunks = await Promise.allSettled(endpoints.map((ep) => fetchFromTMDB(ep)));
    const seen = new Set<number>();
    const all: UpcomingTitle[] = [];

    for (const chunk of chunks) {
      if (chunk.status !== 'fulfilled') continue;
      for (const item of (chunk.value.results || []) as TMDBRawItem[]) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        const formatted = formatUpcoming(item, 'tv');
        if (formatted) all.push(formatted);
      }
    }

    return all.sort((a, b) => a.daysUntilRelease - b.daysUntilRelease);
  } catch (err) {
    console.error('getUpcomingTV error:', err);
    return [];
  }
}
