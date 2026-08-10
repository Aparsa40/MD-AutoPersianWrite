import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'sepia';

interface ThemeState {
  theme: ThemeMode;
  fontSize: number; // اندازه فونت بر حسب پیکسل
  fontFamily: string;
  textColor: string;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  setTextColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // دریافت تم ذخیره شده از localStorage یا پیش‌فرض light
  const initialTheme = (localStorage.getItem('md_app_theme') as ThemeMode) || 'light';

  return {
    theme: initialTheme,
    fontSize: 16,
    fontFamily: 'Vazirmatn',
    textColor: '#0f172a',

    setTheme: (theme: ThemeMode) => {
      localStorage.setItem('md_app_theme', theme);
      document.documentElement.classList.remove('light', 'dark', 'sepia');
      document.documentElement.classList.add(theme);
      set({ theme });
    },

    setFontSize: (size: number) => set({ fontSize: size }),
    setFontFamily: (font: string) => set({ fontFamily: font }),
    setTextColor: (color: string) => set({ textColor: color }),
  };
});
