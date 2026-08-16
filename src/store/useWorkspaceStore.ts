import { create } from 'zustand';
import type { WorkspaceInfo } from '../types/workspace';

interface WorkspaceState {
  activeWorkspace: WorkspaceInfo | null;
  setActiveWorkspace: (workspace: WorkspaceInfo) => void;
  clearActiveWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  clearActiveWorkspace: () => set({ activeWorkspace: null }),
}));
