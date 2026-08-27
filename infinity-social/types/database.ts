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

export type ArticleMetric = {
  id: string;
  article_id: string;
  score: number | null;
  pros: string[];
  cons: string[];
  verdict: string | null;
  created_at: string;
  updated_at: string;
};
