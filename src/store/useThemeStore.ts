import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'black-white' | 'navy-white';

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

const THEME_CLASSES: ThemeMode[] = ['light', 'dark', 'sepia', 'black-white', 'navy-white'];

export const useThemeStore = create<ThemeState>((set) => {
  const storedTheme = localStorage.getItem('md_app_theme') as ThemeMode | null;
  const initialTheme: ThemeMode = storedTheme && THEME_CLASSES.includes(storedTheme) ? storedTheme : 'light';

  document.documentElement.classList.remove(...THEME_CLASSES);
  document.documentElement.classList.add(initialTheme);

  return {
    theme: initialTheme,
    fontSize: 16,
    fontFamily: 'Vazirmatn',
    textColor: '#0f172a',

    setTheme: (theme: ThemeMode) => {
      localStorage.setItem('md_app_theme', theme);
      document.documentElement.classList.remove(...THEME_CLASSES);
      document.documentElement.classList.add(theme);
      set({ theme });
    },

    setFontSize: (size: number) => set({ fontSize: size }),
    setFontFamily: (font: string) => set({ fontFamily: font }),
    setTextColor: (color: string) => set({ textColor: color }),
  };
});
