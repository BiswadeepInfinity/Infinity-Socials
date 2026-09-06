import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingMovies, getUpcomingTV } from '@/lib/api/tmdb';
import { UpcomingTitle } from '@/lib/api/tmdb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all'; // 'movie' | 'tv' | 'all'

  try {
    let results: UpcomingTitle[] = [];

    if (type === 'movie') {
      results = await getUpcomingMovies();
    } else if (type === 'tv') {
      results = await getUpcomingTV();
    } else {
      // 'all' — fetch both concurrently and interleave by release date
      const [movies, tv] = await Promise.all([getUpcomingMovies(), getUpcomingTV()]);
      const combined = [...movies, ...tv];
      // Deduplicate by id and sort by release date (soonest first)
      const seen = new Set<string>();
      for (const item of combined) {
        if (!seen.has(item.id)) { seen.add(item.id); results.push(item); }
      }
      results.sort((a, b) => a.daysUntilRelease - b.daysUntilRelease);
    }

    return NextResponse.json({
      success: true,
      type,
      count: results.length,
      data: results,
    });
  } catch (err: any) {
    console.error('/api/media/upcoming error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch upcoming titles' },
      { status: 500 }
    );
  }
}
