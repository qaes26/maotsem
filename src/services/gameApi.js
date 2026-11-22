// ============================================
// 🎮 Client-Side Unified Game API for حخلص عليك
// Works both locally and on Netlify (direct Supabase queries)
// ============================================
import { supabase, isSupabaseConfigured } from '../config/supabase';
import {
  getQuestions as getLocalQuestions,
  getAuctionChallenges as getLocalAuctions,
  getGoalSketches as getLocalSketches,
  getCommentaryClues as getLocalCommentary,
  getCharadesCards as getLocalCharades,
  getLineupMatches as getLocalLineups,
  getMafiaRoles as getLocalMafiaRoles,
} from '../../server/data/questions';

export const gameApi = {
  // 1. Categories
  async getCategories() {
    // Try backend API first
    try {
      const res = await fetch('/api/game/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.categories && data.categories.length > 0) return data.categories;
      }
    } catch {
      // Backend not available (e.g. on Netlify static hosting)
    }

    // Direct Supabase query
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
          return data.map(c => ({
            id: c.slug,
            name: c.name_ar || c.name,
            icon: c.icon || '🎯',
            questionCount: 0,
            subcategories: []
          }));
        }
      } catch (err) {
        console.warn('[gameApi] Supabase categories error:', err);
      }
    }

    // Fallback
    return [
      { id: 'football', name: 'كرة القدم', icon: '⚽' },
      { id: 'series', name: 'مسلسلات وأفلام', icon: '🎬' },
      { id: 'general', name: 'معلومات عامة', icon: '🌍' },
      { id: 'girls', name: 'فئة البنات', icon: '💄' },
      { id: 'math', name: 'رياضيات وذكاء', icon: '🔢' },
      { id: 'arabic', name: 'لغة عربية', icon: '📖' },
    ];
  },

  // 2. Questions
  async getQuestions(category, subcategory) {
    // Try backend API first
    try {
      let url = '/api/game/questions';
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) return data.questions;
      }
    } catch {
      // ignore
    }

    // Direct Supabase query
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase.from('questions').select('*').eq('is_active', true);
        if (category) q = q.eq('category_slug', category);
        if (subcategory) q = q.eq('subcategory_slug', subcategory);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            category: row.category_slug,
            subcategory: row.subcategory_slug,
            question: row.question,
            options: row.options,
            correctAnswer: row.correct_answer,
            points: row.points,
            difficulty: row.difficulty,
            explanation: row.explanation,
            mediaType: row.media_type,
            mediaUrl: row.media_url,
          }));
        }
      } catch (err) {
        console.warn('[gameApi] Supabase questions error:', err);
      }
    }

    // Fallback to local questions
    let list = getLocalQuestions();
    if (category) list = list.filter(q => q.category === category);
    if (subcategory) list = list.filter(q => q.subcategory === subcategory);
    return list;
  },

  // 3. Auctions
  async getAuctions() {
    try {
      const res = await fetch('/api/game/auctions');
      if (res.ok) {
        const data = await res.json();
        if (data.auctions && data.auctions.length > 0) return data.auctions;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('auction_challenges').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
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
      } catch {}
    }

    return getLocalAuctions();
  },

  // 4. Sketches
  async getSketches() {
    try {
      const res = await fetch('/api/game/sketches');
      if (res.ok) {
        const data = await res.json();
        if (data.sketches && data.sketches.length > 0) return data.sketches;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('goal_sketches').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
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
      } catch {}
    }

    return getLocalSketches();
  },

  // 5. Commentary
  async getCommentary() {
    try {
      const res = await fetch('/api/game/commentary');
      if (res.ok) {
        const data = await res.json();
        if (data.commentary && data.commentary.length > 0) return data.commentary;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('commentary_clues').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
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
      } catch {}
    }

    return getLocalCommentary();
  },

  // 6. Charades
  async getCharades() {
    try {
      const res = await fetch('/api/game/charades');
      if (res.ok) {
        const data = await res.json();
        if (data.cards && data.cards.length > 0) return data.cards;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('charades_cards').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
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
      } catch {}
    }

    return getLocalCharades();
  },

  // 7. Lineups
  async getLineups() {
    try {
      const res = await fetch('/api/game/lineups');
      if (res.ok) {
        const data = await res.json();
        if (data.matches && data.matches.length > 0) return data.matches;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('lineup_matches').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
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
      } catch {}
    }

    return getLocalLineups();
  },

  // 8. Mafia Roles
  getMafiaRoles() {
    return getLocalMafiaRoles();
  }
};

export default gameApi;
