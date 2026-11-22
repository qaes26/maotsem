import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLock, FiLogOut, FiFolder, FiHelpCircle,
  FiSettings, FiUsers, FiPlus, FiEdit2, FiTrash2, FiSave,
  FiRefreshCw, FiSearch, FiChevronDown, FiChevronUp,
  FiX, FiCheck, FiAlertTriangle, FiMonitor, FiImage,
  FiMusic, FiPenTool, FiChevronLeft, FiChevronRight,
  FiArrowUp, FiArrowDown, FiEye, FiEyeOff, FiGrid,
  FiCopy, FiSliders, FiLayers, FiTag, FiHash, FiCheckCircle,
} from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import useAdminStore from '../stores/adminStore';
import useThemeStore, { THEME_PRESETS, defaultTheme, applyThemeToCSS, normalizeTheme } from '../stores/themeStore';

/* ════════════════════════════════════════════════════
   Constants & Helpers
   ════════════════════════════════════════════════════ */
const TABS = [
  { id: 'theme', label: 'المظهر والألوان', icon: FaPalette, emoji: '🎨' },
  { id: 'categories', label: 'الأقسام والفئات', icon: FiFolder, emoji: '📁' },
  { id: 'questions', label: 'الأسئلة', icon: FiHelpCircle, emoji: '❓' },
  { id: 'settings', label: 'الإعدادات', icon: FiSettings, emoji: '⚙️' },
  { id: 'monitor', label: 'المستخدمون والغرف', icon: FiUsers, emoji: '👥' },
];

const FONTS = [
  { value: 'Cairo', label: 'Cairo (افتراضي - عصري وواضح)' },
  { value: 'Tajawal', label: 'Tajawal (ناعم وأنيق)' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic (تقني ورصين)' },
  { value: 'Almarai', label: 'Almarai (عصري متوازن)' },
  { value: 'Readex Pro', label: 'Readex Pro (حديث وجريء)' },
  { value: 'Changa', label: 'Changa (حماسي ورياضي)' },
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
   TAB 1: THEME CUSTOMIZER (التحكم الكامل بألوان ومظهر الواجهة)
   ════════════════════════════════════════════════════ */
function ThemeTab() {
  const { theme, updateTheme, isLoading } = useAdminStore();
  const [local, setLocal] = useState(() => normalizeTheme(theme));
  const [activePreset, setActivePreset] = useState('royal');
  const [savedToast, setSavedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    if (theme) setLocal(normalizeTheme(theme));
  }, [theme]);

  const setColor = (key, val) => {
    const updated = { ...local, [key]: val };
    setLocal(updated);
    applyThemeToCSS(updated);
  };

  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    const updated = { ...local, ...preset.colors };
    setLocal(updated);
    applyThemeToCSS(updated);
  };

  const handleSave = async () => {
    await updateTheme(local);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleReset = async () => {
    setLocal({ ...defaultTheme });
    applyThemeToCSS(defaultTheme);
    await updateTheme(defaultTheme);
    setActivePreset('royal');
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(local, null, 2));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const colorSections = [
    {
      title: '🌌 ألوان الخلفيات والبيئة الرئيسية',
      desc: 'الطبقات الأساسية للواجهة والخلفيات المتدرجة',
      fields: [
        { key: 'primary', label: 'الخلفية الأساسية للموقع', desc: 'خلفية التطبيق العامة' },
        { key: 'primaryLight', label: 'تدرج الخلفية الفاتح', desc: 'يستخدم في إضاءات الخلفية' },
        { key: 'secondary', label: 'خلفية البطاقات والحاويات', desc: 'بطاقات الأقسام والغرف' },
        { key: 'secondaryLight', label: 'البطاقات الفاتحة', desc: 'البطاقات المرتفعة' },
      ],
    },
    {
      title: '🪟 أسطح القوائم والأزرار',
      desc: 'عناصر التفاعل والقوائم والمودالات',
      fields: [
        { key: 'surface', label: 'أسطح القوائم والنوافذ', desc: 'الحقول والقوائم المنسدلة' },
        { key: 'surfaceLight', label: 'حدود العناصر والأزرار الثانوية', desc: 'إطارات العناصر والحدود' },
        { key: 'surfaceDark', label: 'القوائم العميقة والتذييل', desc: 'الأسطح الغائرة والظلال' },
      ],
    },
    {
      title: '👑 التمييز والنصوص (الذهب والخط)',
      desc: 'الألوان الجاذبة للانتباه وهوية اللعبة',
      fields: [
        { key: 'accent', label: 'اللون الذهبي / المميز الأساسي', desc: 'أزرار اللعب، العملات، والنقاط' },
        { key: 'textColor', label: 'لون النصوص الأساسية', desc: 'عناوين الأسئلة والخيارات' },
        { key: 'textMuted', label: 'لون النصوص الفرعية', desc: 'الوصف الثانوي والتلميحات' },
      ],
    },
    {
      title: '🚥 حالات اللعبة والنتائج',
      desc: 'ألوان التفاعل مع صحة الإجابة والوقت',
      fields: [
        { key: 'success', label: 'لون الإجابة الصحيحة والفوز', desc: 'الإجابة الموفقة واحتفال الفوز' },
        { key: 'danger', label: 'لون الإجابة الخاطئة والخطر', desc: 'الخطأ وتنبيه القنبلة' },
        { key: 'warning', label: 'لون التنبيه والوقت الحرج', desc: 'آخر 5 ثواني والتنبيهات' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Save Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/80 p-5 rounded-2xl border border-surface-light backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-accent/20 text-accent text-xl">🎨</span>
            تخصيص المظهر الشامل والتحكم بالألوان
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            تحكم بكل لون وطبقة وخط بالواجهة فوراً مع حفظ وتعميم حي على قاعدة البيانات لجميع اللاعبين
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyJSON}
            className="px-4 py-2.5 rounded-xl bg-surface border border-surface-light text-gray-300 hover:text-white hover:bg-surface-light transition text-sm flex items-center gap-2"
            title="نسخ كود الألوان"
          >
            <FiCopy /> {copiedToast ? 'تم النسخ!' : 'نسخ كود JSON'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-surface border border-surface-light text-gray-400 hover:text-danger hover:bg-surface-light transition text-sm flex items-center gap-2"
          >
            <FiRefreshCw /> إعادة تعيين
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-yellow-500 text-primary font-black shadow-lg shadow-accent/25 hover:brightness-110 active:scale-95 transition flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <FiSave />}
            حفظ وتعميم المظهر
          </button>
        </div>
      </div>

      {savedToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/20 border border-success text-success px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold"
        >
          <FiCheckCircle className="text-lg" />
          تم حفظ وتطبيق المظهر بنجاح ومزامنته مع قاعدة بيانات Supabase!
        </motion.div>
      )}

      {/* 1. Curated Theme Presets Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>✨</span> ثيمات أسطورية جاهزة بنقرة واحدة
          </h3>
          <span className="text-xs text-gray-400">انقر على أي ثيم لتطبيقه ومعاينته حياً</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between h-full relative overflow-hidden group ${
                  isSelected
                    ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20 scale-[1.02]'
                    : 'border-surface-light bg-surface/60 hover:bg-surface hover:border-gray-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{preset.emoji}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-accent text-primary flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-accent transition truncate">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                    {preset.description}
                  </p>
                </div>

                {/* Color swatches preview */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-surface-light">
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.colors.primary }} />
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.colors.secondary }} />
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.colors.accent }} />
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.colors.surface }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Live Preview Arena */}
      <div className="bg-gradient-to-br from-surface to-surface-dark p-6 rounded-2xl border border-surface-light shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-accent flex items-center gap-2">
            <span>👁️</span> منطقة المعاينة الحية الفورية (Live Preview Arena)
          </h3>
          <span className="text-xs bg-surface-dark px-3 py-1 rounded-full text-gray-400 border border-surface-light">
            تتغير العناصر أدناه مباشرة مع أي تعديل بالألوان
          </span>
        </div>

        {/* Live Playground Canvas */}
        <div
          className="p-6 rounded-2xl border transition-all space-y-6"
          style={{
            background: `linear-gradient(135deg, ${local.primary} 0%, ${local.primaryLight} 50%, ${local.secondary} 100%)`,
            borderColor: local.surfaceLight,
            fontFamily: local.fontFamily,
          }}
        >
          {/* Mock Header */}
          <div
            className="flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md"
            style={{
              background: `${local.secondary}dd`,
              borderColor: local.surfaceLight,
              borderRadius: `${local.borderRadius}px`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black" style={{ color: local.accent }}>
                حخلص عليك
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: `${local.accent}20`, color: local.accent }}>
                معركة العقول ⚡
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border"
                style={{ background: local.surface, borderColor: local.surfaceLight, color: local.textColor }}
              >
                <span>🪙</span> 2,450 نقطة
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: local.accent, color: local.primary }}>
                🦁
              </div>
            </div>
          </div>

          {/* Mock Game Category & Question Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Card Mock */}
            <div
              className="p-5 rounded-2xl border transition shadow-lg"
              style={{
                background: local.surface,
                borderColor: local.surfaceLight,
                borderRadius: `${local.borderRadius}px`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">⚽</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: `${local.accent}25`, color: local.accent }}>
                  12 سؤال متاح
                </span>
              </div>
              <h4 className="text-lg font-bold mb-1" style={{ color: local.textColor }}>الدوري الإسباني (الكلاسيكو)</h4>
              <p className="text-xs leading-relaxed" style={{ color: local.textMuted }}>
                تحدي أساطير ريال مدريد وبرشلونة والأهداف التاريخية
              </p>
            </div>

            {/* Question Card Mock */}
            <div
              className="p-5 rounded-2xl border transition shadow-lg"
              style={{
                background: local.secondary,
                borderColor: local.surfaceLight,
                borderRadius: `${local.borderRadius}px`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: local.surfaceLight, color: local.accent }}>
                  سؤال 400 نقطة
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: local.warning }}>
                  ⏱️ 14 ثانية
                </span>
              </div>
              <p className="text-sm font-bold mb-3" style={{ color: local.textColor }}>
                من هو الهداف التاريخي لمباريات الكلاسيكو بين الريال والبارسا؟
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-2.5 text-xs font-bold rounded-lg text-center transition border"
                  style={{ background: local.surface, borderColor: local.surfaceLight, color: local.textColor, borderRadius: `${Math.max(6, local.borderRadius - 4)}px` }}
                >
                  كريستيانو رونالدو
                </div>
                <div
                  className="p-2.5 text-xs font-bold rounded-lg text-center transition border"
                  style={{ background: `${local.success}25`, borderColor: local.success, color: local.success, borderRadius: `${Math.max(6, local.borderRadius - 4)}px` }}
                >
                  ✓ ليونيل ميسي (صحيح)
                </div>
                <div
                  className="p-2.5 text-xs font-bold rounded-lg text-center transition border"
                  style={{ background: local.surface, borderColor: local.surfaceLight, color: local.textColor, borderRadius: `${Math.max(6, local.borderRadius - 4)}px` }}
                >
                  ألفريدو دي ستيفانو
                </div>
                <div
                  className="p-2.5 text-xs font-bold rounded-lg text-center transition border"
                  style={{ background: `${local.danger}25`, borderColor: local.danger, color: local.danger, borderRadius: `${Math.max(6, local.borderRadius - 4)}px` }}
                >
                  ✗ كريم بنزيما (خطأ)
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Mock */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <button
              className="px-5 py-2.5 font-bold text-sm shadow-md transition"
              style={{
                background: `linear-gradient(135deg, ${local.accent} 0%, #d4a010 100%)`,
                color: local.primary,
                borderRadius: `${local.borderRadius}px`,
              }}
            >
              زر ذهبي رئيسي
            </button>
            <button
              className="px-5 py-2.5 font-bold text-sm border transition"
              style={{
                background: local.surface,
                borderColor: local.surfaceLight,
                color: local.accent,
                borderRadius: `${local.borderRadius}px`,
              }}
            >
              زر إطار ثانوي
            </button>
            <span
              className="px-3.5 py-1.5 text-xs font-bold"
              style={{ background: local.success, color: '#ffffff', borderRadius: `${local.borderRadius}px` }}
            >
              فوز +500
            </span>
            <span
              className="px-3.5 py-1.5 text-xs font-bold"
              style={{ background: local.danger, color: '#ffffff', borderRadius: `${local.borderRadius}px` }}
            >
              خسارة -200
            </span>
            <span
              className="px-3.5 py-1.5 text-xs font-bold"
              style={{ background: local.warning, color: local.primary, borderRadius: `${local.borderRadius}px` }}
            >
              وقت حرج!
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Color Layer Editors */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎨</span> تحكم دقيق بكل طبقات الألوان (Color Layers)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colorSections.map((sec) => (
            <div key={sec.title} className="bg-surface/80 rounded-2xl p-5 border border-surface-light space-y-4">
              <div>
                <h4 className="font-bold text-white text-base">{sec.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{sec.desc}</p>
              </div>

              <div className="space-y-3">
                {sec.fields.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between gap-3 p-2.5 bg-surface-dark/70 rounded-xl border border-surface-light/60">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-200 truncate">{label}</p>
                      <p className="text-[11px] text-gray-500 truncate">{desc}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input
                        type="color"
                        value={local[key] || '#000000'}
                        onChange={(e) => setColor(key, e.target.value)}
                        className="w-9 h-9 rounded-lg border-2 border-surface-light cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={local[key] || ''}
                        onChange={(e) => setColor(key, e.target.value)}
                        className="w-24 bg-surface border border-surface-light rounded-lg px-2 py-1 text-white text-xs font-mono text-center uppercase"
                        dir="ltr"
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Typography, Radius & Branding */}
      <div className="bg-surface/80 rounded-2xl p-6 border border-surface-light space-y-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>✍️</span> الخطوط وهندسة الواجهة (Typography & Geometry)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Font Selector */}
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-2">نوع الخط العربي الأساسي</label>
            <select
              value={local.fontFamily || 'Cairo'}
              onChange={(e) => setColor('fontFamily', e.target.value)}
              className="w-full bg-surface-dark border border-surface-light rounded-xl px-3.5 py-2.5 text-white focus:border-accent focus:outline-none transition cursor-pointer text-sm"
              dir="rtl"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1.5" style={{ fontFamily: local.fontFamily }}>
              معاينة: «حخلص عليك - تحدي معلومات كرة القدم والمسلسلات والثقافة العامة»
            </p>
          </div>

          {/* Border Radius Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-300">درجة انحناء الحواف (Border Radius)</label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-dark text-accent border border-surface-light">
                {local.borderRadius || 14}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="28"
              step="1"
              value={local.borderRadius || 14}
              onChange={(e) => setColor('borderRadius', parseInt(e.target.value))}
              className="w-full accent-accent cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>0px (حاد عصري)</span>
              <span>14px (متوازن)</span>
              <span>28px (مستدير ناعم)</span>
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-2">رابط شعار اللعبة مخصص (Logo)</label>
            <input
              type="text"
              value={local.logoUrl || ''}
              onChange={(e) => setColor('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full bg-surface-dark border border-surface-light rounded-xl px-3.5 py-2 text-white placeholder-gray-600 focus:border-accent focus:outline-none text-xs font-mono"
              dir="ltr"
            />
            {local.logoUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={local.logoUrl}
                  alt="Logo Preview"
                  className="w-10 h-10 object-contain rounded-lg bg-surface-dark p-1 border border-surface-light"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs text-gray-400">معاينة الشعار المخصص</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 2: CATEGORIES MANAGER (إضافة وحذف وتعديل الأقسام والفئات)
   ════════════════════════════════════════════════════ */
function CategoriesTab() {
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory, isLoading } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // all | active | inactive
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    name_ar: '',
    slug: '',
    icon: '⚽',
    color: '#e2b714',
    description: '',
    sort_order: 0,
    is_active: true,
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditCategory(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    setForm({
      ...initialForm,
      sort_order: categories.length + 1,
    });
    setEditCategory(null);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setForm({
      name: cat.name || cat.name_ar,
      name_ar: cat.name_ar || cat.name,
      slug: cat.slug || cat.id,
      icon: cat.icon || '🎯',
      color: cat.color || '#e2b714',
      description: cat.description || '',
      sort_order: cat.sort_order ?? 0,
      is_active: cat.is_active !== false,
    });
    setShowModal(true);
  };

  const handleAutoSlug = () => {
    const text = form.name_ar || form.name || '';
    const clean = text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_\u0600-\u06FF]/g, '');
    setForm((p) => ({ ...p, slug: clean || `cat-${Date.now().toString(36)}` }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name_ar.trim() && !form.name.trim()) return;

    setActionLoading(true);
    const payload = {
      name: form.name || form.name_ar,
      name_ar: form.name_ar || form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now().toString(36)}`,
      icon: form.icon || '🎯',
      color: form.color || '#e2b714',
      description: form.description || '',
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active !== false,
    };

    if (editCategory) {
      await updateCategory(editCategory.id || editCategory.slug, payload);
    } else {
      await addCategory(payload);
    }

    setActionLoading(false);
    resetForm();
    await loadCategories();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    await deleteCategory(confirmDelete.id || confirmDelete.slug);
    setConfirmDelete(null);
    setActionLoading(false);
    await loadCategories();
  };

  const handleToggleActive = async (cat) => {
    const newStatus = cat.is_active === false ? true : false;
    await updateCategory(cat.id || cat.slug, { is_active: newStatus });
  };

  const moveCategory = async (index, direction) => {
    const newCats = [...categories];
    const target = index + direction;
    if (target < 0 || target >= newCats.length) return;
    [newCats[index], newCats[target]] = [newCats[target], newCats[index]];
    useAdminStore.setState({ categories: newCats });

    // Sync new sort order
    try {
      await updateCategory(newCats[index].id || newCats[index].slug, { sort_order: index });
      await updateCategory(newCats[target].id || newCats[target].slug, { sort_order: target });
    } catch {}
  };

  // Filtered list
  const filtered = categories.filter((cat) => {
    const matchesSearch =
      (cat.name_ar || cat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.slug || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterActive === 'active') return cat.is_active !== false;
    if (filterActive === 'inactive') return cat.is_active === false;
    return true;
  });

  const totalQuestions = categories.reduce((sum, c) => sum + (c.questionCount || 0), 0);
  const activeCount = categories.filter((c) => c.is_active !== false).length;

  const popularEmojis = ['⚽', '🎬', '🎮', '🧠', '📚', '💄', '🌍', '👑', '🏎️', '🎨', '🎵', '🍕', '🚀', '🕌', '⚔️', '🏆', '📱', '🧪', '🍔', '💎', '🦁', '🥊', '🏀', '🏎️'];
  const colorPresets = ['#e2b714', '#10b981', '#f43f5e', '#00f0ff', '#8b5cf6', '#f97316', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/80 p-5 rounded-2xl border border-surface-light backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-accent/20 text-accent text-xl">📁</span>
            إدارة الأقسام والفئات (Categories)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            أضف أقساماً جديدة، عدّل عليها أو احذفها مباشرة وستنعكس فوراً في قاعدة بيانات Supabase
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-yellow-500 text-primary font-black shadow-lg shadow-accent/25 hover:brightness-110 active:scale-95 transition flex items-center gap-2 text-sm"
        >
          <FiPlus className="text-lg" /> إضافة قسم جديد
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface/80 p-4 rounded-xl border border-surface-light flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold">إجمالي الأقسام</p>
            <p className="text-2xl font-black text-white mt-1">{categories.length}</p>
          </div>
          <span className="text-3xl p-3 bg-surface-dark rounded-xl">📚</span>
        </div>

        <div className="bg-surface/80 p-4 rounded-xl border border-surface-light flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold">الأقسام النشطة في اللعبة</p>
            <p className="text-2xl font-black text-success mt-1">{activeCount}</p>
          </div>
          <span className="text-3xl p-3 bg-surface-dark rounded-xl">🟢</span>
        </div>

        <div className="bg-surface/80 p-4 rounded-xl border border-surface-light flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold">إجمالي الأسئلة في الأقسام</p>
            <p className="text-2xl font-black text-accent mt-1">{totalQuestions}</p>
          </div>
          <span className="text-3xl p-3 bg-surface-dark rounded-xl">❓</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface/60 p-4 rounded-xl border border-surface-light">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم القسم أو المعرّف بالإنجليزية..."
            className="w-full bg-surface-dark border border-surface-light rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              filterActive === 'all'
                ? 'bg-accent text-primary border-accent'
                : 'bg-surface-dark text-gray-400 border-surface-light hover:text-white'
            }`}
          >
            الكل ({categories.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              filterActive === 'active'
                ? 'bg-success text-white border-success'
                : 'bg-surface-dark text-gray-400 border-surface-light hover:text-white'
            }`}
          >
            المفعلة ({activeCount})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              filterActive === 'inactive'
                ? 'bg-danger text-white border-danger'
                : 'bg-surface-dark text-gray-400 border-surface-light hover:text-white'
            }`}
          >
            المعطلة ({categories.length - activeCount})
          </button>
          <button
            onClick={loadCategories}
            className="p-2.5 rounded-xl bg-surface-dark text-gray-400 hover:text-accent border border-surface-light transition"
            title="تحديث القائمة"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-secondary border border-surface-light rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative"
              dir="rtl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-light">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-accent">{editCategory ? '✏️ تعديل القسم' : '➕ إضافة قسم جديد'}</span>
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white transition">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Arabic Name */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">اسم القسم بالعربية *</label>
                  <input
                    type="text"
                    value={form.name_ar}
                    onChange={(e) => setForm((p) => ({ ...p, name_ar: e.target.value, name: p.name || e.target.value }))}
                    placeholder="مثال: دوري أبطال أوروبا، أنمي، معلومات عامة..."
                    className="w-full bg-surface border border-surface-light rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
                    required
                  />
                </div>

                {/* English Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-300">المعرّف بالإنجليزية (Slug) *</label>
                    <button
                      type="button"
                      onClick={handleAutoSlug}
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      توليد تلقائي
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="champions-league"
                    className="w-full bg-surface border border-surface-light rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm font-mono"
                    dir="ltr"
                    required
                  />
                </div>

                {/* Emoji / Icon Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">الأيقونة أو الإيموجي</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={form.icon}
                      onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                      placeholder="⚽"
                      className="w-14 h-12 text-center text-2xl bg-surface border border-surface-light rounded-xl text-white focus:border-accent focus:outline-none"
                    />
                    <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 px-2 bg-surface-dark rounded-xl border border-surface-light">
                      {popularEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, icon: emoji }))}
                          className={`text-xl p-1.5 rounded-lg hover:bg-surface transition ${
                            form.icon === emoji ? 'bg-accent/20 scale-110' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">لون القسم المميز</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                      className="w-28 bg-surface border border-surface-light rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
                      dir="ltr"
                    />
                    <div className="flex items-center gap-1.5 flex-1 justify-end">
                      {colorPresets.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, color: c }))}
                          className={`w-6 h-6 rounded-full border border-white/20 transition ${
                            form.color === c ? 'scale-125 ring-2 ring-accent' : ''
                          }`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sort Order & Status */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1.5">ترتيب الظهور</label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-surface border border-surface-light rounded-xl px-3.5 py-2.5 text-white focus:border-accent focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1.5">حالة التفعيل</label>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition ${
                        form.is_active
                          ? 'bg-success/20 border-success text-success'
                          : 'bg-surface border-surface-light text-gray-400'
                      }`}
                    >
                      {form.is_active ? '✓ مفعل في اللعبة' : '✗ معطل (مخفي)'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-light">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl bg-surface border border-surface-light text-gray-300 hover:bg-surface-light transition text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-yellow-500 text-primary font-black shadow-lg shadow-accent/25 hover:brightness-110 active:scale-95 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                    {editCategory ? 'حفظ التعديلات' : 'إضافة القسم لقاعدة البيانات'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category List */}
      {isLoading && !categories.length ? (
        <Spinner />
      ) : (
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-16 bg-surface/30 rounded-2xl border border-surface-light">
              <span className="text-4xl block mb-2">📁</span>
              لا توجد أقسام مطابقة للبحث
            </div>
          )}

          {filtered.map((cat, idx) => {
            const isActive = cat.is_active !== false;
            return (
              <motion.div
                key={cat.id || cat.slug}
                layout
                className={`bg-surface/80 rounded-2xl border transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isActive ? 'border-surface-light hover:border-gray-500' : 'border-danger/30 opacity-70 bg-surface/40'
                }`}
              >
                {/* Left (Order + Icon + Info) */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveCategory(idx, -1)}
                      className="text-gray-500 hover:text-accent transition p-0.5"
                      title="تحريك لأعلى"
                    >
                      <FiArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveCategory(idx, 1)}
                      className="text-gray-500 hover:text-accent transition p-0.5"
                      title="تحريك لأسفل"
                    >
                      <FiArrowDown size={14} />
                    </button>
                  </div>

                  {/* Icon badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner border border-white/10"
                    style={{ background: `${cat.color || '#e2b714'}25` }}
                  >
                    {cat.icon || '📁'}
                  </div>

                  {/* Name and Slug */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white truncate">
                        {cat.name_ar || cat.name}
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-dark text-gray-400 border border-surface-light">
                        {cat.slug}
                      </span>
                      {cat.is_custom && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent font-bold">
                          قسم مخصص
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>

                {/* Right (Stats & Controls) */}
                <div className="flex items-center gap-3 justify-end flex-shrink-0">
                  {/* Questions count badge */}
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-surface-dark text-gray-300 border border-surface-light font-bold flex items-center gap-1.5">
                    <span>❓</span> {cat.questionCount ?? 0} سؤال
                  </span>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`p-2.5 rounded-xl border transition ${
                      isActive
                        ? 'bg-success/15 border-success/40 text-success hover:bg-success/25'
                        : 'bg-surface-dark border-surface-light text-gray-500 hover:text-gray-300'
                    }`}
                    title={isActive ? 'تعطيل وإخفاء من اللعبة' : 'تفعيل باللعبة'}
                  >
                    {isActive ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2.5 rounded-xl bg-surface-dark border border-surface-light text-gray-400 hover:text-accent hover:border-accent transition"
                    title="تعديل القسم"
                  >
                    <FiEdit2 size={16} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setConfirmDelete(cat)}
                    className="p-2.5 rounded-xl bg-danger/10 border border-danger/30 text-danger hover:bg-danger hover:text-white transition"
                    title="حذف القسم نهائياً من قاعدة البيانات"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!confirmDelete}
        title="تأكيد حذف القسم"
        message={`هل أنت متأكد تماماً من رغبتك بحذف قسم "${confirmDelete?.name_ar || confirmDelete?.name}" نهائياً من قاعدة بيانات Supabase؟ سيتم حذف جميع البيانات المرتبطة به.`}
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
