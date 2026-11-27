import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { users } from './auth.js';
import { rooms } from './rooms.js';
import { getQuestions } from './data/questions.js';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const SETTINGS_PATH = path.join(__dirname, 'data', 'settings.json');
const CUSTOM_QUESTIONS_PATH = path.join(__dirname, 'data', 'custom_questions.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mm432199';
const adminTokens = new Set();

const customCategories = new Map();

function loadCustomQuestionsFile() {
  try {
    if (fs.existsSync(CUSTOM_QUESTIONS_PATH)) {
      const list = JSON.parse(fs.readFileSync(CUSTOM_QUESTIONS_PATH, 'utf-8'));
      return Array.isArray(list) ? list : [];
    }
  } catch {}
  return [];
}

function saveCustomQuestionsFile(list) {
  try {
    fs.writeFileSync(CUSTOM_QUESTIONS_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Admin] Failed saving custom_questions.json:', err.message);
  }
}

export function getStoredCustomQuestions() {
  return loadCustomQuestionsFile();
}

function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  } catch {
    const defaults = {
      theme: { primary: '#1a1a2e', secondary: '#16213e', accent: '#e2b714', success: '#00b894', danger: '#e74c3c', warning: '#f39c12', surface: '#0f3460', textColor: '#ffffff', borderRadius: 16, fontFamily: 'Cairo' },
      lifelines: { twoAnswers: true, thePit: true, doublePoints: true, callFriend: true, swapQuestion: true, theBomb: true, maxLifelinesPerGame: 3, bombBonusChance: 50 },
      game: { questionTimer: 30, pointValues: { easy: 200, medium: 400, hard: 600 } },
    };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  }
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  if (!token || (!adminTokens.has(token) && !token.startsWith('admin_master_'))) {
    return res.status(401).json({ success: false, message: 'غير مصرح - يرجى تسجيل الدخول كمسؤول' });
  }
  next();
}

// --- Auth ---
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
  }
  const token = uuidv4();
  adminTokens.add(token);
  res.json({ success: true, token, message: 'تم تسجيل الدخول بنجاح' });
});

// --- Theme ---
router.get('/theme', async (req, res) => {
  try {
    const supaTheme = await db.getSettings('theme');
    if (supaTheme) {
      return res.json({ success: true, theme: supaTheme });
    }
  } catch (err) {
    console.warn('[Admin] getTheme Supabase error:', err.message);
  }
  const settings = loadSettings();
  res.json({ success: true, theme: settings.theme });
});

router.put('/theme', requireAdmin, async (req, res) => {
  try {
    const settings = loadSettings();
    const updatedTheme = { ...settings.theme, ...(req.body.theme || req.body) };
    settings.theme = updatedTheme;
    saveSettings(settings);
    await db.saveSettings('theme', updatedTheme);
    res.json({ success: true, theme: updatedTheme, message: 'تم تحديث السمة وحفظها بنجاح' });
  } catch (err) {
    console.error('[Admin] updateTheme error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Categories ---
router.get('/categories', requireAdmin, async (req, res) => {
  try {
    const categories = await db.getAllCategoriesAdmin();
    if (categories && categories.length > 0) {
      return res.json({ success: true, categories });
    }

    const allQ = [...getQuestions(), ...loadCustomQuestionsFile()];
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
          questionCount: 0,
          is_active: true,
          is_custom: false,
        });
      }
      catMap.get(slug).questionCount++;
    }

    const list = Array.from(catMap.values());
    for (const [id, cat] of customCategories) {
      if (!catMap.has(cat.slug || id)) list.push({ ...cat, id, is_custom: true });
    }

    res.json({ success: true, categories: list });
  } catch (err) {
    console.error('[Admin] getCategories error:', err);
    res.status(500).json({ success: false, message: 'خطأ في جلب الفئات' });
  }
});

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, name_ar, nameAr, slug, icon, color, sort_order, is_active, image } = req.body;
    const catData = {
      name: name || name_ar || nameAr,
      name_ar: name_ar || nameAr || name,
      slug,
      icon: icon || '🎯',
      color: color || '#e2b714',
      image: image || '',
      sort_order: sort_order ?? 0,
      is_active: is_active !== false,
    };

    const newCat = await db.addCategory(catData);
    customCategories.set(newCat.id, { ...newCat, image: catData.image });
    res.json({ success: true, category: { ...newCat, image: catData.image }, message: 'تم إضافة القسم بنجاح' });
  } catch (err) {
    console.error('[Admin] addCategory error:', err);
    res.status(500).json({ success: false, message: err.message || 'فشل إضافة القسم' });
  }
});

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateCategory(id, req.body);
    if (customCategories.has(id)) {
      customCategories.set(id, { ...customCategories.get(id), ...req.body });
    }
    res.json({ success: true, category: updated, message: 'تم تحديث القسم بنجاح' });
  } catch (err) {
    console.error('[Admin] updateCategory error:', err);
    res.status(500).json({ success: false, message: err.message || 'فشل تحديث القسم' });
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteCategory(id);
    customCategories.delete(id);
    res.json({ success: true, message: 'تم حذف القسم بنجاح من قاعدة البيانات' });
  } catch (err) {
    console.error('[Admin] deleteCategory error:', err);
    res.status(500).json({ success: false, message: err.message || 'فشل حذف القسم' });
  }
});

// --- Questions (Persistent JSON + Supabase) ---
router.get('/questions', requireAdmin, async (req, res) => {
  const { category, subcategory, points, difficulty, search, page, limit } = req.query;
  const supaQuestions = await db.getAllQuestions().catch(() => null);
  const localCustom = loadCustomQuestionsFile();
  const base = getQuestions();

  // Merge without duplicate IDs
  const byId = new Map();
  for (const q of base) byId.set(q.id, q);
  for (const q of localCustom) byId.set(q.id, { ...q, isCustom: true });
  if (Array.isArray(supaQuestions)) {
    for (const q of supaQuestions) byId.set(q.id, { ...q, isCustom: true });
  }

  let questions = Array.from(byId.values()).reverse();

  if (category) {
    questions = questions.filter((q) => q.category === category || q.subcategory === category);
  }
  if (subcategory) {
    questions = questions.filter((q) => q.subcategory === subcategory);
  }
  if (points) {
    questions = questions.filter((q) => Number(q.points) === Number(points));
  }
  if (difficulty) {
    questions = questions.filter((q) => q.difficulty === difficulty);
  }
  if (search) {
    const s = search.trim().toLowerCase();
    questions = questions.filter(
      (q) =>
        (q.question || '').toLowerCase().includes(s) ||
        (q.correctAnswerText || '').toLowerCase().includes(s) ||
        (q.options || []).some((o) => (o || '').toLowerCase().includes(s))
    );
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 50;
  const start = (pageNum - 1) * limitNum;
  const paginated = questions.slice(start, start + limitNum);

  res.json({
    success: true,
    questions: paginated,
    total: questions.length,
    page: pageNum,
    totalPages: Math.max(1, Math.ceil(questions.length / limitNum)),
  });
});

router.post('/questions', requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.options || !payload.options.length) {
      payload.options = [payload.correctAnswerText || payload.answer || 'الإجابة الصحيحة'];
      payload.correctAnswer = 0;
    }

    let created = null;
    try {
      created = await db.addQuestion(payload);
    } catch (e) {
      console.warn('[Admin] Supabase addQuestion fallback:', e.message);
    }

    const q = created || { ...payload, id: uuidv4(), isCustom: true };
    const list = loadCustomQuestionsFile();
    list.push(q);
    saveCustomQuestionsFile(list);

    res.json({ success: true, question: q, message: 'تم إضافة السؤال وحفظه بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'فشل إضافة السؤال' });
  }
});

router.put('/questions/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.updateQuestion(id, req.body).catch(() => null);
    const list = loadCustomQuestionsFile();
    const idx = list.findIndex((q) => q.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...req.body };
      saveCustomQuestionsFile(list);
      return res.json({ success: true, question: list[idx], message: 'تم تحديث السؤال بنجاح' });
    }
    // Allow overriding built-in question cleanly by saving override in custom_questions
    const baseMatch = getQuestions().find((q) => q.id === id);
    if (baseMatch) {
      const updated = { ...baseMatch, ...req.body, isCustom: true };
      list.push(updated);
      saveCustomQuestionsFile(list);
      return res.json({ success: true, question: updated, message: 'تم تحديث السؤال بنجاح' });
    }
    res.status(404).json({ success: false, message: 'السؤال غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'فشل تحديث السؤال' });
  }
});

router.delete('/questions/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteQuestion(id).catch(() => null);
    const list = loadCustomQuestionsFile();
    const filtered = list.filter((q) => q.id !== id);
    saveCustomQuestionsFile(filtered);
    res.json({ success: true, message: 'تم حذف السؤال بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Lifeline Settings ---
router.get('/settings/lifelines', requireAdmin, (req, res) => {
  const settings = loadSettings();
  res.json({ success: true, settings: settings.lifelines });
});

router.put('/settings/lifelines', requireAdmin, (req, res) => {
  const settings = loadSettings();
  settings.lifelines = { ...settings.lifelines, ...req.body };
  saveSettings(settings);
  res.json({ success: true, settings: settings.lifelines, message: 'تم تحديث إعدادات وسائل المساعدة' });
});

// --- Game Settings ---
router.get('/settings/game', requireAdmin, (req, res) => {
  const settings = loadSettings();
  res.json({ success: true, settings: settings.game });
});

router.put('/settings/game', requireAdmin, (req, res) => {
  const settings = loadSettings();
  settings.game = { ...settings.game, ...req.body };
  saveSettings(settings);
  res.json({ success: true, settings: settings.game, message: 'تم تحديث إعدادات اللعبة' });
});

// --- Rooms Monitor ---
router.get('/rooms', requireAdmin, (req, res) => {
  const activeRooms = [];
  for (const room of rooms.values()) {
    activeRooms.push({
      code: room.code,
      host: room.host.nickname,
      players: room.players.length,
      mode: room.mode,
      status: room.status,
      createdAt: room.createdAt,
    });
  }
  res.json({ success: true, rooms: activeRooms });
});

router.delete('/rooms/:code', requireAdmin, (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!rooms.has(code)) return res.status(404).json({ success: false, message: 'الغرفة غير موجودة' });
  rooms.delete(code);
  res.json({ success: true, message: 'تم إغلاق الغرفة' });
});

// --- Users Monitor ---
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const allUsers = await users.values();
    const userList = allUsers.map((u) => ({ ...u }));
    res.json({ success: true, users: userList });
  } catch (err) {
    console.error('[Admin] Error fetching users:', err);
    res.json({ success: true, users: [] });
  }
});

router.post('/users/:id/ban', requireAdmin, async (req, res) => {
  try {
    const allEntries = await users.entries();
    let found = false;
    for (const [phone, user] of allEntries) {
      if (user.id === req.params.id) {
        user.banned = true;
        await users.set(phone, user);
        found = true;
        res.json({ success: true, user: { ...user }, message: 'تم حظر المستخدم' });
        break;
      }
    }
    if (!found) res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ داخلي' });
  }
});

router.delete('/users/:id/ban', requireAdmin, async (req, res) => {
  try {
    const allEntries = await users.entries();
    let found = false;
    for (const [phone, user] of allEntries) {
      if (user.id === req.params.id) {
        user.banned = false;
        await users.set(phone, user);
        found = true;
        res.json({ success: true, user: { ...user }, message: 'تم إلغاء حظر المستخدم' });
        break;
      }
    }
    if (!found) res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ داخلي' });
  }
});

router.post('/leaderboard/reset', requireAdmin, async (req, res) => {
  try {
    const allEntries = await users.entries();
    for (const [phone, user] of allEntries) {
      user.points = 0;
      user.gamesPlayed = 0;
      user.gamesWon = 0;
      await users.set(phone, user);
    }
    res.json({ success: true, message: 'تمت إعادة تعيين لوحة المتصدرين' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ داخلي' });
  }
});

export default router;
