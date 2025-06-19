-- KYSG Database Setup
-- Run this in your Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Word list table
CREATE TABLE wordlist (
  id SERIAL PRIMARY KEY,
  word TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily word table
CREATE TABLE daily_word (
  date DATE PRIMARY KEY,
  word TEXT NOT NULL REFERENCES wordlist(word),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guesses table
CREATE TABLE guesses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  guess TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  game_date DATE NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game_date DATE NOT NULL,
  attempts_used INTEGER NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_date)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_word ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow username availability check
CREATE POLICY "Public username check" ON users
  FOR SELECT USING (true);

CREATE POLICY "Public read access to wordlist" ON wordlist
  FOR SELECT USING (true);

CREATE POLICY "Public read access to daily_word" ON daily_word
  FOR SELECT USING (true);

CREATE POLICY "Users can view own guesses" ON guesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guesses" ON guesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read access to scores for leaderboard
CREATE POLICY "Public read access to scores" ON scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sample Malay words (5 letters)
INSERT INTO wordlist (word) VALUES
('makan'), ('minum'), ('tidur'), ('jalan'), ('kerja'); 