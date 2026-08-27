export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: 'games' | 'anime' | 'popculture' | 'reviews' | 'interviews' | 'blogs';
  description: string | null;
  cover_image: string | null;
  color_accent: string;
  display_order: number;
  created_at: string;
};

export type ArticleMetric = {
  id: string;
  article_id: string;
  score: number | null;
  verdict: 'must_buy' | 'wait_sale' | 'wait_patches' | 'skip' | null;
  pros: string[];
  cons: string[];
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  author_id: string | null;
  category_id: string | null;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  read_time_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  author?: Profile;
  category?: Category;
  metrics?: ArticleMetric;
};

export type UserReview = {
  id: string;
  user_id: string;
  title: string;
  category: 'Game' | 'Movie' | 'Anime' | 'Series' | 'Tech' | 'Music';
  release_year: number;
  verdict: 'must_buy' | 'wait_sale' | 'wait_patches' | 'skip';
  score: number;
  content: string;
  youtube_url: string;
  voice_url?: string | null;
  pros?: string[];
  cons?: string[];
  bottom_line?: string | null;
  cover_url: string | null;
  likes_count: number;
  comments_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  cover_gradient: string;
  items_count: number;
  created_at: string;
  updated_at: string;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  release_window: string;
  hype_score: number;
  created_at: string;
};

