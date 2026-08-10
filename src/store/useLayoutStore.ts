import { create } from 'zustand';

export type ViewMode = 'split' | 'editor-only' | 'preview-only';
export type Orientation = 'horizontal' | 'vertical';

interface LayoutState {
  viewMode: ViewMode;
  orientation: Orientation;
  splitRatio: number; // درصد پهنای پنل ویرایشگر (مثلا 50)
  isTocOpen: boolean;
  setViewMode: (mode: ViewMode) => void;
  setOrientation: (orientation: Orientation) => void;
  setSplitRatio: (ratio: number) => void;
  toggleToc: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  viewMode: 'split',
  orientation: 'horizontal',
  splitRatio: 50,
  isTocOpen: false,
  setViewMode: (mode) => set({ viewMode: mode }),
  setOrientation: (orientation) => set({ orientation }),
  setSplitRatio: (ratio) => set({ splitRatio: Math.min(Math.max(ratio, 15), 85) }),
  toggleToc: () => set((state) => ({ isTocOpen: !state.isTocOpen })),
}));
