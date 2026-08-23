import { create } from 'zustand';
import { useEditorStore } from './useEditorStore';

export interface DocumentSession {
  id: string;
  fileName: string;
  markdown: string;
  isDirty: boolean;
  fileHandle: FileSystemFileHandle | null;
  workspaceDirectory: FileSystemDirectoryHandle | null;
  isWorkspaceFile: boolean;
  isNewWorkspaceFile: boolean;
}

interface DocumentSessionState {
  sessions: DocumentSession[];
  activeSessionId: string | null;
  createSession: (session: Omit<DocumentSession, 'id'>) => string;
  activateSession: (id: string) => void;
  closeSession: (id: string) => void;
  updateSession: (id: string, draft: Partial<DocumentSession>) => void;
  updateActiveDraft: (draft: Partial<Pick<DocumentSession, 'markdown' | 'fileName' | 'isDirty'>>) => void;
  setWorkspaceFile: (fileHandle: FileSystemFileHandle, workspaceDirectory: FileSystemDirectoryHandle, isNew?: boolean) => void;
  clearSession: () => void;
  markPersisted: (fileHandle?: FileSystemFileHandle) => void;
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
  id: createId(),
  fileName: initialEditor.fileName,
  markdown: initialEditor.markdown,
  isDirty: initialEditor.isDirty,
  fileHandle: null,
  workspaceDirectory: null,
  isWorkspaceFile: false,
  isNewWorkspaceFile: false,
};

export const useDocumentSessionStore = create<DocumentSessionState>((set) => ({
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

  updateActiveDraft: (draft) => set((state) => ({
    sessions: state.sessions.map((session) => session.id === state.activeSessionId ? { ...session, ...draft } : session),
  })),

  setWorkspaceFile: (fileHandle, workspaceDirectory, isNew = false) => set((state) => ({
    sessions: state.sessions.map((session) => session.id === state.activeSessionId ? { ...session, fileHandle, workspaceDirectory, isWorkspaceFile: true, isNewWorkspaceFile: isNew } : session),
  })),

  clearSession: () => set((state) => ({
    sessions: state.sessions.map((session) => session.id === state.activeSessionId ? { ...session, fileHandle: null, workspaceDirectory: null, isWorkspaceFile: false, isNewWorkspaceFile: false } : session),
  })),

  markPersisted: (fileHandle) => set((state) => {
    const active = state.sessions.find((session) => session.id === state.activeSessionId);
    if (!active) return state;
    const editor = useEditorStore.getState();
    const nextSessions = state.sessions.map((session) => session.id === state.activeSessionId ? {
      ...session,
      markdown: editor.markdown,
      fileName: editor.fileName,
      fileHandle: fileHandle ?? session.fileHandle,
      isWorkspaceFile: true,
      isNewWorkspaceFile: false,
      isDirty: false,
    } : session);
    useEditorStore.setState({ isDirty: false });
    return { sessions: nextSessions };
  }),

  refreshOpenSessions: async () => {
    const state = useDocumentSessionStore.getState();
    const current = snapshotEditor(state.sessions, state.activeSessionId);
    const refreshed = await Promise.all(current.map(async (session) => {
      if (!session.isWorkspaceFile || !session.fileHandle) return session;
      try {
        const file = await session.fileHandle.getFile();
        return { ...session, fileName: file.name, markdown: await file.text(), isDirty: false };
      } catch {
        return session;
      }
    }));

    set((nextState) => {
      const active = refreshed.find((session) => session.id === nextState.activeSessionId);
      applySessionToEditor(active);
      return { sessions: refreshed };
    });
  },
}));
