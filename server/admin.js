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
const ADMIN_PASSWORD = 'mm432199';
const adminTokens = new Set();

// Custom categories and questions added via admin
const customCategories = new Map();
const customQuestions = new Map();

// --- Helpers ---
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  } catch {
    const defaults = {
      theme: { primaryColor: '#1a1a2e', secondaryColor: '#16213e', accentColor: '#e2b714', successColor: '#00b894', dangerColor: '#e74c3c', warningColor: '#f39c12', surfaceColor: '#0f3460', textColor: '#ffffff', borderRadius: '12', fontFamily: 'Cairo' },
      lifelines: { enabled: ['two-answers','pit','double','call-friend','swap','bomb'], maxPerGame: 3, bombBonusChance: 0.5 },
      game: { questionTimer: 30, pointValues: [200,400,600] },
    };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  }
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

// --- Middleware ---
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  if (!token || !adminTokens.has(token)) {
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
router.get('/theme', requireAdmin, (req, res) => {
  const settings = loadSettings();
  res.json({ success: true, theme: settings.theme });
});

router.put('/theme', requireAdmin, (req, res) => {
  const settings = loadSettings();
  settings.theme = { ...settings.theme, ...req.body };
  saveSettings(settings);
  res.json({ success: true, theme: settings.theme, message: 'تم تحديث السمة' });
});

// --- Categories ---
router.get('/categories', requireAdmin, (req, res) => {
  // Built-in categories from questions data
  const allQ = getQuestions();
  const catMap = new Map();
  for (const q of allQ) {
    if (!catMap.has(q.category)) {
      catMap.set(q.category, { id: q.category, name: q.categoryName || q.category, subcategories: new Set(), questionCount: 0 });
    }
    const cat = catMap.get(q.category);
    if (q.subcategory) cat.subcategories.add(q.subcategory);
    cat.questionCount++;
  }

  const categories = Array.from(catMap.values()).map(c => ({
    ...c,
    subcategories: Array.from(c.subcategories),
    isCustom: false,
  }));

  // Add custom categories
  for (const [id, cat] of customCategories) {
    categories.push({ ...cat, id, isCustom: true });
  }

  res.json({ success: true, categories });
});

router.post('/categories', requireAdmin, (req, res) => {
  const { name, nameAr, subcategories } = req.body;
  const id = uuidv4();
  customCategories.set(id, { name, nameAr: nameAr || name, subcategories: subcategories || [], questionCount: 0 });
  res.json({ success: true, id, message: 'تم إضافة الفئة' });
});

router.put('/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const cat = customCategories.get(id);
  if (!cat) return res.status(404).json({ success: false, message: 'الفئة غير موجودة' });
  Object.assign(cat, req.body);
  customCategories.set(id, cat);
  res.json({ success: true, category: cat, message: 'تم تحديث الفئة' });
});

router.delete('/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!customCategories.has(id)) return res.status(404).json({ success: false, message: 'الفئة غير موجودة' });
  customCategories.delete(id);
  res.json({ success: true, message: 'تم حذف الفئة' });
});

// --- Questions ---
router.get('/questions', requireAdmin, (req, res) => {
  const { category, subcategory, points, difficulty, page, limit } = req.query;
  let questions = [...getQuestions(), ...customQuestions.values()];

  if (category) questions = questions.filter(q => q.category === category);
  if (subcategory) questions = questions.filter(q => q.subcategory === subcategory);
  if (points) questions = questions.filter(q => q.points === Number(points));
  if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 50;
  const start = (pageNum - 1) * limitNum;
  const paginated = questions.slice(start, start + limitNum);

  res.json({ success: true, questions: paginated, total: questions.length, page: pageNum, totalPages: Math.ceil(questions.length / limitNum) });
});

router.post('/questions', requireAdmin, (req, res) => {
  const q = { ...req.body, id: uuidv4(), isCustom: true };
  customQuestions.set(q.id, q);
  res.json({ success: true, question: q, message: 'تم إضافة السؤال' });
});

router.put('/questions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const q = customQuestions.get(id);
  if (!q) return res.status(404).json({ success: false, message: 'السؤال غير موجود (لا يمكن تعديل الأسئلة المدمجة)' });
  Object.assign(q, req.body);
  customQuestions.set(id, q);
  res.json({ success: true, question: q, message: 'تم تحديث السؤال' });
});

router.delete('/questions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!customQuestions.has(id)) return res.status(404).json({ success: false, message: 'السؤال غير موجود' });
  customQuestions.delete(id);
  res.json({ success: true, message: 'تم حذف السؤال' });
});

// --- Lifeline Settings ---
router.get('/settings/lifelines', requireAdmin, (req, res) => {
  const settings = loadSettings();
  res.json({ success: true, lifelines: settings.lifelines });
});

router.put('/settings/lifelines', requireAdmin, (req, res) => {
  const settings = loadSettings();
  settings.lifelines = { ...settings.lifelines, ...req.body };
  saveSettings(settings);
  res.json({ success: true, lifelines: settings.lifelines, message: 'تم تحديث إعدادات وسائل المساعدة' });
});

// --- Game Settings ---
router.get('/settings/game', requireAdmin, (req, res) => {
  const settings = loadSettings();
  res.json({ success: true, game: settings.game });
});

router.put('/settings/game', requireAdmin, (req, res) => {
  const settings = loadSettings();
  settings.game = { ...settings.game, ...req.body };
  saveSettings(settings);
  res.json({ success: true, game: settings.game, message: 'تم تحديث إعدادات اللعبة' });
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

// --- Users Monitor (async) ---
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const allUsers = await users.values();
    const userList = allUsers.map(u => ({ ...u }));
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
        user.banned = !user.banned;
        await users.set(phone, user);
        found = true;
        res.json({ success: true, user: { ...user }, message: user.banned ? 'تم حظر المستخدم' : 'تم إلغاء حظر المستخدم' });
        break;
      }
    }
    if (!found) res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  } catch (err) {
    console.error('[Admin] Error banning user:', err);
    res.status(500).json({ success: false, message: 'خطأ داخلي' });
  }
});

export default router;
