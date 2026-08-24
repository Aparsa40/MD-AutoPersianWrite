import { create } from 'zustand';
import { listLocalWorkspaces } from '../lib/workspace/workspaceRegistry';
import type { WorkspaceInfo } from '../types/workspace';

interface WorkspaceState {
  activeWorkspace: WorkspaceInfo | null;
  isPanelOpen: boolean;
  panelWidth: number;
  setActiveWorkspace: (workspace: WorkspaceInfo) => void;
  clearActiveWorkspace: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setPanelWidth: (width: number) => void;
  restoreActiveWorkspace: () => Promise<void>;
}

const ACTIVE_WORKSPACE_KEY = 'md-autopersianwrite-active-workspace';
const PANEL_OPEN_KEY = 'md-autopersianwrite-workspace-panel-open';
const PANEL_WIDTH_KEY = 'md-autopersianwrite-workspace-panel-width';

const readLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

const readPanelWidth = (): number => {
  const value = Number(readLocalStorage(PANEL_WIDTH_KEY));
  return Number.isFinite(value) ? Math.min(560, Math.max(260, value)) : 340;
};

const readPanelOpen = (): boolean => readLocalStorage(PANEL_OPEN_KEY) === 'true';
const readActiveWorkspaceId = (): string | null => readLocalStorage(ACTIVE_WORKSPACE_KEY);

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,
  isPanelOpen: readPanelOpen(),
  panelWidth: readPanelWidth(),

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace, isPanelOpen: true });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id);
      window.localStorage.setItem(PANEL_OPEN_KEY, 'true');
    }
  },

  clearActiveWorkspace: () => {
    set({ activeWorkspace: null });
    if (typeof window !== 'undefined') window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  },

  openPanel: () => {
    set({ isPanelOpen: true });
    if (typeof window !== 'undefined') window.localStorage.setItem(PANEL_OPEN_KEY, 'true');
  },

  closePanel: () => {
    set({ isPanelOpen: false });
    if (typeof window !== 'undefined') window.localStorage.setItem(PANEL_OPEN_KEY, 'false');
  },

  setPanelWidth: (width) => {
    const next = Math.min(560, Math.max(260, width));
    set({ panelWidth: next });
    if (typeof window !== 'undefined') window.localStorage.setItem(PANEL_WIDTH_KEY, String(next));
  },

  restoreActiveWorkspace: async () => {
    const workspaceId = readActiveWorkspaceId();
    if (!workspaceId) return;

    try {
      const workspaces = await listLocalWorkspaces();
      const workspace = workspaces.find((item) => item.id === workspaceId);
      if (workspace) {
        // Restore the remembered workspace metadata only. Access to the directory
        // is revalidated from a user gesture before the manager starts listing it.
        set({ activeWorkspace: workspace });
      } else if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      }
    } catch {
      // A stale/unavailable handle must not produce a startup notification.
    }
  },
}));
