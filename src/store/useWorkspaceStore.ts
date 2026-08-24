import { create } from 'zustand';
import { listLocalWorkspaces } from '../lib/workspace/workspaceRegistry';
import type { WorkspaceInfo } from '../types/workspace';

interface WorkspaceState {
  activeWorkspace: WorkspaceInfo | null;
  isPanelOpen: boolean;
  setActiveWorkspace: (workspace: WorkspaceInfo) => void;
  clearActiveWorkspace: () => void;
  openPanel: () => void;
  closePanel: () => void;
  restoreActiveWorkspace: () => Promise<void>;
}

const ACTIVE_WORKSPACE_KEY = 'md-autopersianwrite-active-workspace';

const readActiveWorkspaceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY);
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,
  isPanelOpen: false,

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace, isPanelOpen: true });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id);
    }
  },

  clearActiveWorkspace: () => {
    set({ activeWorkspace: null });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    }
  },

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),

  restoreActiveWorkspace: async () => {
    const workspaceId = readActiveWorkspaceId();
    if (!workspaceId) return;

    try {
      const workspaces = await listLocalWorkspaces();
      const workspace = workspaces.find((item) => item.id === workspaceId);
      if (workspace) {
        set({ activeWorkspace: workspace });
      } else if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      }
    } catch {
      // The persisted workspace remains registered; a later user action can retry access.
    }
  },
}));
