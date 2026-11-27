import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLock, FiLogOut, FiFolder, FiHelpCircle,
  FiSettings, FiUsers, FiPlus, FiEdit2, FiTrash2, FiSave,
  FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight,
  FiArrowUp, FiArrowDown, FiEye, FiEyeOff, FiGrid,
  FiCopy, FiCheckCircle, FiX, FiCheck, FiAlertTriangle,
  FiImage, FiMusic, FiCode, FiLayout, FiExternalLink,
} from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import useAdminStore from '../stores/adminStore';
import {
  THEME_PRESETS,
  DESIGN_EFFECT_BLOCKS,
  defaultTheme,
  applyThemeToCSS,
  normalizeTheme,
} from '../stores/themeStore';
import { ALL_AVAILABLE_CATEGORIES, FALLBACK_CATEGORY_IMAGE } from './GameSetupPage';

/* ════════════════════════════════════════════════════
   Constants & Helpers
   ════════════════════════════════════════════════════ */
const TABS = [
  { id: 'theme', label: 'أستوديو التصميم والبناء', icon: FaPalette, emoji: '🎨' },
  { id: 'categories', label: 'الأقسام والفئات', icon: FiFolder, emoji: '📁' },
  { id: 'questions', label: 'بنك الأسئلة', icon: FiHelpCircle, emoji: '❓' },
  { id: 'settings', label: 'إعدادات اللعب', icon: FiSettings, emoji: '⚙️' },
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

const GAME_MODE_CONTROLS = [
  { id: 'six-categories', defaultTitle: 'لوحة الـ 6 فئات', icon: '🧠' },
  { id: 'auction', defaultTitle: 'المزاد الكبير', icon: '🔨' },
  { id: 'sketch', defaultTitle: 'أهداف سكتش وصوت المعلق', icon: '✍️' },
  { id: 'lineup', defaultTitle: 'تحدي "تشكيلة"', icon: '⚽' },
  { id: 'charades', defaultTitle: 'تمثيل شخصيات ولاعبين', icon: '🎭' },
  { id: 'mafia', defaultTitle: 'لعبة مافيا الجماعية', icon: '🕵️' },
  { id: 'ai-mode', defaultTitle: 'التحدي ضد الذكاء الاصطناعي', icon: '🤖' },
  { id: 'multiplayer-rooms', defaultTitle: 'الغرف الجماعية (أونلاين)', icon: '🌐' },
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
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
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
        <p className="text-gray-300 mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-surface text-gray-300 hover:bg-surface-light transition text-sm">
            إلغاء
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-danger text-white hover:bg-red-600 transition text-sm font-bold">
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
      {label && <label className="text-xs font-bold text-gray-300 font-arabic">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="bg-surface border border-surface-light rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition font-arabic text-sm"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-bold text-gray-300 font-arabic">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-surface-light rounded-lg px-3 py-2 text-white focus:border-accent focus:outline-none transition font-arabic cursor-pointer text-sm"
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
      {label && <span className="text-gray-300 text-sm">{label}</span>}
    </label>
  );
}

/* ════════════════════════════════════════════════════
   LOGIN PAGE (Private Secret Entry)
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
    <div className="min-h-screen flex items-center justify-center bg-primary font-arabic px-4" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-secondary border border-surface-light rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-surface rounded-2xl mx-auto flex items-center justify-center mb-4 border border-accent/30 shadow-lg">
            <FiLock className="text-accent text-3xl" />
          </div>
          <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 mb-2">
            🔒 منطقة خاصة بالإدارة فقط
          </span>
          <h1 className="text-2xl font-black text-white">أستوديو التحكم والبناء</h1>
          <p className="text-gray-400 mt-1 text-xs">أدخل كلمة المرور للوصول إلى أدوات التصميم والمحتوى</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition text-center text-lg"
            dir="ltr"
            autoFocus
          />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-xs font-bold text-center">
              ⚠️ {error}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:brightness-110 text-primary font-black rounded-xl py-3.5 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : 'دخول إلى أستوديو الإدارة'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 1: NO-CODE VISUAL BUILDER & DESIGN STUDIO
   ════════════════════════════════════════════════════ */
function ThemeTab() {
  const { theme, updateTheme, isLoading } = useAdminStore();
  const [local, setLocal] = useState(() => normalizeTheme(theme));
  const [subTab, setSubTab] = useState('colors'); // 'colors' | 'builder' | 'blocks'
  const [activePreset, setActivePreset] = useState('royal');
  const [savedToast, setSavedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    if (theme) setLocal(normalizeTheme(theme));
  }, [theme]);

  const updateField = (key, val) => {
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

  const toggleEffectBlock = (blockId) => {
    const current = local.enabledEffects || [];
    const next = current.includes(blockId)
      ? current.filter((x) => x !== blockId)
      : [...current, blockId];
    updateField('enabledEffects', next);
  };

  const toggleModeVisibility = (modeId) => {
    const current = local.hiddenModes || [];
    const next = current.includes(modeId)
      ? current.filter((x) => x !== modeId)
      : [...current, modeId];
    updateField('hiddenModes', next);
  };

  const updateModeTitle = (modeId, title) => {
    const next = { ...(local.customModeTitles || {}), [modeId]: title };
    updateField('customModeTitles', next);
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
      fields: [
        { key: 'primary', label: 'الخلفية الأساسية للموقع' },
        { key: 'primaryLight', label: 'تدرج الخلفية الفاتح' },
        { key: 'secondary', label: 'خلفية البطاقات والحاويات' },
        { key: 'secondaryLight', label: 'البطاقات الفاتحة' },
      ],
    },
    {
      title: '🪟 أسطح القوائم والأزرار',
      fields: [
        { key: 'surface', label: 'أسطح القوائم والنوافذ' },
        { key: 'surfaceLight', label: 'حدود العناصر والأزرار' },
        { key: 'surfaceDark', label: 'القوائم العميقة والتذييل' },
      ],
    },
    {
      title: '👑 التمييز والنصوص (الهوية)',
      fields: [
        { key: 'accent', label: 'اللون المميز الرئيسي (الذهبي)' },
        { key: 'textColor', label: 'لون النصوص الأساسية' },
        { key: 'textMuted', label: 'لون النصوص الفرعية' },
      ],
    },
    {
      title: '🚥 حالات اللعبة والنتائج',
      fields: [
        { key: 'success', label: 'لون الإجابة الصحيحة والفوز' },
        { key: 'danger', label: 'لون الإجابة الخاطئة والخطر' },
        { key: 'warning', label: 'لون التنبيه والوقت الحرج' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/80 p-5 rounded-2xl border border-surface-light backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-accent/20 text-accent text-lg">🎨</span>
            أستوديو بناء وتصميم الموقع (No-Code Builder)
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            تحكم كامل بالتصميم، الألوان، النصوص، شكل البطاقات، إخفاء/إظهار الألعاب، وحتى إضافة تأثيرات برمجية بضغطة زر
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyJSON}
            className="px-3.5 py-2.5 rounded-xl bg-surface border border-surface-light text-gray-300 hover:text-white transition text-xs font-bold flex items-center gap-1.5"
          >
            <FiCopy /> {copiedToast ? 'تم النسخ!' : 'تصدير JSON'}
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-surface border border-surface-light text-gray-400 hover:text-danger transition text-xs font-bold flex items-center gap-1.5"
          >
            <FiRefreshCw /> الافتراضي
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-yellow-500 text-primary font-black shadow-lg hover:brightness-110 active:scale-95 transition flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
          >
            <FiSave /> حفظ ونشر التعديلات
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="bg-success/20 border border-success text-success px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
          <FiCheckCircle className="text-lg" />
          تم حفظ التصميم وتطبيقه فوراً على جميع واجهات الموقع!
        </div>
      )}

      {/* Sub-Tabs inside Studio */}
      <div className="flex bg-surface/60 p-1.5 rounded-2xl border border-surface-light gap-1.5 overflow-x-auto">
        {[
          { id: 'colors', label: '🎨 الألوان والثيمات الجاهزة', icon: FaPalette },
          { id: 'builder', label: '🏗️ بناء الواجهة والنصوص والأقسام', icon: FiLayout },
          { id: 'blocks', label: '⚡ بلوكات التصميم والكود المبسط', icon: FiCode },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center justify-center gap-2 ${
              subTab === st.id
                ? 'bg-accent text-primary shadow-md'
                : 'text-gray-300 hover:bg-surface-light/40'
            }`}
          >
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Live Preview Banner (Always visible so changes are seen immediately) */}
      <div
        className="p-5 rounded-2xl border transition-all space-y-4 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${local.primary} 0%, ${local.primaryLight} 50%, ${local.secondary} 100%)`,
          borderColor: local.surfaceLight,
          fontFamily: local.fontFamily,
          borderRadius: `${local.borderRadius}px`,
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-300 pb-2 border-b border-white/10">
          <span className="font-bold text-accent">👁️ معاينة حية مباشرة لشكل الموقع:</span>
          <span className="opacity-70">الخط: {local.fontFamily} | الاستدارة: {local.borderRadius}px | البطاقات: {local.cardStyle}</span>
        </div>

        <div
          className="flex items-center justify-between p-3.5 border backdrop-blur-md"
          style={{
            background: `${local.secondary}dd`,
            borderColor: local.surfaceLight,
            borderRadius: `${local.borderRadius}px`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center font-black overflow-hidden"
              style={{ background: local.accent, color: local.primary, borderRadius: `${Math.max(6, local.borderRadius - 4)}px` }}
            >
              {local.logoUrl ? (
                <img src={local.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                local.logoEmoji || '🎮'
              )}
            </div>
            <div>
              <div className="text-base font-black" style={{ color: local.accent }}>{local.siteName}</div>
              <div className="text-[10px]" style={{ color: local.textMuted }}>{local.siteSubtitle}</div>
            </div>
          </div>
          <button
            className="px-4 py-1.5 text-xs font-black"
            style={{
              background: local.buttonStyle === 'outline' ? 'transparent' : local.accent,
              color: local.buttonStyle === 'outline' ? local.accent : local.primary,
              border: local.buttonStyle === 'outline' ? `2px solid ${local.accent}` : 'none',
              borderRadius: `${local.borderRadius}px`,
            }}
          >
            دخول اللعبة
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className="p-4 border"
            style={{
              background: local.cardStyle === 'solid' ? local.secondary : `${local.surface}aa`,
              borderColor: local.cardStyle === 'neon' ? local.accent : local.surfaceLight,
              borderWidth: `${local.cardBorderWidth}px`,
              borderRadius: `${local.borderRadius}px`,
            }}
          >
            <div className="text-xs font-bold mb-1" style={{ color: local.accent }}>{local.heroBadge}</div>
            <div className="text-base font-black mb-1" style={{ color: local.textColor }}>{local.heroTitle}</div>
            <div className="text-xs" style={{ color: local.textMuted }}>{local.heroDescription}</div>
          </div>

          <div
            className="p-4 border flex flex-col justify-between"
            style={{
              background: local.secondary,
              borderColor: local.surfaceLight,
              borderRadius: `${local.borderRadius}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: local.textColor }}>مثال بطاقة فئة أو سؤال</span>
              <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: local.success, color: '#fff' }}>+400 نقطة</span>
            </div>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 rounded text-xs font-bold" style={{ background: `${local.success}25`, color: local.success }}>صحيح ✓</span>
              <span className="px-3 py-1 rounded text-xs font-bold" style={{ background: `${local.danger}25`, color: local.danger }}>خطأ ✕</span>
              <span className="px-3 py-1 rounded text-xs font-bold" style={{ background: `${local.warning}25`, color: local.warning }}>تنبيه ⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: COLORS & PRESETS */}
      {subTab === 'colors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/15 shadow-lg scale-[1.02]'
                      : 'border-surface-light bg-surface/60 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{preset.emoji}</span>
                    {isSelected && <span className="text-xs font-bold text-accent">✓</span>}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                  <div className="flex gap-1 mt-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.colors.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.colors.accent }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.colors.surface }} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {colorSections.map((sec) => (
              <div key={sec.title} className="bg-surface/80 rounded-2xl p-5 border border-surface-light space-y-3">
                <h4 className="font-bold text-white text-sm">{sec.title}</h4>
                <div className="space-y-2.5">
                  {sec.fields.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-3 p-2.5 bg-surface-dark/70 rounded-xl border border-surface-light/60">
                      <span className="text-xs font-bold text-gray-200">{label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={local[key] || '#000000'}
                          onChange={(e) => updateField(key, e.target.value)}
                          className="w-8 h-8 rounded-lg border border-surface-light cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={local[key] || ''}
                          onChange={(e) => updateField(key, e.target.value)}
                          className="w-20 bg-surface border border-surface-light rounded-lg px-2 py-1 text-white text-xs font-mono text-center uppercase"
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
      )}

      {/* SUB-TAB 2: VISUAL SITE & LAYOUT BUILDER */}
      {subTab === 'builder' && (
        <div className="space-y-6">
          {/* Site Identity & Texts */}
          <div className="bg-surface/80 rounded-2xl p-6 border border-surface-light space-y-4">
            <h3 className="text-base font-black text-white">📝 هوية الموقع والنصوص الرئيسية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="اسم اللعبة / المنصة" value={local.siteName} onChange={(v) => updateField('siteName', v)} />
              <InputField label="الشعار الفرعي أسفل الاسم" value={local.siteSubtitle} onChange={(v) => updateField('siteSubtitle', v)} />
              <InputField label="شارة الترحيب العلوية (Badge)" value={local.heroBadge} onChange={(v) => updateField('heroBadge', v)} />
              <InputField label="عنوان الصفحة الرئيسية الكبير" value={local.heroTitle} onChange={(v) => updateField('heroTitle', v)} />
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-300 block mb-1">وصف المنصة في الواجهة الرئيسية</label>
                <textarea
                  rows={2}
                  value={local.heroDescription}
                  onChange={(e) => updateField('heroDescription', e.target.value)}
                  className="w-full bg-surface-dark border border-surface-light rounded-xl px-3 py-2 text-white text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <InputField label="نص التذييل (Footer)" value={local.footerText} onChange={(v) => updateField('footerText', v)} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="أيقونة الشعار (Emoji)" value={local.logoEmoji || ''} onChange={(v) => updateField('logoEmoji', v)} placeholder="🎮" />
                <InputField label="أو رابط صورة الشعار" value={local.logoUrl || ''} onChange={(v) => updateField('logoUrl', v)} placeholder="https://..." dir="ltr" />
              </div>
            </div>
          </div>

          {/* Geometry, Card Style, Background & Font */}
          <div className="bg-surface/80 rounded-2xl p-6 border border-surface-light space-y-5">
            <h3 className="text-base font-black text-white">📐 هندسة الواجهة، البطاقات، الخلفية، والخطوط</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField
                label="نوع الخط العربي"
                value={local.fontFamily || 'Cairo'}
                onChange={(v) => updateField('fontFamily', v)}
                options={FONTS}
              />
              <SelectField
                label="نمط البطاقات (Card Style)"
                value={local.cardStyle || 'glass'}
                onChange={(v) => updateField('cardStyle', v)}
                options={[
                  { value: 'glass', label: 'زجاجي شفاف (Glassmorphism)' },
                  { value: 'solid', label: 'صلب واضح (Solid)' },
                  { value: 'neon', label: 'إطار نيون متوهج (Neon)' },
                  { value: 'minimal', label: 'بسيط مسطح (Minimal)' },
                ]}
              />
              <SelectField
                label="خلفية الموقع (Background)"
                value={local.bgPattern || 'gradient'}
                onChange={(v) => updateField('bgPattern', v)}
                options={[
                  { value: 'gradient', label: 'تدرج لوني ناعم' },
                  { value: 'aurora', label: 'إضاءة شفق متوهجة (Aurora)' },
                  { value: 'grid', label: 'شبكة هندسية تقنية (Grid)' },
                  { value: 'dots', label: 'نقاط مضيئة (Dots)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <SelectField
                label="نمط الأزرار الرئيسية"
                value={local.buttonStyle || 'gradient'}
                onChange={(v) => updateField('buttonStyle', v)}
                options={[
                  { value: 'gradient', label: 'تدرج ذهبي كلاسيكي' },
                  { value: 'glow', label: 'مضيء متوهج (Glow)' },
                  { value: 'outline', label: 'إطار مفرغ (Outline)' },
                ]}
              />

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>استدارة الحواف</span>
                  <span className="text-accent font-mono">{local.borderRadius}px</span>
                </div>
                <input
                  type="range" min="0" max="28"
                  value={local.borderRadius}
                  onChange={(e) => updateField('borderRadius', parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>حجم الخط العام</span>
                  <span className="text-accent font-mono">{local.fontSizeScale}%</span>
                </div>
                <input
                  type="range" min="85" max="115" step="5"
                  value={local.fontSizeScale}
                  onChange={(e) => updateField('fontSizeScale', parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>ضبابية الزجاج (Blur)</span>
                  <span className="text-accent font-mono">{local.glassBlur}px</span>
                </div>
                <input
                  type="range" min="0" max="30" step="2"
                  value={local.glassBlur}
                  onChange={(e) => updateField('glassBlur', parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            </div>

            <div className="pt-2">
              <ToggleSwitch
                checked={local.animationsEnabled}
                onChange={(v) => updateField('animationsEnabled', v)}
                label="تفعيل الحركات والانتقالات (Animations)"
              />
            </div>
          </div>

          {/* Game Modes Visibility & Custom Names */}
          <div className="bg-surface/80 rounded-2xl p-6 border border-surface-light space-y-4">
            <div>
              <h3 className="text-base font-black text-white">🎮 التحكم بألعاب الصفحة الرئيسية (إخفاء / إظهار / تغيير الاسم)</h3>
              <p className="text-xs text-gray-400 mt-0.5">عطّل أي لعبة لا تريدها أن تظهر للاعبين أو غيّر عنوانها مباشرة</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GAME_MODE_CONTROLS.map((gm) => {
                const isVisible = !(local.hiddenModes || []).includes(gm.id);
                const customTitle = (local.customModeTitles || {})[gm.id] ?? gm.defaultTitle;
                return (
                  <div
                    key={gm.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      isVisible ? 'bg-surface-dark/70 border-surface-light' : 'bg-surface-dark/30 border-danger/30 opacity-60'
                    }`}
                  >
                    <span className="text-xl">{gm.icon}</span>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => updateModeTitle(gm.id, e.target.value)}
                      className="flex-1 bg-surface border border-surface-light rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleModeVisibility(gm.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        isVisible
                          ? 'bg-success/15 border-success/40 text-success'
                          : 'bg-danger/15 border-danger/40 text-danger'
                      }`}
                    >
                      {isVisible ? 'ظاهرة ✓' : 'مخفية ✕'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SMART CSS BLOCKS & SIMPLE CODE BUILDER */}
      {subTab === 'blocks' && (
        <div className="space-y-6">
          {/* 1-Click Visual Effect Blocks */}
          <div className="bg-surface/80 rounded-2xl p-6 border border-surface-light space-y-4">
            <div>
              <h3 className="text-base font-black text-white">⚡ بلوكات التأثيرات الجاهزة (بنقرة واحدة بدون كتابة كود)</h3>
              <p className="text-xs text-gray-400 mt-0.5">فعّل أو عطّل أي تأثير جمالي وسيتولد كود الـ CSS الخاص به تلقائياً</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DESIGN_EFFECT_BLOCKS.map((block) => {
                const active = (local.enabledEffects || []).includes(block.id);
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => toggleEffectBlock(block.id)}
                    className={`p-4 rounded-2xl border text-right transition-all ${
                      active
                        ? 'bg-accent/15 border-accent text-white shadow-lg'
                        : 'bg-surface-dark/60 border-surface-light text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{block.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-accent text-primary' : 'bg-white/10 text-gray-400'}`}>
                        {active ? 'مفعّل ✓' : 'تفعيل'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{block.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simple Custom CSS Editor */}
          <div className="bg-surface/80 rounded-2xl p-6 border border-surface-light space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FiCode className="text-accent" />
                  <span>محرر كود التصميم المخصص (Custom CSS)</span>
                </h3>
                <p className="text-xs text-gray-400">للتعديلات البرمجية الدقيقة — أي كود تكتبه هنا يُطبّق حياً على الموقع بالكامل</p>
              </div>
              {local.customCss && (
                <button
                  onClick={() => updateField('customCss', '')}
                  className="text-xs text-danger hover:underline"
                >
                  مسح الكود
                </button>
              )}
            </div>
            <textarea
              rows={7}
              dir="ltr"
              value={local.customCss || ''}
              onChange={(e) => updateField('customCss', e.target.value)}
              placeholder={`/* مثال لتعديل أي عنصر في الموقع */\n.glass-card {\n  border-width: 2px;\n}\nheader {\n  box-shadow: 0 4px 30px rgba(226, 183, 20, 0.2);\n}`}
              className="w-full bg-[#090d1a] border border-surface-light rounded-xl p-4 text-emerald-300 font-mono text-xs focus:border-accent focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 2: CATEGORIES MANAGER (إضافة وحذف وتعديل الأقسام والفئات + صورها)
   ════════════════════════════════════════════════════ */
function CategoriesTab() {
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory, isLoading } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    name: '',
    name_ar: '',
    slug: '',
    icon: '⚽',
    color: '#e2b714',
    image: '',
    description: '',
    sort_order: 0,
    is_active: true,
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadCategories();
  }, []);

  // Merge built-in 24 categories with DB categories
  const mergedCategories = React.useMemo(() => {
    const bySlug = new Map();
    ALL_AVAILABLE_CATEGORIES.forEach((c, idx) => {
      bySlug.set(c.id, {
        id: c.id,
        slug: c.id,
        name: c.name,
        name_ar: c.name,
        icon: c.icon,
        image: c.image,
        color: '#e2b714',
        sort_order: idx,
        is_active: true,
        is_custom: false,
        questionCount: 3,
      });
    });
    (categories || []).forEach((c) => {
      const key = c.slug || c.id;
      const prev = bySlug.get(key) || {};
      bySlug.set(key, {
        ...prev,
        ...c,
        image: c.image || prev.image || FALLBACK_CATEGORY_IMAGE,
      });
    });
    return Array.from(bySlug.values());
  }, [categories]);

  const resetForm = () => {
    setForm(initialForm);
    setEditCategory(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    setForm({
      ...initialForm,
      image: FALLBACK_CATEGORY_IMAGE,
      sort_order: mergedCategories.length + 1,
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
      image: cat.image || '',
      description: cat.description || '',
      sort_order: cat.sort_order ?? 0,
      is_active: cat.is_active !== false,
    });
    setShowModal(true);
  };

  const handleAutoSlug = () => {
    const text = form.name_ar || form.name || '';
    const clean = text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
    setForm((p) => ({ ...p, slug: clean || `cat-${Date.now().toString(36)}` }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name_ar.trim() && !form.name.trim()) return;

    setActionLoading(true);
    const payload = {
      name: form.name || form.name_ar,
      name_ar: form.name_ar || form.name,
      slug: form.slug || `cat-${Date.now().toString(36)}`,
      icon: form.icon || '🎯',
      color: form.color || '#e2b714',
      image: form.image || FALLBACK_CATEGORY_IMAGE,
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
    const newStatus = cat.is_active === false;
    await updateCategory(cat.id || cat.slug, { is_active: newStatus });
  };

  const filtered = mergedCategories.filter((cat) => {
    const matchesSearch =
      (cat.name_ar || cat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.slug || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterActive === 'active') return cat.is_active !== false;
    if (filterActive === 'inactive') return cat.is_active === false;
    return true;
  });

  const activeCount = mergedCategories.filter((c) => c.is_active !== false).length;
  const popularEmojis = ['⚽', '🎬', '🎮', '🧠', '📚', '💄', '🌍', '👑', '🏎️', '🎨', '🎵', '🍕', '🚀', '🕌', '⚔️', '🏆'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/80 p-5 rounded-2xl border border-surface-light">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-accent/20 text-accent text-xl">📁</span>
            إدارة الأقسام والفئات وصورها
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            أضف أقساماً جديدة بصور حقيقية، أو عدّل واحذف أي قسم فوراً
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-yellow-500 text-primary font-black shadow-lg hover:brightness-110 transition flex items-center gap-2 text-sm"
        >
          <FiPlus className="text-lg" /> إضافة قسم جديد
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface/60 p-4 rounded-xl border border-surface-light">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الفئة..."
            className="w-full bg-surface-dark border border-surface-light rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setFilterActive('all')} className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${filterActive === 'all' ? 'bg-accent text-primary border-accent' : 'bg-surface-dark text-gray-400 border-surface-light'}`}>
            الكل ({mergedCategories.length})
          </button>
          <button onClick={() => setFilterActive('active')} className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${filterActive === 'active' ? 'bg-success text-white border-success' : 'bg-surface-dark text-gray-400 border-surface-light'}`}>
            المفعلة ({activeCount})
          </button>
          <button onClick={loadCategories} className="p-2.5 rounded-xl bg-surface-dark text-gray-400 hover:text-accent border border-surface-light">
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
              className="bg-secondary border border-surface-light rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative my-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-light">
                <h3 className="text-lg font-bold text-accent">
                  {editCategory ? '✏️ تعديل الفئة' : '➕ إضافة فئة جديدة'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="اسم الفئة بالعربية *"
                  value={form.name_ar}
                  onChange={(v) => setForm((p) => ({ ...p, name_ar: v, name: p.name || v }))}
                  placeholder="مثال: دوري أبطال أوروبا..."
                  required
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-300">المعرّف بالإنجليزية (Slug) *</label>
                    <button type="button" onClick={handleAutoSlug} className="text-xs text-accent hover:underline">توليد تلقائي</button>
                  </div>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="champions-league"
                    className="w-full bg-surface border border-surface-light rounded-xl px-3.5 py-2 text-white text-sm font-mono focus:border-accent focus:outline-none"
                    dir="ltr"
                    required
                  />
                </div>

                {/* Real Image URL + Live Preview */}
                <div className="space-y-2">
                  <InputField
                    label="رابط صورة الفئة (Image URL)"
                    value={form.image}
                    onChange={(v) => setForm((p) => ({ ...p, image: v }))}
                    placeholder="https://..."
                    dir="ltr"
                  />
                  {form.image && (
                    <div className="relative h-24 rounded-xl overflow-hidden border border-surface-light">
                      <img
                        src={form.image}
                        alt="Preview"
                        onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2.5">
                        <span className="text-xs font-bold text-white">{form.icon} {form.name_ar || 'معاينة الصورة'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">الأيقونة</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.icon}
                      onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                      className="w-12 h-10 text-center text-xl bg-surface border border-surface-light rounded-xl text-white"
                    />
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1 px-2 bg-surface-dark rounded-xl border border-surface-light">
                      {popularEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, icon: emoji }))}
                          className={`text-lg p-1 rounded-lg ${form.icon === emoji ? 'bg-accent/30' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-light">
                  <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl bg-surface border border-surface-light text-gray-300 text-sm">
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 rounded-xl bg-accent text-primary font-black text-sm disabled:opacity-50"
                  >
                    {editCategory ? 'حفظ التعديلات' : 'إضافة القسم'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((cat) => {
          const isActive = cat.is_active !== false;
          return (
            <div
              key={cat.id || cat.slug}
              className={`bg-surface/80 rounded-2xl border p-3.5 flex items-center justify-between gap-3 ${
                isActive ? 'border-surface-light' : 'border-danger/30 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={cat.image || FALLBACK_CATEGORY_IMAGE}
                  alt={cat.name_ar || cat.name}
                  onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGE; }}
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <h4 className="text-sm font-bold text-white truncate">{cat.name_ar || cat.name}</h4>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 truncate">{cat.slug}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`p-2 rounded-lg border text-xs ${
                    isActive ? 'bg-success/15 border-success/40 text-success' : 'bg-surface-dark border-surface-light text-gray-500'
                  }`}
                >
                  {isActive ? <FiEye /> : <FiEyeOff />}
                </button>
                <button onClick={() => openEditModal(cat)} className="p-2 rounded-lg bg-surface-dark border border-surface-light text-gray-300 hover:text-accent">
                  <FiEdit2 />
                </button>
                <button onClick={() => setConfirmDelete(cat)} className="p-2 rounded-lg bg-danger/10 border border-danger/30 text-danger hover:bg-danger hover:text-white">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="تأكيد حذف القسم"
        message={`هل أنت متأكد من حذف "${confirmDelete?.name_ar || confirmDelete?.name}"؟`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB 3: QUESTIONS MANAGER (متوافق مع نظام الإجابة الواحدة)
   ════════════════════════════════════════════════════ */
function QuestionsTab() {
  const {
    questions, categories, loadQuestions, loadCategories,
    addQuestion, updateQuestion, deleteQuestion, isLoading, questionsMeta,
  } = useAdminStore();

  const [filters, setFilters] = useState({ category: '', difficulty: '', points: '', search: '', page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const emptyQ = {
    category: 'premier-league',
    subcategory: 'premier-league',
    question: '',
    correctAnswerText: '',
    points: 200,
    difficulty: 'easy',
    mediaType: null,
    mediaUrl: '',
    explanation: '',
  };
  const [form, setForm] = useState({ ...emptyQ });

  useEffect(() => {
    loadCategories();
    loadQuestions(filters);
  }, []);

  // Build unified slug-based category options (24 built-in + custom)
  const categoryOptions = React.useMemo(() => {
    const map = new Map();
    ALL_AVAILABLE_CATEGORIES.forEach((c) => {
      map.set(c.id, { value: c.id, label: `${c.icon} ${c.name}` });
    });
    (categories || []).forEach((c) => {
      const slug = c.slug || c.id;
      if (slug && !map.has(slug)) {
        map.set(slug, { value: slug, label: `${c.icon || '🎯'} ${c.name_ar || c.name}` });
      }
    });
    return Array.from(map.values());
  }, [categories]);

  const categoryNameMap = React.useMemo(() => {
    const m = {};
    categoryOptions.forEach((o) => { m[o.value] = o.label; });
    return m;
  }, [categoryOptions]);

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

  const resetForm = () => {
    setForm({ ...emptyQ });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.question.trim() || !form.correctAnswerText.trim() || !form.category) return;

    const payload = {
      category: form.category,
      subcategory: form.category,
      question: form.question.trim(),
      correctAnswerText: form.correctAnswerText.trim(),
      options: [form.correctAnswerText.trim()],
      correctAnswer: 0,
      points: Number(form.points) || 200,
      difficulty: form.difficulty || 'medium',
      mediaType: form.mediaType,
      mediaUrl: form.mediaUrl,
      explanation: form.explanation,
    };

    if (editId) {
      await updateQuestion(editId, payload);
    } else {
      await addQuestion(payload);
    }
    resetForm();
    loadQuestions(filters);
  };

  const startEdit = (q) => {
    const ansText =
      q.correctAnswerText ||
      (q.options && typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : '') ||
      '';
    setForm({
      category: q.subcategory || q.category || 'premier-league',
      subcategory: q.subcategory || q.category || 'premier-league',
      question: q.question || '',
      correctAnswerText: ansText,
      points: q.points || 200,
      difficulty: q.difficulty || 'easy',
      mediaType: q.mediaType || null,
      mediaUrl: q.mediaUrl || '',
      explanation: q.explanation || '',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 bg-secondary/80 p-5 rounded-2xl border border-surface-light">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">❓ إدارة بنك الأسئلة</h2>
          <p className="text-xs text-gray-400 mt-1">أضف أسئلة بالإجابة الصحيحة الواحدة (بدون خيارات متعددة) لأي فئة فوراً</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-5 py-2.5 rounded-xl bg-accent text-primary font-black hover:brightness-110 transition flex items-center gap-2 text-sm"
        >
          <FiPlus /> إضافة سؤال جديد
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-xl p-4 border border-surface-light">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <SelectField placeholder="كل الفئات" value={filters.category} onChange={(v) => applyFilters({ category: v })} options={categoryOptions} />
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
          <div className="lg:col-span-2 relative">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => applyFilters({ search: e.target.value })}
              placeholder="بحث في نص السؤال أو الإجابة..."
              className="w-full bg-surface-dark border border-surface-light rounded-lg pr-10 pl-3 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
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
            <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 border border-accent/40 space-y-4 shadow-xl">
              <h3 className="text-accent font-black text-lg">{editId ? '✏️ تعديل السؤال' : '➕ إضافة سؤال جديد'}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField
                  label="الفئة *"
                  value={form.category}
                  onChange={(v) => setForm((p) => ({ ...p, category: v, subcategory: v }))}
                  options={categoryOptions}
                />
                <SelectField
                  label="النقاط"
                  value={String(form.points)}
                  onChange={(v) => setForm((p) => ({ ...p, points: parseInt(v) }))}
                  options={[{ value: '200', label: '200 نقطة (سهل)' }, { value: '400', label: '400 نقطة (متوسط)' }, { value: '600', label: '600 نقطة (صعب)' }]}
                />
                <SelectField
                  label="الصعوبة"
                  value={form.difficulty}
                  onChange={(v) => setForm((p) => ({ ...p, difficulty: v }))}
                  options={[{ value: 'easy', label: 'سهل' }, { value: 'medium', label: 'متوسط' }, { value: 'hard', label: 'صعب' }]}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">نص السؤال *</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="اكتب السؤال بوضوح هنا..."
                  rows={2}
                  required
                  className="w-full bg-surface-dark border border-surface-light rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-400 block mb-1">الإجابة الصحيحة المعتمدة (تظهر عند ضغط كشف الإجابة) *</label>
                <input
                  type="text"
                  value={form.correctAnswerText}
                  onChange={(e) => setForm((p) => ({ ...p, correctAnswerText: e.target.value }))}
                  placeholder="اكتب الإجابة الصحيحة هنا..."
                  required
                  className="w-full bg-surface-dark border-2 border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-emerald-300 font-bold placeholder-gray-500 focus:border-emerald-400 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">تفسير أو معلومة إضافية (اختياري)</label>
                  <input
                    type="text"
                    value={form.explanation}
                    onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
                    placeholder="معلومة قصيرة تظهر بعد كشف الإجابة..."
                    className="w-full bg-surface-dark border border-surface-light rounded-xl px-3.5 py-2 text-white text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">نوع الوسائط (اختياري)</label>
                  <div className="flex gap-2">
                    {[
                      { val: null, label: 'بدون', icon: <FiX /> },
                      { val: 'image', label: 'صورة', icon: <FiImage /> },
                      { val: 'audio', label: 'صوت', icon: <FiMusic /> },
                    ].map(({ val, label, icon }) => (
                      <button
                        type="button"
                        key={label}
                        onClick={() => setForm((p) => ({ ...p, mediaType: val, mediaUrl: val ? p.mediaUrl : '' }))}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition ${
                          form.mediaType === val ? 'bg-accent text-primary font-bold' : 'bg-surface-dark text-gray-400'
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {form.mediaType && (
                <InputField
                  label="رابط الصورة أو الصوت"
                  value={form.mediaUrl}
                  onChange={(v) => setForm((p) => ({ ...p, mediaUrl: v }))}
                  placeholder="https://..."
                  dir="ltr"
                />
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 text-sm">إلغاء</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-xl bg-accent text-primary font-black hover:brightness-110 transition text-sm">
                  {editId ? 'حفظ التعديلات' : 'حفظ السؤال'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions Table */}
      {isLoading && !questions.length ? <Spinner /> : (
        <>
          <div className="overflow-x-auto bg-surface/60 rounded-2xl border border-surface-light">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-light text-gray-400">
                  <th className="text-right py-3 px-4">السؤال</th>
                  <th className="text-right py-3 px-3 hidden sm:table-cell">الإجابة الصحيحة</th>
                  <th className="text-right py-3 px-3 hidden md:table-cell">الفئة</th>
                  <th className="text-center py-3 px-3">النقاط</th>
                  <th className="text-center py-3 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-500 py-12">لا توجد أسئلة مطابقة</td></tr>
                )}
                {questions.map((q) => {
                  const ans = q.correctAnswerText || (q.options && typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : '');
                  const catLabel = categoryNameMap[q.subcategory] || categoryNameMap[q.category] || q.subcategory || q.category;
                  return (
                    <tr key={q.id} className="border-b border-surface-light/30 hover:bg-surface/40 transition">
                      <td className="py-3 px-4 text-white max-w-[260px] truncate">{q.question}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold max-w-[160px] truncate hidden sm:table-cell">{ans}</td>
                      <td className="py-3 px-3 text-gray-300 text-xs hidden md:table-cell">{catLabel}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-accent/20 text-accent px-2.5 py-0.5 rounded-md text-xs font-bold">{q.points}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => startEdit(q)} className="p-1.5 text-gray-400 hover:text-accent"><FiEdit2 size={15} /></button>
                          <button onClick={() => setConfirmDelete(q.id)} className="p-1.5 text-gray-400 hover:text-danger"><FiTrash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {questionsMeta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => changePage(Math.max(1, questionsMeta.page - 1))}
                disabled={questionsMeta.page <= 1}
                className="p-2 rounded-lg bg-surface text-gray-400 hover:text-white disabled:opacity-30"
              >
                <FiChevronRight />
              </button>
              <span className="text-gray-400 text-sm">
                صفحة {questionsMeta.page} من {questionsMeta.totalPages} ({questionsMeta.total} سؤال)
              </span>
              <button
                onClick={() => changePage(Math.min(questionsMeta.totalPages, questionsMeta.page + 1))}
                disabled={questionsMeta.page >= questionsMeta.totalPages}
                className="p-2 rounded-lg bg-surface text-gray-400 hover:text-white disabled:opacity-30"
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-white flex items-center gap-2">⚙️ إعدادات وقوانين اللعب</h2>

      <div className="bg-surface rounded-2xl p-5 border border-surface-light space-y-4">
        <h3 className="text-accent font-bold text-base">🃏 خطوط النجاة المتاحة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(LIFELINE_LABELS).map(([key, label]) => (
            <div key={key} className="bg-surface-dark rounded-xl p-3 flex items-center justify-between">
              <span className="text-gray-200 text-sm font-bold">{label}</span>
              <ToggleSwitch checked={local.lifelines?.[key] ?? true} onChange={() => toggleLifeline(key)} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2">الحد الأقصى لكل فريق في المباراة</label>
            <input
              type="number" min="1" max="6"
              value={local.maxLifelinesPerGame ?? 3}
              onChange={(e) => setLocal((p) => ({ ...p, maxLifelinesPerGame: parseInt(e.target.value) || 3 }))}
              className="w-full bg-surface-dark border border-surface-light rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2">نسبة نجاح القنبلة: {local.bombBonusChance ?? 50}%</label>
            <input
              type="range" min="0" max="100" step="5"
              value={local.bombBonusChance ?? 50}
              onChange={(e) => setLocal((p) => ({ ...p, bombBonusChance: parseInt(e.target.value) }))}
              className="w-full accent-accent"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 border border-surface-light space-y-4">
        <h3 className="text-accent font-bold text-base">⏱️ المؤقت وقيم النقاط</h3>
        <div>
          <label className="text-xs font-bold text-gray-300 block mb-2">وقت السؤال الافتراضي: {local.questionTimer ?? 30} ثانية</label>
          <input
            type="range" min="10" max="120" step="5"
            value={local.questionTimer ?? 30}
            onChange={(e) => setLocal((p) => ({ ...p, questionTimer: parseInt(e.target.value) }))}
            className="w-full accent-accent"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'easy', label: 'نقاط السهل', def: 200 },
            { key: 'medium', label: 'نقاط المتوسط', def: 400 },
            { key: 'hard', label: 'نقاط الصعب', def: 600 },
          ].map(({ key, label, def }) => (
            <div key={key}>
              <label className="text-xs font-bold text-gray-300 block mb-1">{label}</label>
              <input
                type="number" min="50" step="50"
                value={local.pointValues?.[key] ?? def}
                onChange={(e) => setLocal((p) => ({
                  ...p,
                  pointValues: { ...p.pointValues, [key]: parseInt(e.target.value) || def },
                }))}
                className="w-full bg-surface-dark border border-surface-light rounded-xl px-3 py-2 text-white text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => updateSettings(local)}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-accent text-primary font-black hover:brightness-110 transition flex items-center gap-2 text-sm disabled:opacity-50"
        >
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
  const [resetStep, setResetStep] = useState(0);
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
        <h2 className="text-xl font-black text-white flex items-center gap-2">👥 مراقبة المستخدمين والغرف</h2>
        <div className="flex items-center gap-4">
          <ToggleSwitch checked={autoRefresh} onChange={setAutoRefresh} label="تحديث تلقائي" />
          <button onClick={refreshAll} className="p-2 rounded-lg bg-surface text-gray-400 hover:text-accent">
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-surface-light overflow-hidden">
        <div className="p-4 border-b border-surface-light">
          <h3 className="text-accent font-bold flex items-center gap-2 text-sm"><FiGrid /> الغرف النشطة ({rooms.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-light text-gray-400 text-xs">
                <th className="text-right py-3 px-4">الكود</th>
                <th className="text-right py-3 px-4">المضيف</th>
                <th className="text-center py-3 px-4">اللاعبون</th>
                <th className="text-center py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 && (
                <tr><td colSpan={4} className="text-center text-gray-500 py-8 text-xs">لا توجد غرف نشطة حالياً</td></tr>
              )}
              {rooms.map((r) => (
                <tr key={r.code} className="border-b border-surface-light/30">
                  <td className="py-3 px-4 text-accent font-mono font-bold">{r.code}</td>
                  <td className="py-3 px-4 text-white">{r.host?.nickname || r.host || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{r.players?.length ?? r.players ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => closeRoom(r.code)} className="px-3 py-1 rounded-lg bg-danger/20 text-danger text-xs">إغلاق</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-surface-light overflow-hidden">
        <div className="p-4 border-b border-surface-light">
          <h3 className="text-accent font-bold flex items-center gap-2 text-sm"><FiUsers /> المستخدمون المسجلون ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-light text-gray-400 text-xs">
                <th className="text-right py-3 px-4">الهاتف / البريد</th>
                <th className="text-right py-3 px-4">اللقب</th>
                <th className="text-center py-3 px-4">النقاط</th>
                <th className="text-center py-3 px-4">الحالة</th>
                <th className="text-center py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-500 py-8 text-xs">لا يوجد مستخدمون مسجلون</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-light/30">
                  <td className="py-3 px-4 text-gray-300 font-mono text-xs" dir="ltr">{u.phone}</td>
                  <td className="py-3 px-4 text-white">{u.nickname || '—'}</td>
                  <td className="py-3 px-4 text-center text-accent font-bold">{u.points ?? 0}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-xs ${u.banned ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                      {u.banned ? 'محظور' : 'نشط'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.banned ? (
                      <button onClick={() => unbanUser(u.id)} className="px-3 py-1 rounded-lg bg-success/20 text-success text-xs">إلغاء الحظر</button>
                    ) : (
                      <button onClick={() => banUser(u.id)} className="px-3 py-1 rounded-lg bg-danger/20 text-danger text-xs">حظر</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 border border-danger/30 space-y-3">
        <h3 className="text-danger font-bold flex items-center gap-2 text-sm"><FiAlertTriangle /> إعادة تعيين لوحة المتصدرين</h3>
        <button
          onClick={handleResetLeaderboard}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
            resetStep === 0 ? 'bg-danger/20 text-danger' : 'bg-danger text-white'
          }`}
        >
          <FiAlertTriangle />
          {resetStep === 0 ? 'تصفير جميع النقاط' : resetStep === 1 ? 'هل أنت متأكد؟ اضغط ثانية' : 'تأكيد نهائي!'}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN DASHBOARD LAYOUT
   ════════════════════════════════════════════════════ */
function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('theme');
  const { logout, error, successMsg, clearMessages } = useAdminStore();

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
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-secondary border-l border-surface-light shrink-0">
          <div className="p-5 border-b border-surface-light space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
              <FiLock size={10} /> إدارة خاصة ومخفية
            </div>
            <h1 className="text-xl font-black text-white">أستوديو هخلص عليك</h1>
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
                      ? 'bg-accent/15 text-accent font-bold border border-accent/30'
                      : 'text-gray-400 hover:bg-surface hover:text-white'
                  }`}
                >
                  <Icon size={17} />
                  <span>{tab.emoji} {tab.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-surface-light space-y-1">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition text-xs font-bold"
            >
              <FiExternalLink size={16} />
              <span>معاينة الموقع مباشرة</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-danger/15 hover:text-danger transition text-xs font-bold"
            >
              <FiLogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex items-center justify-between bg-secondary border-b border-surface-light px-4 py-3">
            <div className="flex items-center gap-2">
              <FiLock className="text-accent" />
              <h1 className="text-base font-black text-white">أستوديو الإدارة</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-emerald-400 text-xs font-bold">معاينة</button>
              <button onClick={logout} className="text-gray-400 hover:text-danger"><FiLogOut size={18} /></button>
            </div>
          </header>

          <div className="flex-1 p-4 lg:p-6 overflow-y-auto pb-24 lg:pb-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>

          <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-secondary border-t border-surface-light flex z-40">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition ${
                    activeTab === tab.id ? 'text-accent font-bold' : 'text-gray-500'
                  }`}
                >
                  <Icon size={17} />
                  <span className="truncate max-w-[64px]">{tab.label}</span>
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
   EXPORTED PAGE COMPONENT
   ════════════════════════════════════════════════════ */
export default function AdminPage() {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
}
