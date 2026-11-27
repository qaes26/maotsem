import { Router } from 'express';
import {
  getQuestions,
  getLineupMatches,
  getMafiaRoles,
  getAuctionChallenges,
  getGoalSketches,
  getCommentaryClues,
  getCharadesCards,
} from './data/questions.js';
import { generateFreshRound } from './data/questionGenerator.js';
import { getStoredCustomQuestions } from './admin.js';
import db from './db.js';

const router = Router();

// GET /api/game/theme - get global customized theme
router.get('/theme', async (req, res) => {
  try {
    const theme = await db.getSettings('theme');
    res.json({ success: true, theme });
  } catch (err) {
    res.json({ success: false, theme: null });
  }
});

// GET /api/game/categories - list of all available categories
router.get('/categories', async (req, res) => {
  // Try Supabase first
  const supaCategories = await db.getCategories();
  if (supaCategories && supaCategories.length > 0) {
    const categories = supaCategories.map(c => ({
      id: c.slug,
      name: c.name_ar || c.name,
      icon: c.icon || '🎯',
      questionCount: 0,
      subcategories: [],
    }));
    return res.json({ success: true, categories, source: 'supabase' });
  }

  // Fallback to local questions.js
  const allQ = getQuestions();
  const catMap = new Map();

  for (const q of allQ) {
    if (!catMap.has(q.category)) {
      let icon = '🎯';
      if (q.category === 'football') icon = '⚽';
      else if (q.category === 'series') icon = '🎬';
      else if (q.category === 'general') icon = '🌍';
      else if (q.category === 'girls') icon = '💄';
      else if (q.category === 'math') icon = '🔢';
      else if (q.category === 'arabic') icon = '📖';

      catMap.set(q.category, {
        id: q.category,
        name: q.categoryName || q.category,
        icon,
        questionCount: 0,
        subcategories: new Set()
      });
    }
    const cat = catMap.get(q.category);
    cat.questionCount++;
    if (q.subcategory) {
      cat.subcategories.add(q.subcategory);
    }
  }

  const categories = Array.from(catMap.values()).map(c => ({
    ...c,
    subcategories: Array.from(c.subcategories)
  }));

  res.json({ success: true, categories, source: 'local' });
});

const FALLBACK_IMG_BY_CAT = {
  football: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80',
  series: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
  general: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg/960px-The_Great_Globe%2C_Guyot_Hall%2C_Princeton_University.jpg',
  girls: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
  math: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
  arabic: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_LINEUP_IMAGE =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/London_Wembley.jpg/960px-London_Wembley.jpg';
const DEFAULT_AUCTION_IMAGE =
  'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f5/UEFA_Champions_League.svg/960px-UEFA_Champions_League.svg.png';

const normText = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

// GET /api/game/questions - get questions with optional category filter
router.get('/questions', async (req, res) => {
  const { category, subcategory, limit } = req.query;

  // Merge base questions + local custom questions + Supabase questions (deduping by id or question text & keeping images)
  const supaQuestions = await db.getAllQuestions().catch(() => null);
  const customLocal = getStoredCustomQuestions();
  const byId = new Map();
  const textToId = new Map();
  for (const q of getQuestions()) {
    byId.set(q.id, q);
    if (q.question) textToId.set(normText(q.question), q.id);
  }
  const mergeQuestion = (q) => {
    const matchedId = byId.has(q.id) ? q.id : textToId.get(normText(q.question));
    const targetId = matchedId || q.id;
    const prev = byId.get(targetId) || {};
    const fallback = FALLBACK_IMG_BY_CAT[q.category || prev.category] || FALLBACK_IMG_BY_CAT.general;
    const resolvedImg = q.mediaUrl || q.image || prev.mediaUrl || prev.image || fallback;
    byId.set(targetId, {
      ...prev,
      ...q,
      id: targetId,
      mediaType: q.mediaType || prev.mediaType || 'image',
      mediaUrl: resolvedImg,
      image: q.image || q.mediaUrl || resolvedImg,
    });
    if (q.question) textToId.set(normText(q.question), targetId);
  };
  for (const q of customLocal) mergeQuestion(q);
  if (Array.isArray(supaQuestions)) {
    for (const q of supaQuestions) mergeQuestion(q);
  }
  let list = Array.from(byId.values());

  if (category) {
    list = list.filter(q => q.category === category || q.subcategory === category);
  }
  if (subcategory) {
    list = list.filter(q => q.subcategory === subcategory);
  }
  if (limit) {
    list = list.slice(0, parseInt(limit));
  }

  res.json({ success: true, questions: list });
});

// POST /api/game/generate-round - dynamically generate non-repeating fresh 6-category round
router.post('/generate-round', (req, res) => {
  const { categories } = req.body;
  const cats = categories || ['premier-league', 'la-liga', 'champions-league', 'world-cup-2022', 'bab-al-hara', 'culture'];
  const grid = generateFreshRound(getQuestions(), cats);
  res.json({ success: true, grid });
});

// GET /api/game/lineups - get all 70+ historical matches for Lineup mode (merge Supabase + local)
router.get('/lineups', async (req, res) => {
  const supaMatches = await db.getLineupMatches().catch(() => null);
  const localMatches = getLineupMatches();
  const byId = new Map();
  const titleToId = new Map();
  for (const m of localMatches) {
    byId.set(m.id, m);
    if (m.title) titleToId.set(normText(m.title), m.id);
  }
  if (Array.isArray(supaMatches)) {
    for (const m of supaMatches) {
      const targetId = byId.has(m.id) ? m.id : (titleToId.get(normText(m.title)) || m.id);
      const prev = byId.get(targetId) || {};
      byId.set(targetId, {
        ...prev,
        ...m,
        id: targetId,
        competition: m.competition || prev.competition || 'بطولات كروية',
        image: m.image || prev.image || DEFAULT_LINEUP_IMAGE,
      });
    }
  }
  res.json({ success: true, matches: Array.from(byId.values()) });
});

// GET /api/game/mafia-roles - get roles for Mafia mode
router.get('/mafia-roles', (req, res) => {
  res.json({ success: true, roles: getMafiaRoles() });
});

// GET /api/game/auctions - get diverse auction challenges (merge Supabase + local)
router.get('/auctions', async (req, res) => {
  const supaAuctions = await db.getAuctions().catch(() => null);
  const localAuctions = getAuctionChallenges();
  const byId = new Map();
  const titleToId = new Map();
  for (const a of localAuctions) {
    byId.set(a.id, a);
    if (a.title) titleToId.set(normText(a.title), a.id);
  }
  if (Array.isArray(supaAuctions)) {
    for (const a of supaAuctions) {
      const targetId = byId.has(a.id) ? a.id : (titleToId.get(normText(a.title)) || a.id);
      const prev = byId.get(targetId) || {};
      byId.set(targetId, {
        ...prev,
        ...a,
        id: targetId,
        image: a.image || prev.image || DEFAULT_AUCTION_IMAGE,
      });
    }
  }
  res.json({ success: true, auctions: Array.from(byId.values()) });
});

// GET /api/game/sketches - get interactive goal sketches
router.get('/sketches', async (req, res) => {
  const supaSketches = await db.getSketches();
  res.json({ success: true, sketches: supaSketches || getGoalSketches() });
});

// GET /api/game/commentary - get commentary quotes and clues
router.get('/commentary', async (req, res) => {
  const supaCommentary = await db.getCommentary();
  res.json({ success: true, commentary: supaCommentary || getCommentaryClues() });
});

// GET /api/game/charades - get charades / acting cards
router.get('/charades', async (req, res) => {
  const supaCharades = await db.getCharades();
  res.json({ success: true, cards: supaCharades || getCharadesCards() });
});

// GET /api/game/leaderboard
router.get('/leaderboard', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const leaderboard = await db.getLeaderboard(limit);
  res.json({ success: true, leaderboard });
});

export default router;
