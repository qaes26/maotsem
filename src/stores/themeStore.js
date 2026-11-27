import { create } from 'zustand';
import gameApi from '../services/gameApi';

export const THEME_PRESETS = [
  {
    id: 'royal',
    name: 'الذهبي الملكي',
    emoji: '👑',
    description: 'كحلي داكن مع لمسات ذهبية فخمة (الافتراضي)',
    colors: {
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
      textColor: '#ffffff',
      textMuted: '#94a3b8',
      borderRadius: 16,
      fontFamily: 'Cairo',
    },
  },
  {
    id: 'cyber',
    name: 'النيون السيبراني',
    emoji: '⚡',
    description: 'بنفسجي ليزري مع أزرق سماوي نيون متوهج',
    colors: {
      primary: '#0d0b1e',
      primaryLight: '#1a153b',
      secondary: '#171330',
      secondaryLight: '#261e52',
      accent: '#00f0ff',
      surface: '#211a47',
      surfaceLight: '#342a6e',
      surfaceDark: '#090715',
      danger: '#ff0055',
      success: '#00ff9d',
      warning: '#ffb800',
      textColor: '#ffffff',
      textMuted: '#a5b4fc',
      borderRadius: 18,
      fontFamily: 'Tajawal',
    },
  },
  {
    id: 'emerald',
    name: 'الزمردي الرياضي',
    emoji: '⚽',
    description: 'أخضر عشبي داكن مع زمردي مشرق للملاعب',
    colors: {
      primary: '#062117',
      primaryLight: '#0c3626',
      secondary: '#0e2e21',
      secondaryLight: '#144230',
      accent: '#10b981',
      surface: '#0f3d2c',
      surfaceLight: '#195941',
      surfaceDark: '#03140e',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#eab308',
      textColor: '#ffffff',
      textMuted: '#86efac',
      borderRadius: 14,
      fontFamily: 'Cairo',
    },
  },
  {
    id: 'crimson',
    name: 'العنابي الحماسي',
    emoji: '🩸',
    description: 'نبيذي ملكي داكن مع أحمر ياقوتي ملتهب',
    colors: {
      primary: '#200810',
      primaryLight: '#330f1c',
      secondary: '#2a0c16',
      secondaryLight: '#421424',
      accent: '#f43f5e',
      surface: '#3a101f',
      surfaceLight: '#571930',
      surfaceDark: '#14040a',
      danger: '#dc2626',
      success: '#10b981',
      warning: '#f59e0b',
      textColor: '#ffffff',
      textMuted: '#fda4af',
      borderRadius: 16,
      fontFamily: 'Tajawal',
    },
  },
  {
    id: 'midnight',
    name: 'الليلي المترف OLED',
    emoji: '🌌',
    description: 'أسود كربوني نقي مع ذهب كلاسيكي هادئ',
    colors: {
      primary: '#09090b',
      primaryLight: '#18181b',
      secondary: '#121215',
      secondaryLight: '#27272a',
      accent: '#fbbf24',
      surface: '#1c1917',
      surfaceLight: '#292524',
      surfaceDark: '#050506',
      danger: '#f43f5e',
      success: '#34d399',
      warning: '#fb923c',
      textColor: '#fafafa',
      textMuted: '#a1a1aa',
      borderRadius: 12,
      fontFamily: 'IBM Plex Sans Arabic',
    },
  },
  {
    id: 'ocean',
    name: 'المحيط الهادئ',
    emoji: '🌊',
    description: 'كحلي بحري عميق مع تركواز مائي منعش',
    colors: {
      primary: '#041c2c',
      primaryLight: '#072b43',
      secondary: '#0a293e',
      secondaryLight: '#0f3d5c',
      accent: '#38bdf8',
      surface: '#0c3a58',
      surfaceLight: '#145580',
      surfaceDark: '#02101a',
      danger: '#f87171',
      success: '#34d399',
      warning: '#facc15',
      textColor: '#ffffff',
      textMuted: '#93c5fd',
      borderRadius: 18,
      fontFamily: 'Cairo',
    },
  },
  {
    id: 'sunset',
    name: 'الغروب البرتقالي',
    emoji: '🌇',
    description: 'عنبري دافئ مع برتقالي شمسي متوهج',
    colors: {
      primary: '#1f1307',
      primaryLight: '#33200e',
      secondary: '#29190c',
      secondaryLight: '#422915',
      accent: '#f97316',
      surface: '#3d2511',
      surfaceLight: '#57351a',
      surfaceDark: '#120a03',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#eab308',
      textColor: '#ffffff',
      textMuted: '#fdba74',
      borderRadius: 16,
      fontFamily: 'Cairo',
    },
  },
];

export const defaultTheme = {
  ...THEME_PRESETS[0].colors,
  logoUrl: '',
  logoEmoji: '',
  siteName: 'هخلص عليك',
  siteSubtitle: 'المنصة التنافسية الكبرى',
  heroBadge: 'المنصة رقم #1 للألعاب التفاعلية والمسابقات باللغة العربية',
  heroTitle: 'أهلاً بك في هخلص عليك',
  heroDescription: 'مشروع متكامل ومحتوى متجدد باستمرار: لوحة الـ 6 فئات، المزاد الكبير، أهداف سكتش، تمثيل شخصيات، مافيا، وتحدي التشكيلة!',
  footerText: 'صُنع لمحبي المسابقات والتحدي',
  cardStyle: 'glass', // 'glass' | 'solid' | 'neon' | 'minimal'
  bgPattern: 'gradient', // 'gradient' | 'grid' | 'dots' | 'aurora'
  buttonStyle: 'gradient', // 'gradient' | 'glow' | 'outline'
  fontSizeScale: 100,
  glassBlur: 16,
  cardBorderWidth: 1,
  animationsEnabled: true,
  hiddenModes: [],
  customModeTitles: {},
  enabledEffects: [],
  customCss: '',
};

export const normalizeTheme = (raw = {}) => {
  return {
    primary: raw.primary || raw.primaryColor || defaultTheme.primary,
    primaryLight: raw.primaryLight || raw.primary_light || defaultTheme.primaryLight,
    secondary: raw.secondary || raw.secondaryColor || defaultTheme.secondary,
    secondaryLight: raw.secondaryLight || raw.secondary_light || defaultTheme.secondaryLight,
    accent: raw.accent || raw.accentColor || defaultTheme.accent,
    surface: raw.surface || raw.surfaceColor || defaultTheme.surface,
    surfaceLight: raw.surfaceLight || raw.surface_light || defaultTheme.surfaceLight,
    surfaceDark: raw.surfaceDark || raw.surface_dark || defaultTheme.surfaceDark,
    danger: raw.danger || raw.dangerColor || defaultTheme.danger,
    success: raw.success || raw.successColor || defaultTheme.success,
    warning: raw.warning || raw.warningColor || defaultTheme.warning,
    textColor: raw.textColor || raw.text_color || defaultTheme.textColor,
    textMuted: raw.textMuted || raw.text_muted || defaultTheme.textMuted,
    borderRadius: raw.borderRadius !== undefined ? Number(raw.borderRadius) : defaultTheme.borderRadius,
    fontFamily: raw.fontFamily || defaultTheme.fontFamily,
    logoUrl: raw.logoUrl || '',
    logoEmoji: raw.logoEmoji || '',
    siteName: raw.siteName || defaultTheme.siteName,
    siteSubtitle: raw.siteSubtitle || defaultTheme.siteSubtitle,
    heroBadge: raw.heroBadge || defaultTheme.heroBadge,
    heroTitle: raw.heroTitle || defaultTheme.heroTitle,
    heroDescription: raw.heroDescription || defaultTheme.heroDescription,
    footerText: raw.footerText || defaultTheme.footerText,
    cardStyle: raw.cardStyle || defaultTheme.cardStyle,
    bgPattern: raw.bgPattern || defaultTheme.bgPattern,
    buttonStyle: raw.buttonStyle || defaultTheme.buttonStyle,
    fontSizeScale: raw.fontSizeScale !== undefined ? Number(raw.fontSizeScale) : defaultTheme.fontSizeScale,
    glassBlur: raw.glassBlur !== undefined ? Number(raw.glassBlur) : defaultTheme.glassBlur,
    cardBorderWidth: raw.cardBorderWidth !== undefined ? Number(raw.cardBorderWidth) : defaultTheme.cardBorderWidth,
    animationsEnabled: raw.animationsEnabled !== undefined ? Boolean(raw.animationsEnabled) : defaultTheme.animationsEnabled,
    hiddenModes: Array.isArray(raw.hiddenModes) ? raw.hiddenModes : [],
    customModeTitles: raw.customModeTitles && typeof raw.customModeTitles === 'object' ? raw.customModeTitles : {},
    enabledEffects: Array.isArray(raw.enabledEffects) ? raw.enabledEffects : [],
    customCss: typeof raw.customCss === 'string' ? raw.customCss : '',
  };
};

export const DESIGN_EFFECT_BLOCKS = [
  {
    id: 'neon-cards',
    name: 'توهج نيون للبطاقات',
    desc: 'إطار مضيء متوهج حول البطاقات عند المرور عليها',
    css: `.glass-card:hover { box-shadow: 0 0 28px color-mix(in srgb, var(--color-accent) 35%, transparent) !important; border-color: var(--color-accent) !important; }`,
  },
  {
    id: 'gold-buttons',
    name: 'أزرار ثلاثية الأبعاد بارزة',
    desc: 'ظل سفلي عميق للأزرار الرئيسية لإحساس الألعاب',
    css: `button.gradient-accent, .gradient-accent { box-shadow: 0 6px 0 color-mix(in srgb, var(--color-accent) 55%, #000), 0 12px 24px rgba(0,0,0,0.4) !important; }`,
  },
  {
    id: 'rounded-pill',
    name: 'حواف فائقة الاستدارة',
    desc: 'تحويل البطاقات والأزرار إلى أشكال دائرية ناعمة',
    css: `.glass-card { border-radius: 28px !important; }`,
  },
  {
    id: 'sharp-esports',
    name: 'نمط الرياضات الإلكترونية الحاد',
    desc: 'زوايا حادة عصرية للبطولات',
    css: `.glass-card, button, input { border-radius: 6px !important; }`,
  },
  {
    id: 'high-contrast',
    name: 'تباين عالٍ واضح',
    desc: 'تغميق خلفيات البطاقات لوضوح أكبر للنصوص',
    css: `.glass-card { background: rgba(6, 12, 28, 0.85) !important; border-color: rgba(255,255,255,0.18) !important; }`,
  },
];

export const applyThemeToCSS = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const t = normalizeTheme(theme);

  root.style.setProperty('--color-primary', t.primary);
  root.style.setProperty('--color-primary-light', t.primaryLight);
  root.style.setProperty('--color-secondary', t.secondary);
  root.style.setProperty('--color-secondary-light', t.secondaryLight);
  root.style.setProperty('--color-accent', t.accent);
  root.style.setProperty('--color-surface', t.surface);
  root.style.setProperty('--color-surface-light', t.surfaceLight);
  root.style.setProperty('--color-surface-dark', t.surfaceDark);
  root.style.setProperty('--color-danger', t.danger);
  root.style.setProperty('--color-success', t.success);
  root.style.setProperty('--color-warning', t.warning);
  root.style.setProperty('--color-text', t.textColor);
  root.style.setProperty('--color-text-muted', t.textMuted);
  root.style.setProperty('--border-radius', `${t.borderRadius}px`);
  root.style.setProperty('--glass-blur', `${t.glassBlur}px`);
  root.style.setProperty('--card-border-width', `${t.cardBorderWidth}px`);
  root.style.fontSize = `${Math.max(85, Math.min(120, t.fontSizeScale))}%`;

  if (t.fontFamily) {
    document.body.style.fontFamily = `"${t.fontFamily}", Cairo, sans-serif`;
  }
  if (t.siteName) {
    document.title = `${t.siteName} - لعبة المعرفة والتحدي`;
  }

  // Generate dynamic style rules for cardStyle, bgPattern, buttonStyle, effects & customCss
  let styleTag = document.getElementById('admin-dynamic-theme-css');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'admin-dynamic-theme-css';
    document.head.appendChild(styleTag);
  }

  const cardRules = {
    glass: `.glass-card { background: color-mix(in srgb, var(--color-surface) 45%, transparent); backdrop-filter: blur(${t.glassBlur}px); border-width: ${t.cardBorderWidth}px; border-radius: ${t.borderRadius}px; }`,
    solid: `.glass-card { background: var(--color-secondary); backdrop-filter: none; border-width: ${t.cardBorderWidth}px; border-radius: ${t.borderRadius}px; }`,
    neon: `.glass-card { background: rgba(10, 14, 30, 0.78); backdrop-filter: blur(${t.glassBlur}px); border: ${Math.max(1, t.cardBorderWidth)}px solid color-mix(in srgb, var(--color-accent) 45%, transparent); box-shadow: 0 0 24px color-mix(in srgb, var(--color-accent) 18%, transparent); border-radius: ${t.borderRadius}px; }`,
    minimal: `.glass-card { background: color-mix(in srgb, var(--color-primary-light) 60%, transparent); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.06); box-shadow: none; border-radius: ${t.borderRadius}px; }`,
  };

  const bgRules = {
    gradient: `.gradient-bg { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-surface-dark) 100%); }`,
    grid: `.gradient-bg { background-color: var(--color-primary); background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 36px 36px; }`,
    dots: `.gradient-bg { background-color: var(--color-primary); background-image: radial-gradient(color-mix(in srgb, var(--color-accent) 20%, transparent) 1.5px, transparent 1.5px); background-size: 24px 24px; }`,
    aurora: `.gradient-bg { background: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 45%), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--color-surface) 75%, transparent), transparent 50%), var(--color-primary); }`,
  };

  const buttonRules = {
    gradient: '',
    glow: `.gradient-accent { box-shadow: 0 0 22px color-mix(in srgb, var(--color-accent) 55%, transparent); }`,
    outline: `.gradient-accent { background: transparent !important; border: 2px solid var(--color-accent) !important; color: var(--color-accent) !important; }`,
  };

  const blocksCss = (t.enabledEffects || [])
    .map((id) => DESIGN_EFFECT_BLOCKS.find((b) => b.id === id)?.css || '')
    .join('\n');

  styleTag.textContent = [
    cardRules[t.cardStyle] || '',
    bgRules[t.bgPattern] || '',
    buttonRules[t.buttonStyle] || '',
    !t.animationsEnabled ? `*, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }` : '',
    blocksCss,
    t.customCss || '',
  ].join('\n');
};

const getSavedLocalTheme = () => {
  try {
    const saved = localStorage.getItem('game_theme');
    if (saved) return normalizeTheme(JSON.parse(saved));
  } catch {}
  return defaultTheme;
};

const useThemeStore = create((set, get) => ({
  theme: getSavedLocalTheme(),
  isLoading: false,

  loadTheme: async () => {
    const local = getSavedLocalTheme();
    applyThemeToCSS(local);
    set({ theme: local, isLoading: true });

    try {
      const remote = await gameApi.getTheme();
      if (remote) {
        const merged = normalizeTheme(remote);
        applyThemeToCSS(merged);
        localStorage.setItem('game_theme', JSON.stringify(merged));
        set({ theme: merged, isLoading: false });
        return;
      }
    } catch (e) {
      console.warn('[ThemeStore] loadTheme error:', e);
    }
    set({ isLoading: false });
  },

  updateTheme: async (newTheme) => {
    const merged = normalizeTheme({ ...get().theme, ...newTheme });
    applyThemeToCSS(merged);
    localStorage.setItem('game_theme', JSON.stringify(merged));
    set({ theme: merged });

    try {
      await gameApi.saveTheme(merged);
    } catch (err) {
      console.error('[ThemeStore] updateTheme error:', err);
    }
  },

  applyPreset: async (presetId) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    await get().updateTheme(found.colors);
  },

  resetTheme: async () => {
    applyThemeToCSS(defaultTheme);
    localStorage.setItem('game_theme', JSON.stringify(defaultTheme));
    set({ theme: defaultTheme });
    try {
      await gameApi.saveTheme(defaultTheme);
    } catch {}
  },
}));

export default useThemeStore;
