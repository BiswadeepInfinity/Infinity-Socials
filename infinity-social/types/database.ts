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
  community_votes?: {
    must_buy: number;
    wait_sale: number;
    wait: number;
    skip: number;
  } | null;
  cover_url: string | null;
  upvotes_count: number;
  downvotes_count: number;
  likes_count: number;
  comments_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type ReviewPollVote = {
  id: string;
  review_id: string;
  user_id: string;
  vote_option: 'must_buy' | 'wait_sale' | 'wait' | 'skip';
  created_at: string;
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

export type ClubHierarchyRank = 'president' | 'vice_president' | 'executive' | 'member';

export type ClubRole = {
  id: string;
  club_id: string;
  name: string;
  color: string; // hex like #06b6d4 or #f43f5e
  bg_color?: string;
  icon?: string; // emoji or badge icon
};

export type ClubMember = {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  rank: ClubHierarchyRank;
  custom_roles: ClubRole[];
  xp_contributed: number;
  joined_at: string;
};

export type DigitalEventType = 'watchparty' | 'tournament' | 'keynote_stream' | 'raid_night' | 'discussion_summit';
export type DigitalEventCategory = 'game' | 'anime' | 'movie' | 'tech';

export type DigitalEvent = {
  id: string;
  club_id?: string;
  society_id?: string;
  title: string;
  description: string;
  category: DigitalEventCategory;
  event_type: DigitalEventType;
  banner_url: string;
  start_time: string; // ISO date string
  end_time?: string;
  platform_name: string; // e.g. 'Discord Stage', 'Twitch', 'Watchparty Room', 'YouTube Live'
  platform_url: string;
  rsvp_user_ids: string[];
  xp_reward: number;
  created_by: string;
  created_at: string;
};

export type Society = {
  id: string;
  name: string;
  slug: string;
  tag: string; // e.g. [PANTH]
  motto: string;
  description: string;
  category: string;
  crest_url: string;
  banner_url: string;
  founder_club_id: string;
  member_club_ids: string[];
  level: number;
  xp: number;
  treaty_charter: string[];
  created_at: string;
};

export type ClubPact = {
  id: string;
  society_id: string;
  society_name: string;
  club_a_id: string;
  club_b_id: string;
  status: 'active' | 'pending';
  treaty_title: string;
  signed_at: string;
};

export type Club = {
  id: string;
  name: string;
  slug: string;
  tag: string; // e.g. [CRUC], [SAKU], [NOIR]
  motto: string;
  description: string;
  category: 'Gaming' | 'Anime' | 'Pop Culture' | 'Tech';
  avatar_url: string;
  banner_url: string;
  created_by: string;
  president_id: string;
  entry_type: 'open' | 'application' | 'invite';
  member_limit: number; // e.g. 50, 100, 250
  member_count: number;
  level: number;
  xp: number;
  society_id?: string; // If federated into a Grand Society
  custom_roles: ClubRole[];
  members: ClubMember[];
  perks: string[];
  rules: string[];
  created_at: string;
};

export type ChannelBadgeType = 
  | 'president'
  | 'vice_president'
  | 'executive'
  | 'member'
  | 'top_contributor';

// Legacy channel alias for backwards-compatibility
export type Channel = Club;

export type ClubPost = {
  id: string;
  club_id: string;
  society_id?: string | null;
  user_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  author_rank: ClubHierarchyRank;
  author_custom_roles?: ClubRole[];
  author_club_tag?: string;
  title: string;
  content: string;
  flair?: string;
  media_url?: string | null;
  link_url?: string | null;
  article_slug?: string | null;
  article_title?: string | null;
  article_thumbnail?: string | null;
  article_score?: string | null;
  article_read_time?: string | null;
  article_category?: string | null;
  event_id?: string | null;
  boosts: number;
  user_boosted?: boolean;
  comments_count: number;
  is_pinned?: boolean;
  created_at: string;
};

// Legacy ChannelPost alias
export type ChannelPost = ClubPost;

export type ClubComment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  author_rank?: ClubHierarchyRank;
  author_custom_roles?: ClubRole[];
  content: string;
  boosts: number;
  user_boosted?: boolean;
  created_at: string;
  is_pinned?: boolean;
  replies?: ClubComment[];
};

export type ChannelComment = ClubComment;
