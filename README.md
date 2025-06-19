# KYSG - Kata Yang Sama Game

A multiplayer Wordle-style game built with React, Vite, and Supabase, featuring 5-letter Malay words.

## 🎮 Features

- **Wordle-style gameplay** with 5-letter Malay words
- **Multiplayer experience** - all users guess the same daily word
- **Authentication system** with email/password login
- **Editable usernames** with availability checking
- **Scoring system** - 100 points for 1st try, decreasing by 10 for each attempt
- **Leaderboards** - Daily, Weekly, and All-Time views
- **Shareable results** in emoji format (like KatapatMalaysia)
- **Admin panel** for word management
- **Responsive design** with mobile-first approach

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kysg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   Create the following tables in your Supabase project:

   ```sql
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
   ```

   Set up Row Level Security (RLS):
   ```sql
   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE wordlist ENABLE ROW LEVEL SECURITY;
   ALTER TABLE daily_word ENABLE ROW LEVEL SECURITY;
   ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

   -- Users can only see/edit their own data
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON users
     FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" ON users
     FOR INSERT WITH CHECK (auth.uid() = id);

   -- Public read access to wordlist and daily_word
   CREATE POLICY "Public read access to wordlist" ON wordlist
     FOR SELECT USING (true);

   CREATE POLICY "Public read access to daily_word" ON daily_word
     FOR SELECT USING (true);

   -- Users can only see their own guesses and scores
   CREATE POLICY "Users can view own guesses" ON guesses
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own guesses" ON guesses
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view own scores" ON scores
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own scores" ON scores
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 🎯 Game Rules

- Each day, all players guess the same 5-letter Malay word
- Players have 6 attempts to guess the word
- After each guess, tiles show:
  - 🟩 Green: Letter is correct and in right position
  - 🟨 Yellow: Letter is in the word but wrong position
  - ⬛ Gray: Letter is not in the word
- Scoring: 100 points for 1st try, 90 for 2nd, 80 for 3rd, etc.
- Players can only play once per day
- Results can be shared in emoji format

## 👨‍💻 Admin Access

To access the admin panel, create a user with email `admin@kysg.com`. (Password: adminkysg123) The admin panel allows you to:

- Set daily words for specific dates
- Add individual words to the word list
- Upload word lists via CSV/TXT files
- View and manage the complete word database

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Board.jsx       # Game board grid
│   ├── Keyboard.jsx    # Virtual keyboard
│   ├── Layout.jsx      # Main layout with navigation
│   ├── ShareModal.jsx  # Share results modal
│   └── TileRow.jsx     # Individual tile row
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state
├── hooks/              # Custom React hooks
│   └── useGameLogic.js # Game logic and state
├── lib/                # Utility libraries
│   └── supabaseClient.js # Supabase configuration
├── pages/              # Page components
│   ├── Admin.jsx       # Admin panel
│   ├── Game.jsx        # Main game page
│   ├── Leaderboard.jsx # Leaderboard page
│   ├── Login.jsx       # Authentication page
│   ├── Onboarding.jsx  # Username setup
│   └── Profile.jsx     # User profile
├── App.jsx             # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## 🚀 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

3. **Set environment variables** in your deployment platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Wordle and KatapatMalaysia
- Built with modern React patterns and best practices
- Uses Supabase for scalable backend services 