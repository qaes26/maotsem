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
import db from './db.js';

const router = Router();

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

// GET /api/game/questions - get questions with optional category filter
router.get('/questions', async (req, res) => {
  const { category, subcategory, limit } = req.query;

  // Try Supabase first
  const supaQuestions = await db.getAllQuestions();
  let list = supaQuestions || getQuestions();

  if (category) {
    list = list.filter(q => q.category === category);
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

// GET /api/game/lineups - get all historical matches for Lineup mode
router.get('/lineups', async (req, res) => {
  const supaMatches = await db.getLineupMatches();
  res.json({ success: true, matches: supaMatches || getLineupMatches() });
});

// GET /api/game/mafia-roles - get roles for Mafia mode
router.get('/mafia-roles', (req, res) => {
  res.json({ success: true, roles: getMafiaRoles() });
});

// GET /api/game/auctions - get football auction challenges
router.get('/auctions', async (req, res) => {
  const supaAuctions = await db.getAuctions();
  res.json({ success: true, auctions: supaAuctions || getAuctionChallenges() });
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
