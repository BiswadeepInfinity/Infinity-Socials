-- ============================================================
-- INFINITY SOCIAL — Supabase PostgreSQL Schema
-- Paste this entire file into Supabase SQL Editor and run it
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('games', 'anime', 'popculture', 'reviews', 'interviews', 'blogs')),
  description TEXT,
  cover_image TEXT,
  color_accent TEXT DEFAULT '#7c3aed',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, type, color_accent) VALUES
  ('Action Games', 'action-games', 'games', '#ef4444'),
  ('RPGs', 'rpgs', 'games', '#f97316'),
  ('Indie Games', 'indie-games', 'games', '#84cc16'),
  ('FPS', 'fps', 'games', '#06b6d4'),
  ('Strategy', 'strategy', 'games', '#8b5cf6'),
  ('Shonen', 'shonen', 'anime', '#f59e0b'),
  ('Seinen', 'seinen', 'anime', '#10b981'),
  ('Isekai', 'isekai', 'anime', '#6366f1'),
  ('Mecha', 'mecha', 'anime', '#ec4899'),
  ('Slice of Life', 'slice-of-life', 'anime', '#14b8a6'),
  ('Movies', 'movies', 'popculture', '#a855f7'),
  ('TV Shows', 'tv-shows', 'popculture', '#f43f5e'),
  ('Comics', 'comics', 'popculture', '#0ea5e9'),
  ('Music', 'music', 'popculture', '#22c55e')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,                    -- Rich text / markdown
  excerpt TEXT,
  thumbnail_url TEXT,
  youtube_url TEXT,                         -- YouTube video link
  youtube_video_id TEXT,                    -- Extracted video ID
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  read_time_minutes INT DEFAULT 5,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ARTICLE METRICS (Review Scores, Pros & Cons)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
  score NUMERIC(3,1) CHECK (score >= 0 AND score <= 10),
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  verdict TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ARTICLE VOTES (Community upvotes on homepage)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- ============================================================
-- COMMUNITY FORUMS (per article, Discord-style channels)
-- ============================================================
CREATE TABLE IF NOT EXISTS forums (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FORUM MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES forum_messages(id) ON DELETE SET NULL, -- Threading
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FORUM MESSAGE VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES forum_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- ============================================================
-- BOOKMARKS (User personal bookshelf)
-- ============================================================
-- BOOKMARKS (User personal bookshelf)
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  forum_id UUID REFERENCES forums(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================================
-- USER REVIEWS (Community & Personal Critique)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Game', 'Movie', 'Anime', 'Series', 'Tech', 'Music')),
  release_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  verdict TEXT NOT NULL CHECK (verdict IN ('must_buy', 'wait_sale', 'wait_patches', 'skip', 'masterpiece', 'timepass')),
  score NUMERIC(5,1) CHECK (score >= 0 AND score <= 100),
  content TEXT NOT NULL,
  youtube_url TEXT,
  voice_url TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  bottom_line TEXT,
  community_votes JSONB DEFAULT '{"must_buy": 0, "wait_sale": 0, "wait": 0, "skip": 0}'::jsonb,
  cover_url TEXT,
  upvotes_count INT DEFAULT 0,
  downvotes_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User review likes
CREATE TABLE IF NOT EXISTS user_review_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- ============================================================
-- USER COLLECTIONS (Curated Shelves & Lists)
-- ============================================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  cover_gradient TEXT DEFAULT 'from-violet-900/60 to-purple-950/80',
  items_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_review_id UUID REFERENCES user_reviews(id) ON DELETE SET NULL,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER WATCHLIST / INTERESTED RADAR
-- ============================================================
CREATE TABLE IF NOT EXISTS user_watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  release_window TEXT NOT NULL,
  hype_score INT DEFAULT 95,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ANNOTATIONS (Highlighter + Pen tool)
-- ============================================================
CREATE TABLE IF NOT EXISTS annotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('highlight', 'pen', 'note')),
  data JSONB NOT NULL,                      -- Stores selection range / canvas data
  color TEXT DEFAULT '#fde047',
  is_shared BOOLEAN DEFAULT FALSE,          -- Private by default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI TRANSLATION CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS translations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translated_title TEXT,
  translated_content TEXT,
  translated_excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, language_code)
);

-- ============================================================
-- TTS (Text-to-Speech) CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS tts_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  audio_url TEXT NOT NULL,                  -- Supabase Storage URL
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, language_code)
);

-- ============================================================
-- VIEWS for easy querying
-- ============================================================

-- Articles with vote counts (for community leaderboard)
CREATE OR REPLACE VIEW articles_with_votes AS
SELECT
  a.*,
  p.username AS author_username,
  p.display_name AS author_display_name,
  p.avatar_url AS author_avatar,
  c.name AS category_name,
  c.slug AS category_slug,
  c.type AS category_type,
  c.color_accent AS category_color,
  m.score,
  m.pros,
  m.cons,
  m.verdict,
  COALESCE(SUM(CASE WHEN av.vote_type = 'up' THEN 1 ELSE 0 END), 0) AS upvotes,
  COALESCE(SUM(CASE WHEN av.vote_type = 'down' THEN 1 ELSE 0 END), 0) AS downvotes,
  COALESCE(SUM(CASE WHEN av.vote_type = 'up' THEN 1 WHEN av.vote_type = 'down' THEN -1 ELSE 0 END), 0) AS net_votes
FROM articles a
LEFT JOIN profiles p ON a.author_id = p.id
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN article_metrics m ON a.id = m.article_id
LEFT JOIN article_votes av ON a.id = av.article_id
GROUP BY a.id, p.username, p.display_name, p.avatar_url, c.name, c.slug, c.type, c.color_accent, m.score, m.pros, m.cons, m.verdict;

-- Forum messages with vote counts
CREATE OR REPLACE VIEW forum_messages_with_votes AS
SELECT
  fm.*,
  p.username,
  p.display_name,
  p.avatar_url,
  COALESCE(SUM(CASE WHEN fv.vote_type = 'up' THEN 1 ELSE 0 END), 0) AS upvote_count,
  COALESCE(SUM(CASE WHEN fv.vote_type = 'down' THEN 1 ELSE 0 END), 0) AS downvote_count
FROM forum_messages fm
LEFT JOIN profiles p ON fm.user_id = p.id
LEFT JOIN forum_votes fv ON fm.id = fv.message_id
GROUP BY fm.id, p.username, p.display_name, p.avatar_url;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- User reviews policies
CREATE POLICY "Public user reviews are viewable by everyone" ON user_reviews
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create own reviews" ON user_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON user_reviews
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON user_reviews
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin_or_mod());

-- Review likes policies
CREATE POLICY "Review likes viewable by all" ON user_review_likes
  FOR SELECT USING (TRUE);

CREATE POLICY "Auth users can like reviews" ON user_review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove review like" ON user_review_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Public collections are viewable by all" ON collections
  FOR SELECT USING (is_private = FALSE OR auth.uid() = user_id);

CREATE POLICY "Users manage own collections" ON collections
  FOR ALL USING (auth.uid() = user_id);

-- Collection items
CREATE POLICY "View collection items" ON collection_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_id AND (c.is_private = FALSE OR c.user_id = auth.uid())));

CREATE POLICY "Users manage own collection items" ON collection_items
  FOR ALL USING (EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));

-- Watchlist
CREATE POLICY "Users view own watchlist" ON user_watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own watchlist" ON user_watchlist
  FOR ALL USING (auth.uid() = user_id);


-- Helper security function to check admin/mod role without recursive RLS trigger
CREATE OR REPLACE FUNCTION public.is_admin_or_mod()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles: public read, own write (prevent role escalation by ordinary users)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert own profile on signup" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id) 
  WITH CHECK (
    auth.uid() = id AND (
      role IS NULL OR 
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR 
      public.is_admin()
    )
  );

-- Categories: public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON categories 
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage categories" ON categories 
  FOR ALL USING (public.is_admin_or_mod());

-- Articles: public read if published, admin full access
CREATE POLICY "Published articles viewable by all" ON articles 
  FOR SELECT USING (is_published = TRUE OR public.is_admin_or_mod());

CREATE POLICY "Admins can manage articles" ON articles 
  FOR ALL USING (public.is_admin_or_mod());

-- Article metrics: public read, admin manage
CREATE POLICY "Metrics are public" ON article_metrics 
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage metrics" ON article_metrics 
  FOR ALL USING (public.is_admin_or_mod());

-- Votes: authenticated users can vote once
CREATE POLICY "Anyone can read votes" ON article_votes 
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can vote" ON article_votes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change own vote" ON article_votes 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote" ON article_votes 
  FOR DELETE USING (auth.uid() = user_id);

-- Forums: public read, auth write
CREATE POLICY "Forums are public" ON forums 
  FOR SELECT USING (TRUE);

CREATE POLICY "Auth users can create forums" ON forums 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Creators and mods can manage forums" ON forums 
  FOR UPDATE USING (auth.uid() = created_by OR public.is_admin_or_mod());

-- Forum messages: public read, auth write own
CREATE POLICY "Messages are public" ON forum_messages 
  FOR SELECT USING (TRUE);

CREATE POLICY "Auth users can post messages" ON forum_messages 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own messages" ON forum_messages 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON forum_messages 
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin_or_mod());

-- Forum votes: authenticated
CREATE POLICY "Anyone can read forum votes" ON forum_votes 
  FOR SELECT USING (TRUE);

CREATE POLICY "Auth users can vote on messages" ON forum_votes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change own forum vote" ON forum_votes 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own forum vote" ON forum_votes 
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: private to owner
CREATE POLICY "Users can view own bookmarks" ON bookmarks 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON bookmarks 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks 
  FOR DELETE USING (auth.uid() = user_id);

-- Annotations: private OR shared read
CREATE POLICY "Users see own annotations" ON annotations 
  FOR SELECT USING (auth.uid() = user_id OR is_shared = TRUE);

CREATE POLICY "Users can insert own annotations" ON annotations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own annotations" ON annotations 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own annotations" ON annotations 
  FOR DELETE USING (auth.uid() = user_id);

-- Translations: public read
CREATE POLICY "Translations are public" ON translations 
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage translations" ON translations 
  FOR ALL USING (public.is_admin());

-- TTS: public read
CREATE POLICY "TTS cache is public" ON tts_cache 
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage TTS" ON tts_cache 
  FOR ALL USING (public.is_admin());

-- ============================================================
-- FUNCTIONS for vote toggling (Hardened)
-- ============================================================

-- Toggle article vote (prevents double voting & verifies auth)
CREATE OR REPLACE FUNCTION toggle_article_vote(p_article_id UUID, p_vote_type TEXT)
RETURNS VOID AS $$
DECLARE
  v_uid UUID;
  existing_vote TEXT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote type';
  END IF;

  SELECT vote_type INTO existing_vote
  FROM public.article_votes
  WHERE article_id = p_article_id AND user_id = v_uid;

  IF existing_vote IS NULL THEN
    INSERT INTO public.article_votes (article_id, user_id, vote_type) 
    VALUES (p_article_id, v_uid, p_vote_type);
  ELSIF existing_vote = p_vote_type THEN
    DELETE FROM public.article_votes 
    WHERE article_id = p_article_id AND user_id = v_uid;
  ELSE
    UPDATE public.article_votes 
    SET vote_type = p_vote_type 
    WHERE article_id = p_article_id AND user_id = v_uid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Toggle forum message vote (Hardened)
CREATE OR REPLACE FUNCTION toggle_forum_vote(p_message_id UUID, p_vote_type TEXT)
RETURNS VOID AS $$
DECLARE
  v_uid UUID;
  existing_vote TEXT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote type';
  END IF;

  SELECT vote_type INTO existing_vote
  FROM public.forum_votes
  WHERE message_id = p_message_id AND user_id = v_uid;

  IF existing_vote IS NULL THEN
    INSERT INTO public.forum_votes (message_id, user_id, vote_type) 
    VALUES (p_message_id, v_uid, p_vote_type);
  ELSIF existing_vote = p_vote_type THEN
    DELETE FROM public.forum_votes 
    WHERE message_id = p_message_id AND user_id = v_uid;
  ELSE
    UPDATE public.forum_votes 
    SET vote_type = p_vote_type 
    WHERE message_id = p_message_id AND user_id = v_uid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Increment view count (Hardened)
CREATE OR REPLACE FUNCTION increment_view_count(p_article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- STORAGE BUCKETS & POLICIES (Avatars & Uploads)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

