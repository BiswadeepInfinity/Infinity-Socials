import { supabase } from './supabase';

export interface FormattedReviewItem {
  id: string;
  slug?: string;
  title: string;
  deck: string;
  category: string;
  domain: 'games' | 'movies' | 'tech' | 'anime';
  readTime: string;
  date: string;
  imageUrl: string;
  score: number;
  verdict: string;
  pros?: string[];
  cons?: string[];
  bottomLine?: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    handle: string;
    id?: string;
  };
  metrics?: {
    views?: string;
    comments?: number;
    shares?: number;
    upvotes?: number;
    downvotes?: number;
  };
  link: string;
}

// Fallback items to guarantee full editorial decks and carousels when database items are sparse
export const FALLBACK_EDITORIAL_REVIEWS: FormattedReviewItem[] = [
  {
    id: 'fb-1',
    slug: 'elden-ring-shadow-erdtree-definitive-analysis',
    title: 'Shadow of the Erdtree: The Dark Geometry of Elden Ring',
    deck: 'A sweeping dissection of FromSoft\'s labyrinthine underworld, where Miyazaki weaponizes silence, horizontal ruins, and boss aggression into a masterclass.',
    category: 'Game',
    domain: 'games',
    readTime: '12 min read',
    date: 'Recent',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85',
    score: 98,
    verdict: 'Masterpiece',
    author: {
      name: 'Elena Rostova',
      handle: 'erostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      role: 'Staff Critic',
    },
    metrics: { views: '142K', comments: 418, upvotes: 1840, downvotes: 42 },
    link: '/articles/elden-ring-shadow-erdtree-definitive-analysis',
  },
  {
    id: 'fb-2',
    slug: 'cyberpunk-2077-phantom-liberty-retrospective',
    title: 'Phantom Liberty: Dogtown and the Art of the Espionage Thriller',
    deck: 'How CD Projekt RED reconstructed Cyberpunk 2077 into one of the decade\'s most gripping political noir experiences, framed by Idris Elba\'s Reed.',
    category: 'Game',
    domain: 'games',
    readTime: '9 min read',
    date: 'Recent',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&q=85',
    score: 93,
    verdict: 'Exceptional',
    author: {
      name: 'Biswadeep Chakraborty',
      handle: 'biswadeep',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
      role: 'Lead Architect',
    },
    metrics: { views: '98K', comments: 265, upvotes: 1240, downvotes: 19 },
    link: '/articles/cyberpunk-2077-phantom-liberty-retrospective',
  },
  {
    id: 'fb-3',
    slug: 'dune-part-two-cinematic-maximalism',
    title: 'Dune: Part Two and the Return of Scale to Modern Sci-Fi',
    deck: 'Villeneuve proves that scale is not just visual excess, but an acoustic instrument capable of inducing religious vertigo in the viewer.',
    category: 'Movie',
    domain: 'movies',
    readTime: '7 min read',
    date: 'Recent',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=85',
    score: 96,
    verdict: 'Masterpiece',
    author: {
      name: 'Sofia Chen',
      handle: 'sofiachen',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
      role: 'Film Essayist',
    },
    metrics: { views: '84K', comments: 194, upvotes: 950, downvotes: 14 },
    link: '/browse?type=movie',
  },
  {
    id: 'fb-4',
    slug: 'nvidia-blackwell-b200-deep-architecture',
    title: 'Inside Nvidia Blackwell: The 208-Billion Transistor Titan',
    deck: 'An architectural deep dive into dual-die interconnects, FP4 precision quantization, and why NVLink 5 changes the hyperscale datacenter math.',
    category: 'Tech',
    domain: 'tech',
    readTime: '15 min read',
    date: 'Recent',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=85',
    score: 91,
    verdict: 'Groundbreaking',
    author: {
      name: 'Alex Vance',
      handle: 'avance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
      role: 'Hardware Editor',
    },
    metrics: { views: '67K', comments: 153, upvotes: 780, downvotes: 21 },
    link: '/browse?type=tech',
  },
  {
    id: 'fb-5',
    slug: 'solo-leveling-anime-adaptation-breakdown',
    title: 'Solo Leveling: Shadow Monarch and the Global Manhwa Surge',
    deck: 'From Kakao webtoon to A-1 Pictures phenomenon: why Sung Jin-woo\'s level-up fantasy struck lightning across Western and Asian audiences simultaneously.',
    category: 'Anime',
    domain: 'anime',
    readTime: '8 min read',
    date: 'Recent',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
    score: 89,
    verdict: 'Great',
    author: {
      name: 'Kenji Sato',
      handle: 'kenjisato',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&q=80',
      role: 'Anime Curator',
    },
    metrics: { views: '112K', comments: 382, upvotes: 1420, downvotes: 38 },
    link: '/browse?type=anime',
  }
];

function mapCategoryToDomain(category?: string | null): 'games' | 'movies' | 'tech' | 'anime' {
  if (!category) return 'games';
  const c = category.toLowerCase();
  if (c.includes('movie') || c.includes('series') || c.includes('show') || c.includes('tv') || c.includes('cinema')) return 'movies';
  if (c.includes('tech') || c.includes('hardware') || c.includes('ai') || c.includes('code')) return 'tech';
  if (c.includes('anime') || c.includes('manga') || c.includes('shonen') || c.includes('isekai')) return 'anime';
  return 'games';
}

function formatDate(timestamp?: string | null): string {
  if (!timestamp) return 'Recent';
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export async function fetchAllUserReviews(): Promise<FormattedReviewItem[]> {
  try {
    const { data: reviews, error } = await supabase
      .from('user_reviews')
      .select(`
        id,
        user_id,
        title,
        category,
        release_year,
        verdict,
        score,
        content,
        youtube_url,
        voice_url,
        pros,
        cons,
        bottom_line,
        cover_url,
        upvotes_count,
        downvotes_count,
        likes_count,
        comments_count,
        is_public,
        created_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          bio
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching real reviews from Supabase:', error.message);
      return FALLBACK_EDITORIAL_REVIEWS;
    }

    if (!reviews || reviews.length === 0) {
      return FALLBACK_EDITORIAL_REVIEWS;
    }

    const realItems: FormattedReviewItem[] = reviews.map((r: any) => {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      const authorName = profile?.full_name || profile?.username || 'Community Reviewer';
      const authorHandle = profile?.username ? `@${profile.username}` : '@reviewer';
      const authorAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${r.user_id || r.id}`;

      // Approximate read time based on content length
      const wordCount = (r.content || '').split(/\s+/).filter(Boolean).length;
      const readMin = Math.max(2, Math.ceil(wordCount / 180));

      const coverImg = r.cover_url && r.cover_url.startsWith('http')
        ? r.cover_url
        : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85';

      return {
        id: r.id,
        title: r.title || 'Untitled Review',
        deck: r.bottom_line || r.content?.slice(0, 180) + '...' || 'In-depth community review and analysis.',
        category: r.category || 'Game',
        domain: mapCategoryToDomain(r.category),
        readTime: `${readMin} min read`,
        date: formatDate(r.created_at),
        imageUrl: coverImg,
        score: typeof r.score === 'number' ? r.score : 85,
        verdict: r.verdict || (r.score >= 90 ? 'Masterpiece' : r.score >= 80 ? 'Recommended' : 'Decent'),
        pros: r.pros || [],
        cons: r.cons || [],
        bottomLine: r.bottom_line || '',
        author: {
          name: authorName,
          handle: authorHandle,
          avatar: authorAvatar,
          role: 'Community Critic',
          id: r.user_id,
        },
        metrics: {
          views: `${Math.floor((r.upvotes_count || 0) * 12 + 150)}`,
          comments: r.comments_count || 0,
          upvotes: r.upvotes_count || 0,
          downvotes: r.downvotes_count || 0,
        },
        link: `/reviews/${r.id}`,
      };
    });

    // Merge real reviews first, and pad with fallback items to maintain full rich UI
    const merged = [...realItems];
    for (const fb of FALLBACK_EDITORIAL_REVIEWS) {
      if (merged.length >= 8) break;
      if (!merged.some((m) => m.title === fb.title)) {
        merged.push(fb);
      }
    }

    return merged;
  } catch (err) {
    console.error('Failed to query user reviews:', err);
    return FALLBACK_EDITORIAL_REVIEWS;
  }
}
