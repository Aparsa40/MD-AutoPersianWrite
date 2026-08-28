import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'black-white' | 'navy-white' | 'graphite';

interface ThemeState {
  theme: ThemeMode;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  setTextColor: (color: string) => void;
}

const THEME_CLASSES: ThemeMode[] = ['light', 'dark', 'sepia', 'black-white', 'navy-white', 'graphite'];

const defaultTextColorForTheme = (theme: ThemeMode) => {
  switch (theme) {
    case 'dark':
    case 'black-white':
    case 'navy-white':
    case 'graphite':
      return '#e6edf7';
    case 'sepia':
      return '#432818';
    case 'light':
    default:
      return '#0f172a';
  }
};

const isSupportedTextColor = (color: string): boolean => /^#[0-9a-fA-F]{6}$/.test(color);

export const useThemeStore = create<ThemeState>((set) => {
  const storedTheme = localStorage.getItem('md_app_theme') as ThemeMode | null;
  const initialTheme: ThemeMode = storedTheme && THEME_CLASSES.includes(storedTheme) ? storedTheme : 'light';

  document.documentElement.classList.remove(...THEME_CLASSES);
  document.documentElement.classList.add(initialTheme);

  return {
    theme: initialTheme,
    fontSize: 16,
    fontFamily: 'Vazirmatn',
    textColor: defaultTextColorForTheme(initialTheme),

    setTheme: (theme: ThemeMode) => {
      localStorage.setItem('md_app_theme', theme);
      document.documentElement.classList.remove(...THEME_CLASSES);
      document.documentElement.classList.add(theme);
      set({ theme, textColor: defaultTextColorForTheme(theme) });
    },

    setFontSize: (size: number) => set({ fontSize: size }),
    setFontFamily: (font: string) => set({ fontFamily: font }),

    setTextColor: (color: string) => {
      if (!isSupportedTextColor(color)) return;
      set({ textColor: color });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent<string>('md-text-color-selection', { detail: color }));
      }
    },
  };
});
