import { create } from 'zustand';

const API_BASE = '/api/admin';

const getStoredToken = () => localStorage.getItem('adminToken') || null;

const useAdminStore = create((set, get) => ({
  // Auth state
  isAdmin: !!getStoredToken(),
  adminToken: getStoredToken(),

  // Data state
  categories: [],
  questions: [],
  users: [],
  rooms: [],
  theme: {
    primary: '#1a1a2e',
    primaryLight: '#222244',
    secondary: '#16213e',
    secondaryLight: '#1a2a4a',
    accent: '#e2b714',
    surface: '#0f3460',
    surfaceLight: '#1a4a7a',
    surfaceDark: '#0a2040',
    danger: '#e74c3c',
    success: '#00b894',
    warning: '#f39c12',
    fontFamily: 'Cairo',
    borderRadius: 12,
    logoUrl: '',
  },
  settings: {
    lifelines: {
      twoAnswers: true,
      thePit: true,
      doublePoints: true,
      callFriend: true,
      swapQuestion: true,
      theBomb: true,
    },
    maxLifelinesPerGame: 3,
    bombBonusChance: 50,
    questionTimer: 30,
    pointValues: { easy: 200, medium: 400, hard: 600 },
  },

  // UI state
  isLoading: false,
  error: null,
  successMsg: null,
  questionsMeta: { page: 1, totalPages: 1, total: 0 },

  // Helpers
  _headers: () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${get().adminToken}`,
  }),

  _setLoading: (v) => set({ isLoading: v }),
  _setError: (msg) => set({ error: msg, successMsg: null }),
  _setSuccess: (msg) => set({ successMsg: msg, error: null }),
  clearMessages: () => set({ error: null, successMsg: null }),

  // ── Auth ──────────────────────────────────────────
  login: async (password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
      localStorage.setItem('adminToken', data.token);
      set({ isAdmin: true, adminToken: data.token, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'فشل تسجيل الدخول' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    set({ isAdmin: false, adminToken: null });
  },

  // ── Categories ────────────────────────────────────
  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: get()._headers() });
      if (!res.ok) throw new Error('فشل تحميل الفئات');
      const data = await res.json();
      set({ categories: data.categories || data || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: get()._headers(),
        body: JSON.stringify(category),
      });
      if (!res.ok) throw new Error('فشل إضافة الفئة');
      const data = await res.json();
      set((s) => ({
        categories: [...s.categories, data.category || data],
        isLoading: false,
        successMsg: 'تمت إضافة الفئة بنجاح',
        error: null,
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  updateCategory: async (id, updates) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: get()._headers(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('فشل تحديث الفئة');
      const data = await res.json();
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...data.category, ...updates } : c)),
        isLoading: false,
        successMsg: 'تم تحديث الفئة بنجاح',
        error: null,
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: get()._headers(),
      });
      if (!res.ok) throw new Error('فشل حذف الفئة');
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
        isLoading: false,
        successMsg: 'تم حذف الفئة بنجاح',
        error: null,
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  // ── Questions ─────────────────────────────────────
  loadQuestions: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.subcategory) params.set('subcategory', filters.subcategory);
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (filters.points) params.set('points', filters.points);
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', filters.page);
      const qs = params.toString();
      const res = await fetch(`${API_BASE}/questions${qs ? '?' + qs : ''}`, {
        headers: get()._headers(),
      });
      if (!res.ok) throw new Error('فشل تحميل الأسئلة');
      const data = await res.json();
      set({
        questions: data.questions || data || [],
        questionsMeta: {
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || (data.questions || data || []).length,
        },
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  addQuestion: async (question) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: get()._headers(),
        body: JSON.stringify(question),
      });
      if (!res.ok) throw new Error('فشل إضافة السؤال');
      const data = await res.json();
      set((s) => ({
        questions: [...s.questions, data.question || data],
        isLoading: false,
        successMsg: 'تمت إضافة السؤال بنجاح',
        error: null,
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  updateQuestion: async (id, updates) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'PUT',
        headers: get()._headers(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('فشل تحديث السؤال');
      set((s) => ({
        questions: s.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        isLoading: false,
        successMsg: 'تم تحديث السؤال بنجاح',
        error: null,
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  deleteQuestion: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE',
        headers: get()._headers(),
      });
      if (!res.ok) throw new Error('فشل حذف السؤال');
      set((s) => ({
        questions: s.questions.filter((q) => q.id !== id),
        isLoading: false,
        successMsg: 'تم حذف السؤال بنجاح',
        error: null,
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  // ── Theme ─────────────────────────────────────────
  loadTheme: async () => {
    try {
      const res = await fetch(`${API_BASE}/theme`, { headers: get()._headers() });
      if (res.ok) {
        const data = await res.json();
        if (data.theme) set({ theme: { ...get().theme, ...data.theme } });
      }
    } catch {
      // use defaults
    }
  },

  updateTheme: async (themeUpdates) => {
    set({ isLoading: true });
    const merged = { ...get().theme, ...themeUpdates };
    try {
      const res = await fetch(`${API_BASE}/theme`, {
        method: 'PUT',
        headers: get()._headers(),
        body: JSON.stringify({ theme: merged }),
      });
      if (!res.ok) throw new Error('فشل حفظ المظهر');
      set({ theme: merged, isLoading: false, successMsg: 'تم حفظ المظهر بنجاح', error: null });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  // ── Settings ──────────────────────────────────────
  loadSettings: async () => {
    try {
      const [lifelinesRes, gameRes] = await Promise.all([
        fetch(`${API_BASE}/settings/lifelines`, { headers: get()._headers() }),
        fetch(`${API_BASE}/settings/game`, { headers: get()._headers() }),
      ]);
      const merged = { ...get().settings };
      if (lifelinesRes.ok) {
        const ld = await lifelinesRes.json();
        Object.assign(merged, ld.settings || ld);
      }
      if (gameRes.ok) {
        const gd = await gameRes.json();
        Object.assign(merged, gd.settings || gd);
      }
      set({ settings: merged });
    } catch {
      // use defaults
    }
  },

  updateSettings: async (settingsUpdates) => {
    set({ isLoading: true });
    const merged = { ...get().settings, ...settingsUpdates };
    try {
      await Promise.all([
        fetch(`${API_BASE}/settings/lifelines`, {
          method: 'PUT',
          headers: get()._headers(),
          body: JSON.stringify({
            lifelines: merged.lifelines,
            maxLifelinesPerGame: merged.maxLifelinesPerGame,
            bombBonusChance: merged.bombBonusChance,
          }),
        }),
        fetch(`${API_BASE}/settings/game`, {
          method: 'PUT',
          headers: get()._headers(),
          body: JSON.stringify({
            questionTimer: merged.questionTimer,
            pointValues: merged.pointValues,
          }),
        }),
      ]);
      set({ settings: merged, isLoading: false, successMsg: 'تم حفظ الإعدادات بنجاح', error: null });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'فشل حفظ الإعدادات' });
      return false;
    }
  },

  // ── Users ─────────────────────────────────────────
  loadUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: get()._headers() });
      if (!res.ok) throw new Error('فشل تحميل المستخدمين');
      const data = await res.json();
      set({ users: data.users || data || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  banUser: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/ban`, {
        method: 'POST',
        headers: get()._headers(),
      });
      if (!res.ok) throw new Error('فشل حظر المستخدم');
      set((s) => ({
        users: s.users.map((u) => (u.id === id ? { ...u, banned: true } : u)),
        successMsg: 'تم حظر المستخدم',
        error: null,
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  unbanUser: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/ban`, {
        method: 'DELETE',
        headers: get()._headers(),
      });
      if (!res.ok) throw new Error('فشل إلغاء حظر المستخدم');
      set((s) => ({
        users: s.users.map((u) => (u.id === id ? { ...u, banned: false } : u)),
        successMsg: 'تم إلغاء حظر المستخدم',
        error: null,
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ── Rooms ─────────────────────────────────────────
  loadRooms: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/rooms`, { headers: get()._headers() });
      if (!res.ok) throw new Error('فشل تحميل الغرف');
      const data = await res.json();
      set({ rooms: data.rooms || data || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  closeRoom: async (code) => {
    try {
      const res = await fetch(`${API_BASE}/rooms/${code}`, {
        method: 'DELETE',
        headers: get()._headers(),
      });
      if (!res.ok) throw new Error('فشل إغلاق الغرفة');
      set((s) => ({
        rooms: s.rooms.filter((r) => r.code !== code),
        successMsg: 'تم إغلاق الغرفة',
        error: null,
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ── Leaderboard ───────────────────────────────────
  resetLeaderboard: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/leaderboard/reset`, {
        method: 'POST',
        headers: get()._headers(),
      });
      if (!res.ok) throw new Error('فشل إعادة تعيين لوحة المتصدرين');
      set({ isLoading: false, successMsg: 'تمت إعادة تعيين لوحة المتصدرين', error: null });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },
}));

export default useAdminStore;
