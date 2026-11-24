-- ============================================
-- 🎮 هخلص عليك (Seen Jeem) - Supabase Database Schema
-- قاعدة بيانات أسطورية كاملة للمنصة التنافسية
-- ============================================

-- ==========================================
-- 1. جدول المستخدمين (Users / Profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL DEFAULT 'لاعب هخلص عليك',
  avatar TEXT DEFAULT '🦁',
  points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  banned BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_room_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. جدول الفئات (Categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#e2b714',
  parent_slug TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. جدول الأسئلة (Questions)
-- ==========================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
  subcategory_slug TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 200,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'audio', 'video', NULL)),
  media_url TEXT,
  times_played INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. جدول مباريات التشكيلة (Lineup Matches)
-- ==========================================
CREATE TABLE IF NOT EXISTS lineup_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  stadium TEXT,
  year INTEGER,
  team_a JSONB NOT NULL,
  team_b JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. جدول تحديات المزاد (Auction Challenges)
-- ==========================================
CREATE TABLE IF NOT EXISTS auction_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  hint TEXT,
  starting_bid INTEGER DEFAULT 3,
  time_seconds INTEGER DEFAULT 45,
  points_reward INTEGER DEFAULT 500,
  valid_answers JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. جدول سكتش الأهداف (Goal Sketches)
-- ==========================================
CREATE TABLE IF NOT EXISTS goal_sketches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INTEGER,
  match_name TEXT,
  description TEXT,
  pass_sequence JSONB DEFAULT '[]',
  options JSONB DEFAULT '[]',
  correct_answer INTEGER DEFAULT 0,
  points INTEGER DEFAULT 400,
  diagram JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. جدول صوت المعلق (Commentary Clues)
-- ==========================================
CREATE TABLE IF NOT EXISTS commentary_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commentator TEXT NOT NULL,
  quote TEXT NOT NULL,
  clue TEXT,
  question TEXT,
  options JSONB DEFAULT '[]',
  correct_answer INTEGER DEFAULT 0,
  points INTEGER DEFAULT 400,
  audio_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. جدول بطاقات التمثيل (Charades Cards)
-- ==========================================
CREATE TABLE IF NOT EXISTS charades_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  emoji TEXT DEFAULT '🎭',
  taboo_words JSONB DEFAULT '[]',
  difficulty TEXT DEFAULT 'سهل',
  hint TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. جدول الغرف (Rooms)
-- ==========================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES profiles(id),
  mode TEXT DEFAULT 'pvp',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'closed')),
  max_players INTEGER DEFAULT 8,
  settings JSONB DEFAULT '{}',
  game_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- ==========================================
-- 10. جدول اللاعبين في الغرف (Room Players)
-- ==========================================
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team TEXT DEFAULT 'teamA' CHECK (team IN ('teamA', 'teamB', 'spectator')),
  is_connected BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

-- ==========================================
-- 11. جدول سجل المباريات (Game History)
-- ==========================================
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT,
  mode TEXT NOT NULL,
  players JSONB NOT NULL DEFAULT '[]',
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,
  winner TEXT,
  rounds_data JSONB,
  duration_seconds INTEGER,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 12. جدول لوحة المتصدرين (Leaderboard)
-- ==========================================
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  season TEXT DEFAULT 'all-time',
  total_points INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, season)
);

-- ==========================================
-- 13. جدول إعدادات اللعبة (Game Settings - Admin)
-- ==========================================
CREATE TABLE IF NOT EXISTS game_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 14. جدول الرسائل / الدردشة (Chat Messages)
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  player_id UUID REFERENCES profiles(id),
  nickname TEXT,
  message TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES for Performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_slug);
CREATE INDEX IF NOT EXISTS idx_questions_subcategory ON questions(subcategory_slug);
CREATE INDEX IF NOT EXISTS idx_questions_points ON questions(points);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_history_played ON game_history(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(room_code, created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentary_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE charades_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read policies (everyone can read game content)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read lineup_matches" ON lineup_matches FOR SELECT USING (is_active = true);
CREATE POLICY "Public read auction_challenges" ON auction_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Public read goal_sketches" ON goal_sketches FOR SELECT USING (is_active = true);
CREATE POLICY "Public read commentary_clues" ON commentary_clues FOR SELECT USING (is_active = true);
CREATE POLICY "Public read charades_cards" ON charades_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Public read game_settings" ON game_settings FOR SELECT USING (true);

-- Public read/insert for profiles, rooms, chat (the server manages auth)
CREATE POLICY "Public profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public room_players" ON room_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public game_history" ON game_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Admin full access on content tables
CREATE POLICY "Admin manage questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage lineup" ON lineup_matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage auctions" ON auction_challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage sketches" ON goal_sketches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage commentary" ON commentary_clues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage charades" ON charades_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage settings" ON game_settings FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- DEFAULT SETTINGS INSERT
-- ==========================================
INSERT INTO game_settings (key, value) VALUES
  ('theme', '{"primaryColor":"#1a1a2e","secondaryColor":"#16213e","accentColor":"#e2b714","successColor":"#00b894","dangerColor":"#e74c3c","warningColor":"#f39c12","surfaceColor":"#0f3460","textColor":"#ffffff","borderRadius":"12","fontFamily":"Cairo"}'::jsonb),
  ('lifelines', '{"enabled":["two-answers","pit","double","call-friend","swap","bomb"],"maxPerGame":3,"bombBonusChance":0.5}'::jsonb),
  ('game', '{"questionTimer":30,"pointValues":[200,400,600]}'::jsonb)
ON CONFLICT (key) DO NOTHING;
