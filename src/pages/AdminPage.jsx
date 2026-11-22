import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLock, FiLogOut, FiFolder, FiHelpCircle,
  FiSettings, FiUsers, FiPlus, FiEdit2, FiTrash2, FiSave,
  FiRefreshCw, FiSearch, FiChevronDown, FiChevronUp,
  FiX, FiCheck, FiAlertTriangle, FiMonitor, FiImage,
  FiMusic, FiPenTool, FiChevronLeft, FiChevronRight,
  FiArrowUp, FiArrowDown, FiEye, FiEyeOff, FiGrid,
} from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import useAdminStore from '../stores/adminStore';
import useThemeStore from '../stores/themeStore';

/* ════════════════════════════════════════════════════
   Constants & Helpers
   ════════════════════════════════════════════════════ */
const TABS = [
  { id: 'theme', label: 'المظهر', icon: FaPalette, emoji: '🎨' },
  { id: 'categories', label: 'الفئات', icon: FiFolder, emoji: '📁' },
  { id: 'questions', label: 'الأسئلة', icon: FiHelpCircle, emoji: '❓' },
  { id: 'settings', label: 'الإعدادات', icon: FiSettings, emoji: '⚙️' },
  { id: 'monitor', label: 'المستخدمون والغرف', icon: FiUsers, emoji: '👥' },
];

const FONTS = [
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic' },
];

const DIFFICULTY_MAP = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };
const LIFELINE_LABELS = {
  twoAnswers: 'جوابين',
  thePit: 'الحفرة',
  doublePoints: 'خاصية الدبل',
  callFriend: 'اتصال بصديق',
  swapQuestion: 'بدل السؤال',
  theBomb: 'القنبلة',
};

const tabVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

/* ════════════════════════════════════════════════════
   Reusable UI Atoms
   ════════════════════════════════════════════════════ */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  const bg = type === 'success' ? 'bg-success' : 'bg-danger';
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] ${bg} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-arabic`}
    >
      {type === 'success' ? <FiCheck /> : <FiAlertTriangle />}
      <span>{message}</span>
      <button onClick={onClose}><FiX /></button>
    </motion.div>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-secondary border border-surface-light rounded-2xl p-6 max-w-sm w-full mx-4 font-arabic"
        dir="rtl"
      >
        <h3 className="text-lg font-bold text-accent mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-surface text-gray-300 hover:bg-surface-light transition">
            إلغاء
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-danger text-white hover:bg-red-600 transition">
            تأكيد
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder, dir = 'rtl', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-400 font-arabic">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="bg-surface border border-surface-light rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition font-arabic"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-400 font-arabic">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-surface-light rounded-lg px-3 py-2 text-white focus:border-accent focus:outline-none transition font-arabic appearance-none cursor-pointer"
        dir="rtl"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer font-arabic">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-surface-light'}`} />
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'right-0.5' : 'right-[22px]'}`} />
      </div>
      {label && <span className="text-gray-300">{label}</span>}
    </label>
  );
}

/* ════════════════════════════════════════════════════
   LOGIN PAGE
   ════════════════════════════════════════════════════ */
function AdminLogin() {
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAdminStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    await login(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary font-arabic" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-secondary border border-surface-light rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-surface rounded-full mx-auto flex items-center justify-center mb-4">
            <FiLock className="text-accent text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-gray-400 mt-1">أدخل كلمة المرور للدخول</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition text-center text-lg"
            dir="ltr"
            autoFocus
          />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-sm text-center">
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-yellow-500 text-primary font-bold rounded-xl py-3 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : 'دخول'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 1: THEME CUSTOMIZER
   ════════════════════════════════════════════════════ */
function ThemeTab() {
  const { theme, updateTheme, isLoading } = useAdminStore();
  const globalTheme = useThemeStore();
  const [local, setLocal] = useState({ ...theme });

  useEffect(() => { setLocal({ ...theme }); }, [theme]);

  const setColor = (key, val) => {
    setLocal((p) => ({ ...p, [key]: val }));
    // live preview via CSS vars
    const cssMap = {
      primary: '--color-primary', primaryLight: '--color-primary-light',
      secondary: '--color-secondary', secondaryLight: '--color-secondary-light',
      accent: '--color-accent', surface: '--color-surface',
      surfaceLight: '--color-surface-light', surfaceDark: '--color-surface-dark',
      danger: '--color-danger', success: '--color-success', warning: '--color-warning',
    };
    if (cssMap[key]) document.documentElement.style.setProperty(cssMap[key], val);
  };

  const handleSave = async () => {
    await updateTheme(local);
    globalTheme.updateTheme(local, useAdminStore.getState().adminToken);
  };

  const handleReset = () => {
    const def = {
      primary: '#1a1a2e', primaryLight: '#222244', secondary: '#16213e',
      secondaryLight: '#1a2a4a', accent: '#e2b714', surface: '#0f3460',
      surfaceLight: '#1a4a7a', surfaceDark: '#0a2040', danger: '#e74c3c',
      success: '#00b894', warning: '#f39c12', fontFamily: 'Cairo',
      borderRadius: 12, logoUrl: '',
    };
    setLocal(def);
    Object.entries(def).forEach(([k, v]) => {
      const cssMap = {
        primary: '--color-primary', primaryLight: '--color-primary-light',
        secondary: '--color-secondary', secondaryLight: '--color-secondary-light',
        accent: '--color-accent', surface: '--color-surface',
        surfaceLight: '--color-surface-light', surfaceDark: '--color-surface-dark',
        danger: '--color-danger', success: '--color-success', warning: '--color-warning',
      };
      if (cssMap[k]) document.documentElement.style.setProperty(cssMap[k], v);
    });
  };

  const colorFields = [
    { key: 'primary', label: 'الأساسي' }, { key: 'secondary', label: 'الثانوي' },
    { key: 'accent', label: 'التمييز' }, { key: 'surface', label: 'السطح' },
    { key: 'danger', label: 'الخطر' }, { key: 'success', label: 'النجاح' },
    { key: 'warning', label: 'التحذير' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">🎨 تخصيص المظهر</h2>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {colorFields.map(({ key, label }) => (
          <div key={key} className="bg-surface rounded-xl p-4 border border-surface-light">
            <label className="text-sm text-gray-400 block mb-2">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={local[key] || '#000000'}
                onChange={(e) => setColor(key, e.target.value)}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={local[key] || ''}
                onChange={(e) => setColor(key, e.target.value)}
                className="flex-1 bg-surface-dark border border-surface-light rounded-lg px-2 py-1 text-white text-sm font-mono"
                dir="ltr"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Font & Radius */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl p-4 border border-surface-light">
          <SelectField
            label="الخط"
            value={local.fontFamily || 'Cairo'}
            onChange={(v) => setLocal((p) => ({ ...p, fontFamily: v }))}
            options={FONTS}
          />
        </div>
        <div className="bg-surface rounded-xl p-4 border border-surface-light">
          <label className="text-sm text-gray-400 block mb-2">حواف مستديرة: {local.borderRadius || 12}px</label>
          <input
            type="range" min="0" max="24" step="1"
            value={local.borderRadius || 12}
            onChange={(e) => setLocal((p) => ({ ...p, borderRadius: parseInt(e.target.value) }))}
            className="w-full accent-accent"
          />
        </div>
      </div>

      {/* Logo */}
      <div className="bg-surface rounded-xl p-4 border border-surface-light">
        <InputField
          label="رابط الشعار"
          value={local.logoUrl || ''}
          onChange={(v) => setLocal((p) => ({ ...p, logoUrl: v }))}
          placeholder="https://example.com/logo.png"
          dir="ltr"
        />
        {local.logoUrl && (
          <div className="mt-3 flex items-center gap-3">
            <img src={local.logoUrl} alt="Logo Preview" className="w-16 h-16 object-contain rounded-lg bg-surface-dark p-1" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-sm text-gray-400">معاينة الشعار</span>
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-sm text-gray-400 mb-4">معاينة مباشرة</h3>
        <div className="space-y-3" style={{ borderRadius: `${local.borderRadius}px` }}>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 text-sm font-bold text-primary" style={{ background: local.accent, borderRadius: `${local.borderRadius}px` }}>
              زر أساسي
            </button>
            <button className="px-4 py-2 text-sm text-white" style={{ background: local.surface, border: `1px solid ${local.surfaceLight}`, borderRadius: `${local.borderRadius}px` }}>
              زر ثانوي
            </button>
            <span className="px-3 py-1 text-sm text-white" style={{ background: local.success, borderRadius: `${local.borderRadius}px` }}>نجاح</span>
            <span className="px-3 py-1 text-sm text-white" style={{ background: local.danger, borderRadius: `${local.borderRadius}px` }}>خطأ</span>
            <span className="px-3 py-1 text-sm text-white" style={{ background: local.warning, borderRadius: `${local.borderRadius}px` }}>تحذير</span>
          </div>
          <div className="p-3 text-sm text-gray-300" style={{ background: local.secondary, border: `1px solid ${local.surfaceLight}`, borderRadius: `${local.borderRadius}px`, fontFamily: local.fontFamily }}>
            هذا نص تجريبي لمعاينة الخط والألوان في الواجهة
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button onClick={handleReset} className="px-5 py-2.5 rounded-xl bg-surface border border-surface-light text-gray-300 hover:bg-surface-light transition flex items-center gap-2">
          <FiRefreshCw className="text-sm" /> إعادة تعيين
        </button>
        <button onClick={handleSave} disabled={isLoading} className="px-5 py-2.5 rounded-xl bg-accent text-primary font-bold hover:bg-yellow-500 transition flex items-center gap-2 disabled:opacity-50">
          <FiSave className="text-sm" /> حفظ
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 2: CATEGORIES MANAGER
   ════════════════════════════════════════════════════ */
function CategoriesTab() {
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory, isLoading } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '', description: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadCategories(); }, []);

  const resetForm = () => { setForm({ name: '', icon: '', description: '' }); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await updateCategory(editId, form);
    } else {
      await addCategory(form);
    }
    resetForm();
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon || '', description: cat.description || '' });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteCategory(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const moveCategory = (index, direction) => {
    const newCats = [...categories];
    const target = index + direction;
    if (target < 0 || target >= newCats.length) return;
    [newCats[index], newCats[target]] = [newCats[target], newCats[index]];
    // Optimistic reorder in UI — backend may support order field
    useAdminStore.setState({ categories: newCats });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">📁 إدارة الفئات</h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 rounded-xl bg-accent text-primary font-bold hover:bg-yellow-500 transition flex items-center gap-2"
        >
          <FiPlus /> إضافة فئة
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface rounded-xl p-5 border border-surface-light space-y-4">
              <h3 className="text-accent font-bold">{editId ? 'تعديل الفئة' : 'فئة جديدة'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="اسم الفئة" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="مثال: كرة القدم" />
                <InputField label="أيقونة / إيموجي" value={form.icon} onChange={(v) => setForm((p) => ({ ...p, icon: v }))} placeholder="⚽" />
                <InputField label="الوصف" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="وصف مختصر" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={resetForm} className="px-4 py-2 rounded-lg bg-surface-light text-gray-300 hover:bg-surface transition">إلغاء</button>
                <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 rounded-lg bg-accent text-primary font-bold hover:bg-yellow-500 transition disabled:opacity-50">
                  {editId ? 'حفظ التعديلات' : 'إضافة'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category List */}
      {isLoading && !categories.length ? <Spinner /> : (
        <div className="space-y-2">
          {categories.length === 0 && (
            <div className="text-center text-gray-500 py-12">لا توجد فئات بعد</div>
          )}
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              layout
              className="bg-surface rounded-xl border border-surface-light overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4">
                {/* Drag / Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveCategory(idx, -1)} className="text-gray-500 hover:text-accent transition p-0.5"><FiArrowUp size={14} /></button>
                  <button onClick={() => moveCategory(idx, 1)} className="text-gray-500 hover:text-accent transition p-0.5"><FiArrowDown size={14} /></button>
                </div>
                {/* Icon */}
                <span className="text-2xl">{cat.icon || '📁'}</span>
                {/* Name & Count */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{cat.name}</p>
                  {cat.description && <p className="text-sm text-gray-400 truncate">{cat.description}</p>}
                </div>
                {/* Question Count */}
                <span className="text-xs bg-surface-dark text-gray-400 px-2 py-1 rounded-lg">
                  {cat.questionCount ?? cat.questions?.length ?? '—'} سؤال
                </span>
                {/* Toggle show/hide */}
                <button
                  onClick={() => updateCategory(cat.id, { visible: !cat.visible })}
                  className={`p-2 rounded-lg transition ${cat.visible !== false ? 'text-accent' : 'text-gray-600'}`}
                  title={cat.visible !== false ? 'إخفاء' : 'إظهار'}
                >
                  {cat.visible !== false ? <FiEye /> : <FiEyeOff />}
                </button>
                {/* Expand subcategories */}
                <button onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)} className="text-gray-400 hover:text-white transition p-2">
                  {expandedId === cat.id ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {/* Edit */}
                <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-accent transition p-2"><FiEdit2 /></button>
                {/* Delete */}
                <button onClick={() => setConfirmDelete(cat.id)} className="text-gray-400 hover:text-danger transition p-2"><FiTrash2 /></button>
              </div>

              {/* Subcategories */}
              <AnimatePresence>
                {expandedId === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-surface-light"
                  >
                    <div className="p-4 pr-12 space-y-2">
                      <p className="text-sm text-gray-500 mb-2">الفئات الفرعية:</p>
                      {cat.subcategories.map((sub) => (
                        <div key={sub.id || sub.name} className="flex items-center gap-3 bg-surface-dark rounded-lg p-3">
                          <span className="text-lg">{sub.icon || '📌'}</span>
                          <span className="text-gray-300 flex-1">{sub.name}</span>
                          <span className="text-xs text-gray-500">{sub.questionCount ?? '—'} سؤال</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="حذف الفئة"
        message="هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 3: QUESTIONS MANAGER
   ════════════════════════════════════════════════════ */
function QuestionsTab() {
  const {
    questions, categories, loadQuestions, loadCategories,
    addQuestion, updateQuestion, deleteQuestion, isLoading, questionsMeta,
  } = useAdminStore();
  const [filters, setFilters] = useState({ category: '', subcategory: '', difficulty: '', points: '', search: '', page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const emptyQ = {
    category: '', subcategory: '', question: '', options: ['', '', '', ''],
    correctAnswer: 0, points: 200, difficulty: 'easy', mediaType: null, mediaUrl: '', explanation: '',
  };
  const [form, setForm] = useState({ ...emptyQ });

  useEffect(() => {
    loadCategories();
    loadQuestions(filters);
  }, []);

  const applyFilters = (newFilters) => {
    const f = { ...filters, ...newFilters, page: 1 };
    setFilters(f);
    loadQuestions(f);
  };

  const changePage = (p) => {
    const f = { ...filters, page: p };
    setFilters(f);
    loadQuestions(f);
  };

  const resetForm = () => { setForm({ ...emptyQ }); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.question.trim() || !form.category) return;
    const payload = { ...form };
    if (editId) {
      await updateQuestion(editId, payload);
    } else {
      await addQuestion(payload);
    }
    resetForm();
    loadQuestions(filters);
  };

  const startEdit = (q) => {
    setForm({
      category: q.category || '', subcategory: q.subcategory || '',
      question: q.question, options: q.options ? [...q.options] : ['', '', '', ''],
      correctAnswer: q.correctAnswer ?? 0, points: q.points || 200,
      difficulty: q.difficulty || 'easy', mediaType: q.mediaType || null,
      mediaUrl: q.mediaUrl || '', explanation: q.explanation || '',
    });
    setEditId(q.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteQuestion(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const selectedCat = categories.find((c) => c.id === form.category || c.name === form.category);
  const subcategories = selectedCat?.subcategories || [];

  const filterCatOptions = categories.map((c) => ({ value: c.id || c.name, label: c.name }));
  const filterSubOptions = (() => {
    const fc = categories.find((c) => (c.id || c.name) === filters.category);
    return (fc?.subcategories || []).map((s) => ({ value: s.id || s.name, label: s.name }));
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">❓ إدارة الأسئلة</h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 rounded-xl bg-accent text-primary font-bold hover:bg-yellow-500 transition flex items-center gap-2"
        >
          <FiPlus /> إضافة سؤال
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-xl p-4 border border-surface-light">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SelectField placeholder="كل الفئات" value={filters.category} onChange={(v) => applyFilters({ category: v, subcategory: '' })} options={filterCatOptions} />
          <SelectField placeholder="الفئة الفرعية" value={filters.subcategory} onChange={(v) => applyFilters({ subcategory: v })} options={filterSubOptions} />
          <SelectField
            placeholder="الصعوبة"
            value={filters.difficulty}
            onChange={(v) => applyFilters({ difficulty: v })}
            options={[{ value: 'easy', label: 'سهل' }, { value: 'medium', label: 'متوسط' }, { value: 'hard', label: 'صعب' }]}
          />
          <SelectField
            placeholder="النقاط"
            value={filters.points}
            onChange={(v) => applyFilters({ points: v })}
            options={[{ value: '200', label: '200' }, { value: '400', label: '400' }, { value: '600', label: '600' }]}
          />
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 relative">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => applyFilters({ search: e.target.value })}
              placeholder="بحث..."
              className="w-full bg-surface-dark border border-surface-light rounded-lg pr-10 pl-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition font-arabic"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface rounded-xl p-5 border border-accent/30 space-y-4">
              <h3 className="text-accent font-bold text-lg">{editId ? 'تعديل السؤال' : 'سؤال جديد'}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SelectField
                  label="الفئة"
                  value={form.category}
                  onChange={(v) => setForm((p) => ({ ...p, category: v, subcategory: '' }))}
                  options={categories.map((c) => ({ value: c.id || c.name, label: c.name }))}
                  placeholder="اختر الفئة"
                />
                <SelectField
                  label="الفئة الفرعية"
                  value={form.subcategory}
                  onChange={(v) => setForm((p) => ({ ...p, subcategory: v }))}
                  options={subcategories.map((s) => ({ value: s.id || s.name, label: s.name }))}
                  placeholder="اختر الفئة الفرعية"
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="النقاط"
                    value={String(form.points)}
                    onChange={(v) => setForm((p) => ({ ...p, points: parseInt(v) }))}
                    options={[{ value: '200', label: '200' }, { value: '400', label: '400' }, { value: '600', label: '600' }]}
                  />
                  <SelectField
                    label="الصعوبة"
                    value={form.difficulty}
                    onChange={(v) => setForm((p) => ({ ...p, difficulty: v }))}
                    options={[{ value: 'easy', label: 'سهل' }, { value: 'medium', label: 'متوسط' }, { value: 'hard', label: 'صعب' }]}
                  />
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">نص السؤال</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="اكتب السؤال هنا..."
                  rows={3}
                  dir="rtl"
                  className="w-full bg-surface-dark border border-surface-light rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition font-arabic resize-none"
                />
              </div>

              {/* Answer Options */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">خيارات الإجابة (اختر الصحيحة)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={form.correctAnswer === i}
                        onChange={() => setForm((p) => ({ ...p, correctAnswer: i }))}
                        className="w-4 h-4 accent-accent"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...form.options];
                          newOpts[i] = e.target.value;
                          setForm((p) => ({ ...p, options: newOpts }));
                        }}
                        placeholder={`الخيار ${i + 1}`}
                        dir="rtl"
                        className={`flex-1 bg-surface-dark border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none transition font-arabic ${
                          form.correctAnswer === i ? 'border-success' : 'border-surface-light focus:border-accent'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Media */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">نوع الوسائط</label>
                  <div className="flex gap-2">
                    {[
                      { val: null, label: 'بدون', icon: <FiX /> },
                      { val: 'image', label: 'صورة', icon: <FiImage /> },
                      { val: 'audio', label: 'صوت', icon: <FiMusic /> },
                      { val: 'sketch', label: 'رسم', icon: <FiPenTool /> },
                    ].map(({ val, label, icon }) => (
                      <button
                        key={label}
                        onClick={() => setForm((p) => ({ ...p, mediaType: val, mediaUrl: val ? p.mediaUrl : '' }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                          form.mediaType === val ? 'bg-accent text-primary font-bold' : 'bg-surface-dark text-gray-400 hover:bg-surface-light'
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
                {form.mediaType && (
                  <InputField
                    label="رابط الوسائط"
                    value={form.mediaUrl}
                    onChange={(v) => setForm((p) => ({ ...p, mediaUrl: v }))}
                    placeholder="https://..."
                    dir="ltr"
                  />
                )}
              </div>

              {/* Explanation */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">التفسير (يظهر بعد الإجابة)</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
                  placeholder="شرح الإجابة الصحيحة..."
                  rows={2}
                  dir="rtl"
                  className="w-full bg-surface-dark border border-surface-light rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition font-arabic resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button onClick={resetForm} className="px-4 py-2 rounded-lg bg-surface-light text-gray-300 hover:bg-surface transition">إلغاء</button>
                <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 rounded-lg bg-accent text-primary font-bold hover:bg-yellow-500 transition disabled:opacity-50">
                  {editId ? 'حفظ التعديلات' : 'إضافة السؤال'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions Table */}
      {isLoading && !questions.length ? <Spinner /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-light text-gray-400">
                  <th className="text-right py-3 px-3">السؤال</th>
                  <th className="text-right py-3 px-3 hidden sm:table-cell">الفئة</th>
                  <th className="text-center py-3 px-3">النقاط</th>
                  <th className="text-center py-3 px-3 hidden md:table-cell">الصعوبة</th>
                  <th className="text-center py-3 px-3 hidden lg:table-cell">وسائط</th>
                  <th className="text-center py-3 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-gray-500 py-12">لا توجد أسئلة</td></tr>
                )}
                {questions.map((q) => (
                  <tr key={q.id} className="border-b border-surface-light/30 hover:bg-surface/30 transition">
                    <td className="py-3 px-3 text-white max-w-[260px] truncate">{q.question}</td>
                    <td className="py-3 px-3 text-gray-400 hidden sm:table-cell">{q.category}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-md text-xs font-bold">{q.points}</span>
                    </td>
                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded-md text-xs ${
                        q.difficulty === 'easy' ? 'bg-success/20 text-success' :
                        q.difficulty === 'medium' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
                      }`}>
                        {DIFFICULTY_MAP[q.difficulty] || q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      {q.mediaType ? (
                        <span className="text-xs bg-surface-light text-gray-300 px-2 py-0.5 rounded-md">
                          {q.mediaType === 'image' ? '🖼️' : q.mediaType === 'audio' ? '🔊' : '✏️'}
                        </span>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => startEdit(q)} className="p-1.5 text-gray-400 hover:text-accent transition"><FiEdit2 size={15} /></button>
                        <button onClick={() => setConfirmDelete(q.id)} className="p-1.5 text-gray-400 hover:text-danger transition"><FiTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {questionsMeta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => changePage(Math.max(1, questionsMeta.page - 1))}
                disabled={questionsMeta.page <= 1}
                className="p-2 rounded-lg bg-surface text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <FiChevronRight />
              </button>
              <span className="text-gray-400 text-sm">
                صفحة {questionsMeta.page} من {questionsMeta.totalPages}
              </span>
              <button
                onClick={() => changePage(Math.min(questionsMeta.totalPages, questionsMeta.page + 1))}
                disabled={questionsMeta.page >= questionsMeta.totalPages}
                className="p-2 rounded-lg bg-surface text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <FiChevronLeft />
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="حذف السؤال"
        message="هل أنت متأكد من حذف هذا السؤال؟"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 4: GAME SETTINGS
   ════════════════════════════════════════════════════ */
function SettingsTab() {
  const { settings, loadSettings, updateSettings, isLoading } = useAdminStore();
  const [local, setLocal] = useState({ ...settings });

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { setLocal({ ...settings }); }, [settings]);

  const toggleLifeline = (key) => {
    setLocal((p) => ({
      ...p,
      lifelines: { ...p.lifelines, [key]: !p.lifelines[key] },
    }));
  };

  const handleSave = () => updateSettings(local);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">⚙️ إعدادات اللعبة</h2>

      {/* Lifelines */}
      <div className="bg-surface rounded-xl p-5 border border-surface-light space-y-4">
        <h3 className="text-accent font-bold text-lg">🃏 وسائل المساعدة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(LIFELINE_LABELS).map(([key, label]) => (
            <div key={key} className="bg-surface-dark rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-300">{label}</span>
              <ToggleSwitch checked={local.lifelines?.[key] ?? true} onChange={() => toggleLifeline(key)} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-sm text-gray-400 block mb-2">الحد الأقصى لكل لعبة</label>
            <input
              type="number" min="1" max="6"
              value={local.maxLifelinesPerGame ?? 3}
              onChange={(e) => setLocal((p) => ({ ...p, maxLifelinesPerGame: parseInt(e.target.value) || 3 }))}
              className="w-full bg-surface-dark border border-surface-light rounded-lg px-3 py-2 text-white focus:border-accent focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">نسبة مكافأة القنبلة: {local.bombBonusChance ?? 50}%</label>
            <input
              type="range" min="0" max="100" step="5"
              value={local.bombBonusChance ?? 50}
              onChange={(e) => setLocal((p) => ({ ...p, bombBonusChance: parseInt(e.target.value) }))}
              className="w-full accent-accent"
            />
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-surface rounded-xl p-5 border border-surface-light space-y-4">
        <h3 className="text-accent font-bold text-lg">⏱️ المؤقت</h3>
        <div>
          <label className="text-sm text-gray-400 block mb-2">وقت الإجابة: {local.questionTimer ?? 30} ثانية</label>
          <input
            type="range" min="10" max="120" step="5"
            value={local.questionTimer ?? 30}
            onChange={(e) => setLocal((p) => ({ ...p, questionTimer: parseInt(e.target.value) }))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 ث</span><span>120 ث</span>
          </div>
        </div>
      </div>

      {/* Point Values */}
      <div className="bg-surface rounded-xl p-5 border border-surface-light space-y-4">
        <h3 className="text-accent font-bold text-lg">🏆 قيم النقاط</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'easy', label: 'سهل', default: 200 },
            { key: 'medium', label: 'متوسط', default: 400 },
            { key: 'hard', label: 'صعب', default: 600 },
          ].map(({ key, label, default: def }) => (
            <div key={key}>
              <label className="text-sm text-gray-400 block mb-1">{label}</label>
              <input
                type="number" min="0" step="50"
                value={local.pointValues?.[key] ?? def}
                onChange={(e) => setLocal((p) => ({
                  ...p,
                  pointValues: { ...p.pointValues, [key]: parseInt(e.target.value) || def },
                }))}
                className="w-full bg-surface-dark border border-surface-light rounded-lg px-3 py-2 text-white focus:border-accent focus:outline-none transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-accent text-primary font-bold hover:bg-yellow-500 transition flex items-center gap-2 disabled:opacity-50">
          <FiSave /> حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 5: USERS & ROOMS MONITOR
   ════════════════════════════════════════════════════ */
function MonitorTab() {
  const {
    users, rooms, loadUsers, loadRooms, banUser, unbanUser,
    closeRoom, resetLeaderboard, isLoading,
  } = useAdminStore();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0=none, 1=first confirm, 2=second confirm
  const intervalRef = useRef(null);

  const refreshAll = useCallback(() => {
    loadUsers();
    loadRooms();
  }, []);

  useEffect(() => { refreshAll(); }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(refreshAll, 10000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, refreshAll]);

  const handleResetLeaderboard = async () => {
    if (resetStep < 2) {
      setResetStep(resetStep + 1);
      return;
    }
    await resetLeaderboard();
    setResetStep(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">👥 المستخدمون والغرف</h2>
        <div className="flex items-center gap-4">
          <ToggleSwitch checked={autoRefresh} onChange={setAutoRefresh} label="تحديث تلقائي" />
          <button onClick={refreshAll} className="p-2 rounded-lg bg-surface text-gray-400 hover:text-accent transition">
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Active Rooms */}
      <div className="bg-surface rounded-xl border border-surface-light overflow-hidden">
        <div className="p-4 border-b border-surface-light">
          <h3 className="text-accent font-bold flex items-center gap-2"><FiGrid /> الغرف النشطة ({rooms.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-light text-gray-400">
                <th className="text-right py-3 px-4">الكود</th>
                <th className="text-right py-3 px-4">المضيف</th>
                <th className="text-center py-3 px-4">اللاعبون</th>
                <th className="text-center py-3 px-4 hidden sm:table-cell">الوضع</th>
                <th className="text-center py-3 px-4 hidden md:table-cell">الحالة</th>
                <th className="text-center py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">لا توجد غرف نشطة</td></tr>
              )}
              {rooms.map((r) => (
                <tr key={r.code} className="border-b border-surface-light/30 hover:bg-surface/30 transition">
                  <td className="py-3 px-4 text-accent font-mono font-bold">{r.code}</td>
                  <td className="py-3 px-4 text-white">{r.host?.nickname || r.hostName || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{r.players?.length ?? r.playerCount ?? 0}</td>
                  <td className="py-3 px-4 text-center text-gray-400 hidden sm:table-cell">{r.mode === 'team' ? 'فرق' : 'فردي'}</td>
                  <td className="py-3 px-4 text-center hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-md text-xs ${
                      r.status === 'playing' ? 'bg-success/20 text-success' :
                      r.status === 'waiting' ? 'bg-warning/20 text-warning' : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {r.status === 'playing' ? 'جارية' : r.status === 'waiting' ? 'انتظار' : r.status || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => closeRoom(r.code)} className="px-3 py-1 rounded-lg bg-danger/20 text-danger hover:bg-danger/40 text-xs transition">
                      إغلاق
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users */}
      <div className="bg-surface rounded-xl border border-surface-light overflow-hidden">
        <div className="p-4 border-b border-surface-light">
          <h3 className="text-accent font-bold flex items-center gap-2"><FiUsers /> المستخدمون المسجلون ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-light text-gray-400">
                <th className="text-right py-3 px-4">الهاتف</th>
                <th className="text-right py-3 px-4">اللقب</th>
                <th className="text-center py-3 px-4 hidden sm:table-cell">الصورة</th>
                <th className="text-center py-3 px-4">النقاط</th>
                <th className="text-center py-3 px-4 hidden md:table-cell">الألعاب</th>
                <th className="text-center py-3 px-4">الحالة</th>
                <th className="text-center py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">لا يوجد مستخدمون مسجلون</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-light/30 hover:bg-surface/30 transition">
                  <td className="py-3 px-4 text-gray-300 font-mono text-xs" dir="ltr">{u.phone}</td>
                  <td className="py-3 px-4 text-white">{u.nickname || '—'}</td>
                  <td className="py-3 px-4 text-center hidden sm:table-cell">
                    {u.avatar ? (
                      <span className="text-2xl">{u.avatar}</span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center text-accent font-bold">{u.points ?? 0}</td>
                  <td className="py-3 px-4 text-center text-gray-400 hidden md:table-cell">{u.gamesPlayed ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-xs ${u.banned ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                      {u.banned ? 'محظور' : 'نشط'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.banned ? (
                      <button onClick={() => unbanUser(u.id)} className="px-3 py-1 rounded-lg bg-success/20 text-success hover:bg-success/40 text-xs transition">
                        إلغاء الحظر
                      </button>
                    ) : (
                      <button onClick={() => banUser(u.id)} className="px-3 py-1 rounded-lg bg-danger/20 text-danger hover:bg-danger/40 text-xs transition">
                        حظر
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard Reset */}
      <div className="bg-surface rounded-xl p-5 border border-danger/30 space-y-3">
        <h3 className="text-danger font-bold flex items-center gap-2">
          <FiAlertTriangle /> إعادة تعيين لوحة المتصدرين
        </h3>
        <p className="text-gray-400 text-sm">سيؤدي هذا إلى حذف جميع نقاط اللاعبين وإعادة تعيين الترتيب. لا يمكن التراجع عن هذا الإجراء.</p>
        <button
          onClick={handleResetLeaderboard}
          className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            resetStep === 0
              ? 'bg-danger/20 text-danger hover:bg-danger/40'
              : resetStep === 1
                ? 'bg-danger/60 text-white hover:bg-danger'
                : 'bg-danger text-white animate-pulse'
          }`}
        >
          <FiAlertTriangle />
          {resetStep === 0 ? 'إعادة تعيين لوحة المتصدرين' : resetStep === 1 ? 'هل أنت متأكد؟ اضغط مرة أخرى' : 'تأكيد نهائي - لا رجعة!'}
        </button>
        {resetStep > 0 && (
          <button onClick={() => setResetStep(0)} className="text-sm text-gray-500 hover:text-gray-300 transition mr-3">
            إلغاء
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN DASHBOARD LAYOUT
   ════════════════════════════════════════════════════ */
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('theme');
  const { logout, error, successMsg, clearMessages } = useAdminStore();

  // Auto-dismiss toast
  useEffect(() => {
    if (error || successMsg) {
      const t = setTimeout(clearMessages, 4000);
      return () => clearTimeout(t);
    }
  }, [error, successMsg]);

  const renderTab = () => {
    switch (activeTab) {
      case 'theme': return <ThemeTab />;
      case 'categories': return <CategoriesTab />;
      case 'questions': return <QuestionsTab />;
      case 'settings': return <SettingsTab />;
      case 'monitor': return <MonitorTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary font-arabic" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {(error || successMsg) && (
          <Toast
            message={error || successMsg}
            type={error ? 'error' : 'success'}
            onClose={clearMessages}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-secondary border-l border-surface-light shrink-0">
          <div className="p-5 border-b border-surface-light">
            <h1 className="text-xl font-bold text-accent">لوحة التحكم</h1>
            <p className="text-sm text-gray-500 mt-1">حخلص عليك</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    activeTab === tab.id
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'text-gray-400 hover:bg-surface hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.emoji} {tab.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-surface-light">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-danger/15 hover:text-danger transition text-sm"
            >
              <FiLogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top bar (mobile) */}
          <header className="lg:hidden flex items-center justify-between bg-secondary border-b border-surface-light px-4 py-3">
            <h1 className="text-lg font-bold text-accent">لوحة التحكم</h1>
            <button onClick={logout} className="text-gray-400 hover:text-danger transition">
              <FiLogOut size={20} />
            </button>
          </header>

          {/* Tab Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto pb-24 lg:pb-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Tabs (mobile) */}
          <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-secondary border-t border-surface-light flex z-40">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition ${
                    activeTab === tab.id ? 'text-accent' : 'text-gray-500'
                  }`}
                >
                  <Icon size={18} />
                  <span className="truncate max-w-[60px]">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   EXPORTED PAGE
   ════════════════════════════════════════════════════ */
export default function AdminPage() {
  const { isAdmin } = useAdminStore();
  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
}
