import { create } from 'zustand';
import { useEditorStore } from './useEditorStore';
import { readTextFile } from '../lib/workspace/localWorkspaceFiles';
import type { WorkspaceFileReference } from '../types/workspaceFileReference';

export interface DocumentSession {
  id: string;
  fileName: string;
  markdown: string;
  isDirty: boolean;
  workspaceFile: WorkspaceFileReference | null;
  isWorkspaceFile: boolean;
  isNewWorkspaceFile: boolean;
  fileHandle?: FileSystemFileHandle | null;
  workspaceDirectory?: FileSystemDirectoryHandle | null;
}

type PersistedReference = WorkspaceFileReference | FileSystemFileHandle;

interface DocumentSessionState {
  sessions: DocumentSession[];
  activeSessionId: string | null;
  createSession: (session: Omit<DocumentSession, 'id'>) => string;
  activateSession: (id: string) => void;
  closeSession: (id: string) => void;
  updateSession: (id: string, draft: Partial<DocumentSession>) => void;
  updateActiveDraft: (draft: Partial<Pick<DocumentSession, 'markdown' | 'fileName' | 'isDirty'>>) => void;
  setWorkspaceFile: (reference: WorkspaceFileReference, isNew?: boolean) => void;
  syncWorkspaceRename: (reference: WorkspaceFileReference, name: string) => void;
  closeWorkspaceSessions: (reference: WorkspaceFileReference) => void;
  clearSession: () => void;
  markPersisted: (reference?: PersistedReference) => void;
  refreshOpenSessions: () => Promise<void>;
}

const createId = () => {
  if (typeof crypto === 'undefined') throw new Error('Secure randomness is unavailable in this environment.');
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const values = new Uint32Array(4);
  crypto.getRandomValues(values);
  return `session-${Array.from(values, (value) => value.toString(16).padStart(8, '0')).join('-')}`;
};

const snapshotEditor = (sessions: DocumentSession[], activeSessionId: string | null) => {
  if (!activeSessionId) return sessions;
  const editor = useEditorStore.getState();
  return sessions.map((session) => session.id === activeSessionId ? { ...session, markdown: editor.markdown, fileName: editor.fileName, isDirty: editor.isDirty } : session);
};

const applySessionToEditor = (session: DocumentSession | undefined) => {
  if (!session) {
    useEditorStore.setState({ markdown: '', fileName: '', isDirty: false, textareaRef: null });
    return;
  }
  useEditorStore.setState({ markdown: session.markdown, fileName: session.fileName, isDirty: session.isDirty, textareaRef: null });
};

const initialEditor = useEditorStore.getState();
const initialSession: DocumentSession = {
  id: createId(), fileName: initialEditor.fileName, markdown: initialEditor.markdown, isDirty: initialEditor.isDirty,
  workspaceFile: null, isWorkspaceFile: false, isNewWorkspaceFile: false, fileHandle: null, workspaceDirectory: null,
};

const matchesReference = (session: DocumentSession, reference: WorkspaceFileReference) =>
  session.workspaceFile?.entryId === reference.entryId &&
  session.workspaceFile?.workspaceId === reference.workspaceId &&
  session.workspaceFile?.providerId === reference.providerId;

export const useDocumentSessionStore = create<DocumentSessionState>((set, get) => ({
  sessions: [initialSession],
  activeSessionId: initialSession.id,

  createSession: (session) => {
    const id = createId();
    set((state) => {
      const sessions = snapshotEditor(state.sessions, state.activeSessionId);
      const next = [...sessions, { ...session, id }];
      applySessionToEditor(next[next.length - 1]);
      return { sessions: next, activeSessionId: id };
    });
    return id;
  },

  activateSession: (id) => set((state) => {
    const sessions = snapshotEditor(state.sessions, state.activeSessionId);
    const target = sessions.find((session) => session.id === id);
    if (!target) return state;
    applySessionToEditor(target);
    return { sessions, activeSessionId: id };
  }),

  closeSession: (id) => set((state) => {
    const sessions = snapshotEditor(state.sessions, state.activeSessionId).filter((session) => session.id !== id);
    if (!sessions.length) {
      applySessionToEditor(undefined);
      return { sessions: [], activeSessionId: null };
    }
    if (state.activeSessionId !== id) return { sessions };
    const closedIndex = state.sessions.findIndex((session) => session.id === id);
    const nextIndex = Math.min(Math.max(closedIndex - 1, 0), sessions.length - 1);
    const next = sessions[nextIndex];
    applySessionToEditor(next);
    return { sessions, activeSessionId: next.id };
  }),

  updateSession: (id, draft) => set((state) => ({ sessions: state.sessions.map((session) => session.id === id ? { ...session, ...draft } : session) })),

  updateActiveDraft: (draft) => set((state) => ({ sessions: state.sessions.map((session) => session.id === state.activeSessionId ? { ...session, ...draft } : session) })),

  setWorkspaceFile: (reference, isNew = false) => set((state) => ({
    sessions: state.sessions.map((session) => session.id === state.activeSessionId ? { ...session, workspaceFile: reference, fileHandle: null, isWorkspaceFile: true, isNewWorkspaceFile: isNew } : session),
  })),

  syncWorkspaceRename: (reference, name) => set((state) => {
    const sessions = state.sessions.map((session) => matchesReference(session, reference)
      ? { ...session, fileName: name, workspaceFile: { ...session.workspaceFile!, name } }
      : session);
    const active = sessions.find((session) => session.id === state.activeSessionId);
    if (active) useEditorStore.setState({ fileName: active.fileName });
    return { sessions };
  }),

  closeWorkspaceSessions: (reference) => set((state) => {
    const sessions = snapshotEditor(state.sessions, state.activeSessionId);
    const affected = sessions.filter((session) => matchesReference(session, reference));
    if (!affected.length) return state;
    const remaining = sessions.filter((session) => !matchesReference(session, reference));
    if (!remaining.length) {
      const fallback: DocumentSession = { id: createId(), fileName: 'untitled.md', markdown: '', isDirty: false, workspaceFile: null, isWorkspaceFile: false, isNewWorkspaceFile: false, fileHandle: null, workspaceDirectory: null };
      applySessionToEditor(fallback);
      return { sessions: [fallback], activeSessionId: fallback.id };
    }
    const activeWasClosed = affected.some((session) => session.id === state.activeSessionId);
    if (!activeWasClosed) return { sessions: remaining };
    const next = remaining[remaining.length - 1];
    applySessionToEditor(next);
    return { sessions: remaining, activeSessionId: next.id };
  }),

  clearSession: () => set((state) => ({
    sessions: state.sessions.map((session) => session.id === state.activeSessionId ? { ...session, workspaceFile: null, fileHandle: null, isWorkspaceFile: false, isNewWorkspaceFile: false } : session),
  })),

  markPersisted: (reference) => set((state) => {
    const active = state.sessions.find((session) => session.id === state.activeSessionId);
    if (!active) return state;
    const editor = useEditorStore.getState();
    const isFileHandle = reference && 'getFile' in reference;
    const nextSessions = state.sessions.map((session) => session.id === state.activeSessionId ? {
      ...session,
      markdown: editor.markdown,
      fileName: editor.fileName,
      ...(isFileHandle ? { fileHandle: reference as FileSystemFileHandle } : { workspaceFile: reference ?? session.workspaceFile, fileHandle: null }),
      isWorkspaceFile: true,
      isNewWorkspaceFile: false,
      isDirty: false,
    } : session);
    useEditorStore.setState({ isDirty: false });
    return { sessions: nextSessions };
  }),

  refreshOpenSessions: async () => {
    const { sessions, activeSessionId } = get();
    const refreshed = await Promise.all(sessions.map(async (session) => {
      if (!session.fileHandle) return session;
      try {
        const markdown = await readTextFile(session.fileHandle);
        return { ...session, markdown, isDirty: false };
      } catch {
        return session;
      }
    }));
    set({ sessions: refreshed });
    const active = refreshed.find((session) => session.id === activeSessionId);
    if (active) applySessionToEditor(active);
  },
}));
