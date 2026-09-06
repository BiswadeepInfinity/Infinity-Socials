import { MediaTitle } from '@/types/media';

const RAWG_API_KEY = process.env.RAWG_API_KEY || '';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export interface RAWGRawGame {
  id: number;
  slug: string;
  name: string;
  released?: string;
  background_image?: string;
  rating?: number;
  metacritic?: number;
  genres?: { id: number; name: string; slug: string }[];
  platforms?: { platform: { id: number; name: string } }[];
  short_screenshots?: { id: number; image: string }[];
}

export function formatRAWGGame(item: RAWGRawGame): MediaTitle {
  const releaseYear = item.released ? parseInt(item.released.split('-')[0], 10) : 2024;
  const genres = item.genres?.map((g) => g.name) || ['Gaming', 'Action'];
  const platforms = item.platforms?.map((p) => p.platform.name).join(', ') || 'Multi-Platform';
  const rating = item.rating ? Number((item.rating * 2).toFixed(1)) : 8.5;

  const posterUrl = item.background_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=85';
  const backdropUrl = item.short_screenshots?.[1]?.image || item.background_image || posterUrl;

  return {
    id: `rawg-${item.id}`,
    slug: item.slug || `game-${item.id}`,
    title: item.name,
    type: 'game',
    badge: 'Must Play',
    releaseYear: isNaN(releaseYear) ? 2024 : releaseYear,
    releaseDate: item.released || '2024',
    status: 'Available Now',
    genres,
    posterUrl,
    backdropUrl,
    rating,
    directorOrDev: 'Game Studio',
    durationOrPlatforms: platforms,
    overview: `${item.name} is a acclaimed video game with a ${rating}/10 player rating across ${platforms}.`,
    interestedCount: Math.round((item.metacritic || 80) * 120),
    collectionCount: Math.round((item.metacritic || 80) * 35),
    tags: ['Gaming', ...genres.slice(0, 3)],
  };
}

/**
 * Search RAWG Video Games
 */
export async function searchGames(query: string): Promise<MediaTitle[]> {
  if (!RAWG_API_KEY) {
    // If user hasn't supplied RAWG key yet, return empty gracefully so UI falls back smoothly
    return [];
  }

  try {
    const res = await fetch(
      `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=15`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const results: RAWGRawGame[] = data.results || [];
    return results.map(formatRAWGGame);
  } catch (error) {
    console.error('Failed to search RAWG games:', error);
    return [];
  }
}
