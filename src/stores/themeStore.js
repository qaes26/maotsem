import { create } from 'zustand';

const defaultTheme = {
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
};

const applyThemeToCSS = (theme) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-light', theme.primaryLight);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-secondary-light', theme.secondaryLight);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-surface-light', theme.surfaceLight);
  root.style.setProperty('--color-surface-dark', theme.surfaceDark);
  root.style.setProperty('--color-danger', theme.danger);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-warning', theme.warning);
};

const useThemeStore = create((set) => ({
  theme: defaultTheme,
  isLoading: false,

  // Load theme from API
  loadTheme: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/admin/theme');
      if (res.ok) {
        const data = await res.json();
        if (data.theme) {
          const merged = { ...defaultTheme, ...data.theme };
          applyThemeToCSS(merged);
          set({ theme: merged, isLoading: false });
          return;
        }
      }
    } catch {
      // Use defaults
    }
    applyThemeToCSS(defaultTheme);
    set({ isLoading: false });
  },

  // Update theme (admin)
  updateTheme: async (newTheme, adminToken) => {
    const merged = { ...defaultTheme, ...newTheme };
    applyThemeToCSS(merged);
    set({ theme: merged });
    try {
      await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ theme: merged }),
      });
    } catch {
      // silently fail
    }
  },

  // Reset to defaults
  resetTheme: () => {
    applyThemeToCSS(defaultTheme);
    set({ theme: defaultTheme });
  },
}));

export default useThemeStore;
