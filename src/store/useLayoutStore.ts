import { create } from 'zustand';

export type ViewMode = 'split' | 'editor-only' | 'preview-only';

export type Orientation = 'horizontal' | 'vertical';

interface LayoutState {
  viewMode: ViewMode;
  orientation: Orientation;

  /**
   * درصد فضای Editor در حالت Split.
   */
  splitRatio: number;

  isTocOpen: boolean;

  setViewMode: (mode: ViewMode) => void;

  setOrientation: (orientation: Orientation) => void;

  setSplitRatio: (ratio: number) => void;

  toggleToc: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  /**
   * حالت پیش‌فرض:
   * Editor و Preview در کنار یکدیگر.
   */
  viewMode: 'split',

  /**
   * حالت افقی یعنی دو پنل کنار هم.
   */
  orientation: 'horizontal',

  /**
   * هر پنل در ابتدا ۵۰ درصد فضا دارد.
   */
  splitRatio: 50,

  /**
   * Outline در شروع بسته است.
   */
  isTocOpen: false,

  setViewMode: (mode) =>
    set({
      viewMode: mode,
    }),

  setOrientation: (orientation) =>
    set({
      orientation,
    }),

  /**
   * تغییر: محدوده Split به ۱۵ تا ۸۵ درصد محدود شده است.
   *
   * دلیل:
   * جلوگیری از اینکه کاربر یکی از پنل‌ها را کاملاً غیرقابل استفاده کند.
   */
  setSplitRatio: (ratio) =>
    set({
      splitRatio: Math.min(Math.max(ratio, 15), 85),
    }),

  toggleToc: () =>
    set((state) => ({
      isTocOpen: !state.isTocOpen,
    })),
}));
