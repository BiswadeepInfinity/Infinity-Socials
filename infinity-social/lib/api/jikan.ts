import https from 'https';
import { MediaTitle } from '@/types/media';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const jikanAgent = new https.Agent({ keepAlive: false });

function jikanGetJSON(path: string, retries = 3): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const url = `${JIKAN_BASE_URL}${path}`;
    const parsed = new URL(url);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await new Promise<any>((res, rej) => {
          const req = https.request(
            {
              hostname: parsed.hostname,
              port: 443,
              path: parsed.pathname + parsed.search,
              method: 'GET',
              headers: { 'Accept': 'application/json', 'User-Agent': 'InfinitySocials/1.0' },
              agent: jikanAgent,
            },
            (response) => {
              let raw = '';
              response.on('data', (c) => (raw += c));
              response.on('end', () => {
                try {
                  if (response.statusCode === 429 || (response.statusCode && response.statusCode >= 500)) {
                    rej(Object.assign(new Error(`Jikan ${response.statusCode}`), { code: 'RATE_LIMIT' }));
                  } else if (response.statusCode && response.statusCode >= 400) {
                    rej(new Error(`Jikan HTTP ${response.statusCode}`));
                  } else {
                    res(JSON.parse(raw));
                  }
                } catch (e) { rej(e); }
              });
            }
          );
          req.on('error', rej);
          req.end();
        });
        return resolve(result);
      } catch (err: any) {
        const retryable = err.code === 'ECONNRESET' || err.code === 'RATE_LIMIT' || err.code === 'ETIMEDOUT';
        if (retryable && attempt < retries) {
          await new Promise((r) => setTimeout(r, 600 * attempt));
          continue;
        }
        return reject(err);
      }
    }
  });
}


export interface JikanRawAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis?: string;
  type?: string;
  episodes?: number;
  status?: string;
  score?: number;
  scored_by?: number;
  year?: number;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
    };
    webp?: {
      image_url?: string;
      large_image_url?: string;
    };
  };
  trailer?: {
    youtube_id?: string;
    embed_url?: string;
  };
  genres?: { mal_id: number; name: string }[];
  themes?: { mal_id: number; name: string }[];
  studios?: { mal_id: number; name: string }[];
}

// Map MAL genre names → normalized tags the browse page pill aliases can match
const MAL_TAG_MAP: Record<string, string[]> = {
  'Shounen':     ['shonen', 'battle', 'action'],
  'Action':      ['action', 'battle', 'shonen'],
  'Supernatural':['supernatural', 'dark fantasy'],
  'Fantasy':     ['fantasy', 'isekai', 'dark fantasy'],
  'Isekai':      ['isekai', 'fantasy', 'adventure'],
  'Mecha':       ['mecha', 'sci-fi', 'robot'],
  'Sci-Fi':      ['sci-fi', 'mecha'],
  'Horror':      ['horror', 'dark fantasy'],
  'Psychological':['psychological', 'seinen', 'dark fantasy'],
  'Seinen':      ['seinen', 'dark fantasy', 'psychological'],
  'Slice of Life':['slice of life', 'school'],
  'Romance':     ['romance', 'slice of life'],
  'Comedy':      ['comedy', 'slice of life'],
  'Sports':      ['sports'],
  'Mystery':     ['mystery', 'psychological'],
  'Gore':        ['gore', 'seinen', 'dark fantasy'],
  // TMDB TV fallback genres (when Jikan is down)
  'Sci-Fi & Fantasy': ['sci-fi', 'mecha', 'fantasy', 'isekai'],
  'Action & Adventure': ['action', 'battle', 'shonen', 'adventure'],
  'War & Politics': ['seinen', 'dark fantasy'],
  'Animation':   ['anime'],
};

export function formatJikanAnime(item: JikanRawAnime): MediaTitle {
  const title = item.title_english || item.title || 'Untitled Anime';
  const releaseYear = item.year || 2024;
  const rawGenres = [
    ...(item.genres?.map((g) => g.name) || []),
    ...(item.themes?.map((t) => t.name) || []),
  ];
  if (rawGenres.length === 0) rawGenres.push('Action', 'Anime');

  // Build rich tag list: raw genres + normalized aliases for pill matching
  const tagSet = new Set<string>(['Anime']);
  rawGenres.forEach((g) => {
    tagSet.add(g);
    (MAL_TAG_MAP[g] || []).forEach((alias) => tagSet.add(alias));
  });
  const tags = Array.from(tagSet);

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + `-${item.mal_id}`;

  const posterUrl =
    item.images?.webp?.large_image_url ||
    item.images?.jpg?.large_image_url ||
    item.images?.webp?.image_url ||
    'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=85';

  const studioName = item.studios?.[0]?.name || 'Animation Studio';

  return {
    id: `mal-${item.mal_id}`,
    slug,
    title,
    type: 'anime',
    badge: 'Trending',
    releaseYear,
    releaseDate: `${releaseYear}`,
    status: item.status || 'Finished Airing',
    genres: rawGenres,
    posterUrl,
    backdropUrl: posterUrl,
    trailerYoutubeId: item.trailer?.youtube_id,
    rating: item.score ? Number(item.score.toFixed(1)) : 8.5,
    directorOrDev: studioName,
    studio: studioName,
    country: 'Japan',
    language: 'Japanese',
    durationOrPlatforms: item.episodes ? `${item.episodes} Episodes` : 'Anime Series',
    overview: item.synopsis || 'No synopsis provided for this anime series.',
    interestedCount: Math.round((item.scored_by || 450) * 2.5),
    collectionCount: Math.round((item.scored_by || 450) * 0.8),
    tags, // enriched tags for genre pill matching
  };
}

/**
 * Search Jikan v4 (100% Free, NO API KEY NEEDED)
 */
export async function searchAnime(query: string): Promise<MediaTitle[]> {
  try {
    const data = await jikanGetJSON(`/anime?q=${encodeURIComponent(query)}&limit=20&sfw=true`);
    const results: JikanRawAnime[] = data.data || [];
    return results.map(formatJikanAnime);
  } catch (error) {
    console.error('Failed to search anime with Jikan:', error);
    return [];
  }
}

/**
 * Get Top / Trending Anime (by popularity, 2 pages = 50 titles)
 */
export async function getTopAnime(): Promise<MediaTitle[]> {
  try {
    const [page1, page2] = await Promise.allSettled([
      jikanGetJSON('/top/anime?filter=bypopularity&limit=25&page=1'),
      jikanGetJSON('/top/anime?filter=bypopularity&limit=25&page=2'),
    ]);

    const seen = new Set<number>();
    const all: MediaTitle[] = [];

    for (const chunk of [page1, page2]) {
      if (chunk.status !== 'fulfilled') continue;
      const results: JikanRawAnime[] = chunk.value.data || [];
      for (const item of results) {
        if (!seen.has(item.mal_id)) {
          seen.add(item.mal_id);
          all.push(formatJikanAnime(item));
        }
      }
    }

    return all;
  } catch (error) {
    console.error('Failed to get top anime:', error);
    return [];
  }
}
