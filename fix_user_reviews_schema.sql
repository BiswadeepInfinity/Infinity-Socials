-- ============================================================
-- SQL PATCH: Sync `user_reviews` table columns with Next.js frontend
-- Run this in your Supabase Dashboard SQL Editor
-- ============================================================

-- 1. Add missing columns to public.user_reviews
ALTER TABLE public.user_reviews 
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS voice_url TEXT,
ADD COLUMN IF NOT EXISTS pros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bottom_line TEXT,
ADD COLUMN IF NOT EXISTS upvotes_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS community_votes JSONB DEFAULT '{"must_buy": 0, "wait_sale": 0, "wait": 0, "skip": 0}'::jsonb;

-- 2. Ensure verdict CHECK constraint includes modern values: 'must_buy', 'wait_sale', 'wait_patches', 'skip', 'masterpiece', 'timepass'
ALTER TABLE public.user_reviews DROP CONSTRAINT IF EXISTS user_reviews_verdict_check;

ALTER TABLE public.user_reviews 
ADD CONSTRAINT user_reviews_verdict_check 
CHECK (verdict IN ('must_buy', 'wait_sale', 'wait_patches', 'skip', 'masterpiece', 'timepass'));

-- 3. Ensure score allows values from 0 to 100
ALTER TABLE public.user_reviews DROP CONSTRAINT IF EXISTS user_reviews_score_check;

ALTER TABLE public.user_reviews 
ADD CONSTRAINT user_reviews_score_check 
CHECK (score >= 0 AND score <= 100);

-- 4. Storage Bucket Policies: Ensure authenticated users can upload review images and audio into avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access to avatars" ON storage.objects;
CREATE POLICY "Public access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload objects" ON storage.objects;
CREATE POLICY "Authenticated users can upload objects" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own storage objects" ON storage.objects;
CREATE POLICY "Users can update own storage objects" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );
