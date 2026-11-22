import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const router = Router();

// Async-compatible wrappers for backward compat with rooms & admin
const users = {
  get: async (phone) => await db.getUserByPhone(phone),
  set: async (phone, user) => await db.saveUser(user),
  values: async () => await db.getAllUsers(),
  entries: async () => {
    const all = await db.getAllUsers();
    return all.map((u) => [u.phone, u]);
  },
};

const tokenStore = {
  get: (token) => db.getPhoneByToken(token),
  set: (token, phone) => db.setToken(token, phone),
  delete: (token) => db.removeToken(token),
};

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
  }

  // Demo / local test OTP code: 1234
  const otp = '1234';
  db.setOtp(phone, otp);

  console.log(`[Auth / DB] OTP generated for ${phone}: ${otp}`);
  res.json({
    success: true,
    message: 'تم توليد وحفظ رمز التحقق في قاعدة البيانات',
    demoCode: otp,
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const phone = req.body.phone;
  const otp = req.body.otp || req.body.code;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'رقم الهاتف ورمز التحقق مطلوبان' });
  }

  const isValid = db.verifyOtp(phone, otp);
  if (!isValid && otp !== '1234') {
    return res.status(401).json({ success: false, message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' });
  }

  // Find or create user in persistent DB (async!)
  let user = await db.getUserByPhone(phone);
  if (!user) {
    user = {
      id: uuidv4(),
      phone,
      nickname: `لاعب_${phone.slice(-4)}`,
      avatar: '🦁',
      points: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      banned: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await db.saveUser(user);
  } else {
    user.lastLoginAt = new Date().toISOString();
    await db.saveUser(user);
  }

  if (user.banned) {
    return res.status(403).json({ success: false, message: 'تم حظر هذا الحساب' });
  }

  const token = uuidv4();
  db.setToken(token, phone);

  res.json({
    success: true,
    message: 'تم التحقق وتسجيل الدخول بنجاح',
    user: { ...user },
    token,
  });
});

// POST /api/auth/sync-firebase  (also handles Supabase sync)
router.post('/sync-firebase', async (req, res) => {
  const { phone, uid, nickname, avatar } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
  }

  let user = await db.getUserByPhone(phone);
  if (!user) {
    user = {
      id: uid || uuidv4(),
      firebaseUid: uid,
      phone,
      nickname: nickname || `لاعب_${phone.slice(-4)}`,
      avatar: avatar || '🦁',
      points: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      banned: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  } else {
    if (uid) user.firebaseUid = uid;
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    user.lastLoginAt = new Date().toISOString();
  }

  await db.saveUser(user);

  const token = uuidv4();
  db.setToken(token, phone);

  console.log(`🔥 [Auth / DB] Synced user: ${phone} (${user.nickname})`);

  res.json({
    success: true,
    message: 'تمت مزامنة المستخدم بنجاح مع قاعدة البيانات',
    user: { ...user },
    token,
  });
});

// GET /api/auth/profile/:userId
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const foundUser = await db.getUserById(userId);

  if (!foundUser) {
    return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  }

  res.json({ success: true, user: { ...foundUser } });
});

// PUT /api/auth/profile/:userId
router.put('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { nickname, avatar, points, gamesPlayed, gamesWon } = req.body;

  const foundUser = await db.getUserById(userId);
  if (!foundUser) {
    return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  }

  if (nickname !== undefined) foundUser.nickname = nickname;
  if (avatar !== undefined) foundUser.avatar = avatar;
  if (points !== undefined) foundUser.points = points;
  if (gamesPlayed !== undefined) foundUser.gamesPlayed = gamesPlayed;
  if (gamesWon !== undefined) foundUser.gamesWon = gamesWon;

  await db.saveUser(foundUser);

  res.json({ success: true, user: { ...foundUser }, message: 'تم حفظ وتحديث البيانات في قاعدة البيانات' });
});

export { users, tokenStore };
export default router;
