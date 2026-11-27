// ============================================
// 🎮 Client-Side Unified Game API for هخلص عليك
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

    // Direct Supabase query (merged with local verified question media, deduplicating by id or question text)
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase.from('questions').select('*').eq('is_active', true);
        if (category) q = q.eq('category_slug', category);
        if (subcategory) q = q.eq('subcategory_slug', subcategory);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
          const byId = new Map();
          const textToId = new Map();
          let base = getLocalQuestions();
          if (category) base = base.filter(item => item.category === category || item.subcategory === category);
          if (subcategory) base = base.filter(item => item.subcategory === subcategory);
          for (const item of base) {
            byId.set(item.id, item);
            if (item.question) textToId.set(norm(item.question), item.id);
          }
          for (const row of data) {
            const targetId = byId.has(row.id) ? row.id : (textToId.get(norm(row.question)) || row.id);
            const prev = byId.get(targetId) || {};
            const resolvedMedia = row.media_url || prev.mediaUrl || prev.image || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80';
            byId.set(targetId, {
              ...prev,
              id: targetId,
              category: row.category_slug || prev.category,
              subcategory: row.subcategory_slug || prev.subcategory,
              question: row.question,
              options: row.options,
              correctAnswer: row.correct_answer,
              points: row.points,
              difficulty: row.difficulty,
              explanation: row.explanation,
              mediaType: row.media_type || prev.mediaType || 'image',
              mediaUrl: resolvedMedia,
              image: resolvedMedia,
            });
          }
          return Array.from(byId.values());
        }
      } catch (err) {
        console.warn('[gameApi] Supabase questions error:', err);
      }
    }

    // Fallback to local questions + localStorage custom questions
    let localCustom = [];
    try {
      localCustom = JSON.parse(localStorage.getItem('admin_custom_questions') || '[]');
    } catch {}
    let list = [...getLocalQuestions(), ...(Array.isArray(localCustom) ? localCustom : [])];
    if (category) list = list.filter(q => q.category === category || q.subcategory === category);
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

    const localAuctions = getLocalAuctions();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('auction_challenges').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
          const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
          const byId = new Map();
          const titleToId = new Map();
          for (const a of localAuctions) {
            byId.set(a.id, a);
            if (a.title) titleToId.set(norm(a.title), a.id);
          }
          for (const a of data) {
            const targetId = byId.has(a.id) ? a.id : (titleToId.get(norm(a.title)) || a.id);
            const prev = byId.get(targetId) || {};
            byId.set(targetId, {
              ...prev,
              id: targetId,
              title: a.title,
              description: a.description,
              hint: a.hint,
              image: a.image || prev.image || 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f5/UEFA_Champions_League.svg/960px-UEFA_Champions_League.svg.png',
              startingBid: a.starting_bid,
              timeSeconds: a.time_seconds,
              pointsReward: a.points_reward,
              validAnswers: a.valid_answers,
            });
          }
          return Array.from(byId.values());
        }
      } catch {}
    }

    return localAuctions;
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

    const localMatches = getLocalLineups();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('lineup_matches').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
          const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
          const byId = new Map();
          const titleToId = new Map();
          for (const m of localMatches) {
            byId.set(m.id, m);
            if (m.title) titleToId.set(norm(m.title), m.id);
          }
          for (const m of data) {
            const targetId = byId.has(m.id) ? m.id : (titleToId.get(norm(m.title)) || m.id);
            const prev = byId.get(targetId) || {};
            byId.set(targetId, {
              ...prev,
              id: targetId,
              title: m.title,
              subtitle: m.subtitle,
              stadium: m.stadium,
              year: m.year,
              competition: m.competition || prev.competition || 'بطولات كروية',
              image: m.image || prev.image || 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/London_Wembley.jpg/960px-London_Wembley.jpg',
              teamA: m.team_a,
              teamB: m.team_b,
            });
          }
          return Array.from(byId.values());
        }
      } catch {}
    }

    return localMatches;
  },

  // 8. Mafia Roles
  getMafiaRoles() {
    return getLocalMafiaRoles();
  },

  // 9. Admin Category CRUD (Direct Supabase fallback for Netlify)
  async getAllCategoriesAdmin() {
    // Try backend API first
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.categories) return data.categories;
      }
    } catch {}

    // Direct Supabase query
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: cats, error } = await supabase.from('categories').select('*').order('sort_order');
        if (!error && cats && cats.length > 0) {
          const { data: qList } = await supabase.from('questions').select('category_slug');
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
            image: c.image || '',
            sort_order: c.sort_order ?? 0,
            is_active: c.is_active ?? true,
            is_custom: c.is_custom ?? false,
            questionCount: countMap[c.slug] || 0,
          }));
        }
      } catch (err) {
        console.warn('[gameApi] Direct Supabase categories error:', err);
      }
    }

    // Fallback: derive from local questions
    const allQ = getLocalQuestions();
    const catMap = new Map();
    for (const q of allQ) {
      const slug = q.subcategory || q.category;
      if (!catMap.has(slug)) {
        catMap.set(slug, {
          id: slug,
          slug,
          name: q.subcategoryName || q.categoryName || slug,
          name_ar: q.subcategoryName || q.categoryName || slug,
          icon: '🎯',
          color: '#e2b714',
          is_active: true,
          is_custom: false,
          questionCount: 0,
        });
      }
      catMap.get(slug).questionCount++;
    }
    return Array.from(catMap.values());
  },

  async addCategory(cat) {
    // Try backend API first
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(cat)
      });
      if (res.ok) {
        const data = await res.json();
        return data.category || data;
      }
    } catch {}

    // Direct Supabase
    if (isSupabaseConfigured() && supabase) {
      const rawSlug = (cat.slug || cat.name || cat.name_ar || '')
        .toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
      const slug = rawSlug || `cat-${Date.now().toString(36)}`;
      const row = {
        slug,
        name: cat.name || cat.name_ar || slug,
        name_ar: cat.name_ar || cat.name || slug,
        icon: cat.icon || '🎯',
        color: cat.color || '#e2b714',
        sort_order: Number(cat.sort_order) || 0,
        is_active: cat.is_active !== false,
        is_custom: true,
      };
      const { data, error } = await supabase.from('categories').insert([row]).select().single();
      if (!error && data) return { ...data, questionCount: 0 };
      if (error) throw new Error(error.message);
    }
    throw new Error('فشل إضافة القسم');
  },

  async updateCategory(idOrSlug, updates) {
    try {
      const res = await fetch(`/api/admin/categories/${idOrSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        return data.category || data;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);
      let query = supabase.from('categories').update(updates);
      if (isUuid) query = query.eq('id', idOrSlug);
      else query = query.eq('slug', idOrSlug);
      const { data, error } = await query.select().single();
      if (!error && data) return data;
      if (error) throw new Error(error.message);
    }
    throw new Error('فشل تحديث القسم');
  },

  async deleteCategory(idOrSlug) {
    try {
      const res = await fetch(`/api/admin/categories/${idOrSlug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) return true;
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);
      let query = supabase.from('categories').delete();
      if (isUuid) query = query.eq('id', idOrSlug);
      else query = query.eq('slug', idOrSlug);
      const { error } = await query;
      if (!error) return true;
      if (error) throw new Error(error.message);
    }
    return true;
  },

  // 10. Theme Management
  async getTheme() {
    try {
      const res = await fetch('/api/game/theme');
      if (res.ok) {
        const data = await res.json();
        if (data.theme) return data.theme;
      }
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('game_settings').select('value').eq('key', 'theme').single();
        if (!error && data?.value) return data.value;
      } catch {}
    }
    return null;
  },

  async saveTheme(theme) {
    try {
      await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ theme })
      });
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('game_settings').upsert({
          key: 'theme',
          value: theme,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      } catch {}
    }
  }
};

export default gameApi;
