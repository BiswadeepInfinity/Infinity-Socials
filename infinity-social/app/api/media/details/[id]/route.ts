import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails, getTVDetails } from '@/lib/api/tmdb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id; // e.g. "tmdb-969681" or "mal-16498"
  const type = _req.nextUrl.searchParams.get('type') || 'movie';

  // Only TMDB IDs supported for enrichment currently
  const tmdbMatch = rawId.match(/^tmdb-(\d+)$/);
  if (!tmdbMatch) {
    return NextResponse.json({ success: false, data: {} });
  }

  const tmdbId = parseInt(tmdbMatch[1], 10);

  try {
    const details =
      type === 'tv'
        ? await getTVDetails(tmdbId)
        : await getMovieDetails(tmdbId);

    return NextResponse.json({ success: true, data: details });
  } catch (err: any) {
    console.error('Details route error:', err);
    return NextResponse.json({ success: false, data: {}, error: err.message }, { status: 500 });
  }
}
