-- Fix RLS policies for leaderboard functionality
-- Run this in your Supabase SQL editor

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can view own scores" ON scores;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create new policies that allow leaderboard functionality
CREATE POLICY "Public read access to scores" ON scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public username check" ON users
  FOR SELECT USING (true);

-- Verify the policies are working
-- You can test with: SELECT * FROM scores LIMIT 5; 