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
  tmdbId?: number;
  character?: string;
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
  rating?: number;
  voteCount?: number;
  popularity?: number;
  directorOrDev?: string;
  writers?: string[];
  originalTitle?: string;
  homepage?: string;
  studio?: string;
  productionCompanies?: string[];
  country?: string;
  productionCountries?: string[];
  language?: string;
  spokenLanguages?: string[];
  durationOrPlatforms?: string;
  runtimeMinutes?: number;
  tagline?: string;
  budget?: number;
  revenue?: number;
  imdbId?: string;
  keywords?: string[];
  overview: string;
  interestedCount: number;
  collectionCount?: number;
  cast?: CastMember[];
  crew?: CastMember[];
  similar?: { id: string; title: string; posterUrl: string; rating?: number; type: MediaType }[];
  relatedArticles?: MediaArticleRef[];
  tags?: string[];
}
