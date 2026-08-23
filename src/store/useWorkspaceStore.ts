import { create } from 'zustand';
import { listLocalWorkspaces } from '../lib/workspace/workspaceRegistry';
import type { WorkspaceInfo } from '../types/workspace';

interface WorkspaceState {
  activeWorkspace: WorkspaceInfo | null;
  setActiveWorkspace: (workspace: WorkspaceInfo) => void;
  clearActiveWorkspace: () => void;
  restoreActiveWorkspace: () => Promise<void>;
}

const ACTIVE_WORKSPACE_KEY = 'md-autopersianwrite-active-workspace';

const readActiveWorkspaceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY);
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace });
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
