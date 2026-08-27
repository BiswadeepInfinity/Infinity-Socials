-- Migration: Add community_votes jsonb column to user_reviews table
-- Run this in your Supabase SQL Editor:

ALTER TABLE public.user_reviews 
ADD COLUMN IF NOT EXISTS community_votes JSONB DEFAULT '{"must_buy": 0, "wait_sale": 0, "wait": 0, "skip": 0}'::jsonb;

-- Optional: Allow anyone to update community_votes on reviews
CREATE POLICY "Allow public update community_votes on user_reviews"
ON public.user_reviews
FOR UPDATE
USING (true)
WITH CHECK (true);
