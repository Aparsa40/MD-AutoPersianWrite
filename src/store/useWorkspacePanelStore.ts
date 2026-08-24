import { create } from 'zustand';

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 300;

interface WorkspacePanelState {
  isOpen: boolean;
  width: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setWidth: (width: number) => void;
}

export const useWorkspacePanelStore = create<WorkspacePanelState>((set) => ({
  isOpen: false,
  width: DEFAULT_WIDTH,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setWidth: (width) => set({ width: Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH) }),
}));
