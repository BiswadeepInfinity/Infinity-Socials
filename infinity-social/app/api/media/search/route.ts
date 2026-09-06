import { NextRequest, NextResponse } from 'next/server';
import { searchTMDB, getTrendingTMDB, getCatalogMovies, getCatalogTV, getUpcomingMovies, getUpcomingTV } from '@/lib/api/tmdb';
import { searchAnime, getTopAnime } from '@/lib/api/jikan';
import { searchGames } from '@/lib/api/rawg';
import { MediaTitle } from '@/types/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all'; // 'movie' | 'tv' | 'game' | 'anime' | 'all' | 'upcoming'
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    let results: MediaTitle[] = [];

    if (!query.trim()) {
      // No search query → return full catalog using discovery endpoints
      if (type === 'upcoming') {
        const [movies, tv] = await Promise.all([getUpcomingMovies(), getUpcomingTV()]);
        const combined = [...movies, ...tv].sort((a, b) => a.daysUntilRelease - b.daysUntilRelease);
        return NextResponse.json({ success: true, count: combined.length, data: combined });
      } else if (type === 'movie') {
        results = await getCatalogMovies();
      } else if (type === 'tv') {
        results = await getCatalogTV();
      } else if (type === 'anime') {
        // Try Jikan top anime first; fallback to TMDB
        results = await getTopAnime();
        if (results.length < 10) {
          const tmdbAnime = await getTrendingTMDB('tv');
          // Merge, dedup
          const seen = new Set(results.map((r) => r.id));
          for (const item of tmdbAnime) {
            if (!seen.has(item.id)) { seen.add(item.id); results.push(item); }
          }
        }
      } else if (type === 'game') {
        // RAWG doesn't have a huge free catalog — return empty so client uses keyword search
        results = await searchGames('action');
      } else {
        // 'all' — mix: movies + TV + anime
        const [movies, tv, anime] = await Promise.all([
          getCatalogMovies(),
          getCatalogTV(),
          getTopAnime(),
        ]);
        // Interleave: 1 movie, 1 tv, 1 anime rotation
        const maxLen = Math.max(movies.length, tv.length, anime.length);
        const seen = new Set<string>();
        for (let i = 0; i < maxLen; i++) {
          for (const arr of [movies, tv, anime]) {
            if (arr[i] && !seen.has(arr[i].id)) { seen.add(arr[i].id); results.push(arr[i]); }
          }
        }
      }

      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    // ── Keyword search ────────────────────────────────────────────
    if (type === 'anime') {
      results = await searchAnime(query);
      if (results.length === 0) {
        results = await searchTMDB(query, 'anime');
      }
    } else if (type === 'game') {
      results = await searchGames(query);
    } else if (type === 'tv') {
      results = await searchTMDB(query, 'tv');
    } else if (type === 'movie') {
      results = await searchTMDB(query, 'movie');
    } else {
      // Search all domains concurrently
      const [movies, anime, games] = await Promise.all([
        searchTMDB(query, 'movie'),
        searchAnime(query).then((res) => (res.length > 0 ? res : searchTMDB(query, 'anime'))),
        searchGames(query),
      ]);
      results = [...movies.slice(0, 8), ...anime.slice(0, 8), ...games.slice(0, 8)];
    }

    return NextResponse.json({
      success: true,
      query,
      type,
      page,
      count: results.length,
      data: results,
    });
  } catch (err: any) {
    console.error('API /api/media/search error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to search media' },
      { status: 500 }
    );
  }
}
