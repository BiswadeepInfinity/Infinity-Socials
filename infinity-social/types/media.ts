export type MediaType = 'movie' | 'tv' | 'game' | 'anime';

export type MediaBadge = 
  | 'New Movie'
  | 'Season 1 Episode 3'
  | 'OTT Release'
  | 'Trailer'
  | 'Trending'
  | 'Must Play'
  | 'New Episode';

export interface CastMember {
  name: string;
  role: string;
  avatar?: string;
}

export interface MediaArticleRef {
  id: string;
  title: string;
  slug: string;
  category: string;
  score?: string;
  readTime: string;
  author: string;
  publishedAt: string;
  thumbnail: string;
}

export interface MediaTitle {
  id: string;
  slug: string;
  title: string;
  type: MediaType;
  badge: MediaBadge;
  releaseYear: number;
  releaseDate?: string;
  status?: string;
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  trailerYoutubeId?: string;
  rating?: number; // e.g. 8.9 / 10
  directorOrDev?: string;
  studio?: string;
  country?: string;
  language?: string;
  durationOrPlatforms?: string; // e.g. "2h 24m" or "PC, PS5, Xbox Series X"
  overview: string;
  interestedCount: number;
  collectionCount?: number;
  cast?: CastMember[];
  relatedArticles?: MediaArticleRef[];
  tags?: string[];
}
