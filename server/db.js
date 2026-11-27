// ============================================
// 🎮 Supabase-Powered Database Layer for هخلص عليك
// Wraps Supabase queries with local JSON fallback
// ============================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase, { isSupabaseReady } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// ==========================================
// Local JSON Database Fallback
// ==========================================
const defaultData = {
  users: {},
  rooms: {},
  gameStats: {},
  tokens: {},
  otps: {},
};

class LocalDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('[LocalDB] Error loading database:', e);
    }
    this.save(defaultData);
    return { ...defaultData };
  }

  save(data = this.data) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[LocalDB] Error saving database:', e);
    }
  }

  getUserByPhone(phone) { return this.data.users[phone] || null; }
  getUserById(id) { return Object.values(this.data.users).find(u => u.id === id) || null; }
  saveUser(user) { this.data.users[user.phone] = user; this.save(); return user; }
  getAllUsers() { return Object.values(this.data.users); }
  setToken(token, phone) { this.data.tokens[token] = phone; this.save(); }
  getPhoneByToken(token) { return this.data.tokens[token] || null; }
  removeToken(token) { delete this.data.tokens[token]; this.save(); }
  setOtp(phone, otp) {
    this.data.otps[phone] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    this.save();
  }
  verifyOtp(phone, otp) {
    const record = this.data.otps[phone];
    if (!record) return false;
    if (Date.now() > record.expiresAt) { delete this.data.otps[phone]; this.save(); return false; }
    const isValid = record.otp === otp;
    if (isValid) { delete this.data.otps[phone]; this.save(); }
    return isValid;
  }
}

const localDb = new LocalDatabase();

// ==========================================
// Hybrid Database Class (Supabase + Local Fallback)
// ==========================================
class Database {
  constructor() {
    this.useSupabase = isSupabaseReady();
    if (this.useSupabase) {
      console.log('🟢 [DB] Using Supabase as primary database');
    } else {
      console.log('📁 [DB] Using local JSON database (fallback mode)');
    }
  }

  // ---------- Users ----------
  async getUserByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.toString().trim();
    if (!this.useSupabase) return localDb.getUserByPhone(cleanPhone);
    const { data, error } = await supabase.from('profiles').select('*').eq('phone', cleanPhone).single();
    if (error || !data) return localDb.getUserByPhone(cleanPhone);
    return this._mapProfileFromSupabase(data);
  }

  async getUserByNickname(nickname) {
    if (!nickname) return null;
    const clean = nickname.toString().trim();
    if (!clean) return null;

    if (!this.useSupabase) {
      const all = localDb.getAllUsers();
      return all.find(u => u.nickname && u.nickname.trim().toLowerCase() === clean.toLowerCase()) || null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('nickname', clean)
        .limit(1);

      if (error || !data || data.length === 0) return null;
      return this._mapProfileFromSupabase(data[0]);
    } catch (e) {
      console.warn('[DB] getUserByNickname error:', e.message);
      return null;
    }
  }

  async getUserById(id) {
    if (!this.useSupabase) return localDb.getUserById(id);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error || !data) return localDb.getUserById(id);
    return this._mapProfileFromSupabase(data);
  }

  async saveUser(user) {
    // Always save locally
    localDb.saveUser(user);

    if (!this.useSupabase) return user;

    const supabaseUser = {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname || `لاعب_${user.phone.slice(-4)}`,
      avatar: user.avatar || '🦁',
      points: user.points || 0,
      games_played: user.gamesPlayed || 0,
      games_won: user.gamesWon || 0,
      total_correct: user.totalCorrect || 0,
      total_wrong: user.totalWrong || 0,
      win_streak: user.winStreak || 0,
      best_streak: user.bestStreak || 0,
      banned: user.banned || false,
      last_login_at: user.lastLoginAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(supabaseUser, { onConflict: 'phone' })
      .select()
      .single();

    if (error) {
      console.error('[DB/Supabase] saveUser error:', error.message);
    } else if (data) {
      // Update local with Supabase-generated ID if needed
      const mapped = this._mapProfileFromSupabase(data);
      localDb.saveUser(mapped);
      return mapped;
    }

    return user;
  }

  async getAllUsers() {
    if (!this.useSupabase) return localDb.getAllUsers();
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data) return localDb.getAllUsers();
    return data.map(d => this._mapProfileFromSupabase(d));
  }

  async updateUserStats(userId, stats) {
    if (!this.useSupabase) {
      const user = localDb.getUserById(userId);
      if (user) {
        Object.assign(user, stats);
        localDb.saveUser(user);
      }
      return;
    }

    const updateData = {};
    if (stats.points !== undefined) updateData.points = stats.points;
    if (stats.gamesPlayed !== undefined) updateData.games_played = stats.gamesPlayed;
    if (stats.gamesWon !== undefined) updateData.games_won = stats.gamesWon;
    if (stats.totalCorrect !== undefined) updateData.total_correct = stats.totalCorrect;
    if (stats.totalWrong !== undefined) updateData.total_wrong = stats.totalWrong;
    if (stats.nickname !== undefined) updateData.nickname = stats.nickname;
    if (stats.avatar !== undefined) updateData.avatar = stats.avatar;
    updateData.updated_at = new Date().toISOString();

    await supabase.from('profiles').update(updateData).eq('id', userId);
  }

  // ---------- Tokens ----------
  setToken(token, phone) { localDb.setToken(token, phone); }
  getPhoneByToken(token) { return localDb.getPhoneByToken(token); }
  removeToken(token) { localDb.removeToken(token); }

  // ---------- OTP ----------
  setOtp(phone, otp) { localDb.setOtp(phone, otp); }
  verifyOtp(phone, otp) { return localDb.verifyOtp(phone, otp); }

  // ---------- Categories Admin & Management ----------
  async getAllCategoriesAdmin() {
    if (!this.useSupabase) {
      return this.getCategories() || [];
    }

    try {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !cats) {
        console.error('[DB] getAllCategoriesAdmin error:', error?.message);
        return [];
      }

      // Fetch questions count for each category
      const { data: qList } = await supabase
        .from('questions')
        .select('category_slug');

      const countMap = {};
      if (qList) {
        for (const q of qList) {
          countMap[q.category_slug] = (countMap[q.category_slug] || 0) + 1;
        }
      }

      return cats.map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        name_ar: c.name_ar || c.name,
        icon: c.icon || '🎯',
        color: c.color || '#e2b714',
        parent_slug: c.parent_slug,
        sort_order: c.sort_order ?? 0,
        is_active: c.is_active ?? true,
        is_custom: c.is_custom ?? false,
        questionCount: countMap[c.slug] || 0,
      }));
    } catch (err) {
      console.error('[DB] getAllCategoriesAdmin error:', err.message);
      return [];
    }
  }

  async addCategory(cat) {
    const rawSlug = (cat.slug || cat.name || cat.name_ar || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    const slug = rawSlug || `cat-${Date.now().toString(36)}`;

    const row = {
      slug,
      name: cat.name || cat.name_ar || slug,
      name_ar: cat.name_ar || cat.name || slug,
      icon: cat.icon || '🎯',
      color: cat.color || '#e2b714',
      parent_slug: cat.parent_slug || null,
      sort_order: Number(cat.sort_order) || 0,
      is_active: cat.is_active !== false,
      is_custom: true,
    };

    if (!this.useSupabase) {
      return { id: uuidv4(), ...row, questionCount: 0 };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error('[DB] addCategory error:', error.message);
      throw new Error(error.message);
    }

    return { ...data, questionCount: 0 };
  }

  async updateCategory(idOrSlug, updates) {
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.name_ar !== undefined) updateData.name_ar = updates.name_ar;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    if (updates.sort_order !== undefined) updateData.sort_order = Number(updates.sort_order);
    if (updates.parent_slug !== undefined) updateData.parent_slug = updates.parent_slug;

    if (!this.useSupabase) {
      return { id: idOrSlug, ...updates };
    }

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);
    let query = supabase.from('categories').update(updateData);
    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.select().single();
    if (error) {
      console.error('[DB] updateCategory error:', error.message);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteCategory(idOrSlug) {
    if (!this.useSupabase) return true;

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);
    let query = supabase.from('categories').delete();
    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { error } = await query;
    if (error) {
      console.error('[DB] deleteCategory error:', error.message);
      throw new Error(error.message);
    }
    return true;
  }

  // ---------- Game Content (Supabase reads) ----------
  async getCategories() {
    if (!this.useSupabase) return null; // Fallback to questions.js
    const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
    if (error || !data || data.length === 0) return null;
    return data;
  }

  async getQuestionsByCategory(categorySlug, limit = 50) {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_slug', categorySlug)
      .eq('is_active', true)
      .limit(limit);
    if (error) return null;
    return data;
  }

  async getAllQuestions() {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase.from('questions').select('*').eq('is_active', true);
    if (error || !data || data.length === 0) return null;
    return data.map(q => ({
      id: q.id,
      category: q.category_slug,
      subcategory: q.subcategory_slug,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      correctAnswerText: q.options && typeof q.correct_answer === 'number' ? q.options[q.correct_answer] : q.correct_answer_text,
      points: q.points,
      difficulty: q.difficulty,
      explanation: q.explanation,
      mediaType: q.media_type,
      mediaUrl: q.media_url,
      isCustom: true,
    }));
  }

  async addQuestion(q) {
    if (!this.useSupabase) return null;
    const row = {
      category_slug: q.category || q.category_slug || 'general',
      subcategory_slug: q.subcategory || q.subcategory_slug || q.category || 'general',
      question: q.question,
      options: q.options || [q.correctAnswerText || 'الإجابة الصحيحة'],
      correct_answer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      points: Number(q.points) || 200,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || '',
      media_type: q.mediaType || null,
      media_url: q.mediaUrl || null,
      is_active: true,
    };
    const { data, error } = await supabase.from('questions').insert([row]).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      category: data.category_slug,
      subcategory: data.subcategory_slug,
      question: data.question,
      options: data.options,
      correctAnswer: data.correct_answer,
      correctAnswerText: data.options?.[data.correct_answer] || q.correctAnswerText,
      points: data.points,
      difficulty: data.difficulty,
      explanation: data.explanation,
      mediaType: data.media_type,
      mediaUrl: data.media_url,
      isCustom: true,
    };
  }

  async updateQuestion(id, updates) {
    if (!this.useSupabase) return null;
    const row = {};
    if (updates.category !== undefined) row.category_slug = updates.category;
    if (updates.subcategory !== undefined) row.subcategory_slug = updates.subcategory;
    if (updates.question !== undefined) row.question = updates.question;
    if (updates.options !== undefined) row.options = updates.options;
    if (updates.correctAnswer !== undefined) row.correct_answer = updates.correctAnswer;
    if (updates.points !== undefined) row.points = Number(updates.points);
    if (updates.difficulty !== undefined) row.difficulty = updates.difficulty;
    if (updates.explanation !== undefined) row.explanation = updates.explanation;
    if (updates.mediaType !== undefined) row.media_type = updates.mediaType;
    if (updates.mediaUrl !== undefined) row.media_url = updates.mediaUrl;
    const { data, error } = await supabase.from('questions').update(row).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteQuestion(id) {
    if (!this.useSupabase) return false;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  async getAuctions() {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase.from('auction_challenges').select('*').eq('is_active', true).order('sort_order');
    if (error || !data || data.length === 0) return null;
    return data.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      hint: a.hint,
      startingBid: a.starting_bid,
      timeSeconds: a.time_seconds,
      pointsReward: a.points_reward,
      validAnswers: a.valid_answers,
    }));
  }

  async getSketches() {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase.from('goal_sketches').select('*').eq('is_active', true).order('sort_order');
    if (error || !data || data.length === 0) return null;
    return data.map(s => ({
      id: s.id,
      title: s.title,
      year: s.year,
      match: s.match_name,
      description: s.description,
      passSequence: s.pass_sequence,
      options: s.options,
      correctAnswer: s.correct_answer,
      points: s.points,
      diagram: s.diagram,
    }));
  }

  async getCommentary() {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase.from('commentary_clues').select('*').eq('is_active', true).order('sort_order');
    if (error || !data || data.length === 0) return null;
    return data.map(c => ({
      id: c.id,
      commentator: c.commentator,
      quote: c.quote,
      clue: c.clue,
      question: c.question,
      options: c.options,
      correctAnswer: c.correct_answer,
      points: c.points,
    }));
  }

  async getCharades() {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase.from('charades_cards').select('*').eq('is_active', true).order('sort_order');
    if (error || !data || data.length === 0) return null;
    return data.map(ch => ({
      id: ch.id,
      name: ch.name,
      category: ch.category,
      emoji: ch.emoji,
      tabooWords: ch.taboo_words,
      difficulty: ch.difficulty,
      hint: ch.hint,
    }));
  }

  async getLineupMatches() {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase.from('lineup_matches').select('*').eq('is_active', true).order('sort_order');
    if (error || !data || data.length === 0) return null;
    return data.map(m => ({
      id: m.id,
      title: m.title,
      subtitle: m.subtitle,
      stadium: m.stadium,
      year: m.year,
      teamA: m.team_a,
      teamB: m.team_b,
    }));
  }

  async getSettings(key) {
    if (!this.useSupabase) return null;
    const { data, error } = await supabase.from('game_settings').select('value').eq('key', key).single();
    if (error || !data) return null;
    return data.value;
  }

  async saveSettings(key, value) {
    if (!this.useSupabase) return;
    await supabase.from('game_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }

  // ---------- Game History ----------
  async saveGameResult(result) {
    if (!this.useSupabase) return;
    await supabase.from('game_history').insert({
      room_code: result.roomCode,
      mode: result.mode,
      players: result.players,
      team_a_score: result.teamAScore,
      team_b_score: result.teamBScore,
      winner: result.winner,
      rounds_data: result.roundsData,
      duration_seconds: result.duration,
    });
  }

  async getLeaderboard(limit = 20) {
    if (!this.useSupabase) {
      return localDb.getAllUsers()
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, limit);
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, avatar, points, games_played, games_won')
      .eq('banned', false)
      .order('points', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data;
  }

  // ---------- Helpers ----------
  _mapProfileFromSupabase(d) {
    return {
      id: d.id,
      phone: d.phone,
      nickname: d.nickname,
      avatar: d.avatar,
      points: d.points,
      gamesPlayed: d.games_played,
      gamesWon: d.games_won,
      totalCorrect: d.total_correct,
      totalWrong: d.total_wrong,
      winStreak: d.win_streak,
      bestStreak: d.best_streak,
      badges: d.badges,
      banned: d.banned,
      createdAt: d.created_at,
      lastLoginAt: d.last_login_at,
    };
  }
}

export const db = new Database();
export default db;
