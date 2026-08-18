import { create } from 'zustand';

interface DocumentSessionState {
  fileHandle: FileSystemFileHandle | null;
  workspaceDirectory: FileSystemDirectoryHandle | null;
  isWorkspaceFile: boolean;
  isNewWorkspaceFile: boolean;
  setWorkspaceFile: (
    fileHandle: FileSystemFileHandle,
    workspaceDirectory: FileSystemDirectoryHandle,
    isNew?: boolean,
  ) => void;
  clearSession: () => void;
  markPersisted: (fileHandle?: FileSystemFileHandle) => void;
}

export const useDocumentSessionStore = create<DocumentSessionState>((set) => ({
  fileHandle: null,
  workspaceDirectory: null,
  isWorkspaceFile: false,
  isNewWorkspaceFile: false,

  setWorkspaceFile: (fileHandle, workspaceDirectory, isNew = false) =>
    set({
      fileHandle,
      workspaceDirectory,
      isWorkspaceFile: true,
      isNewWorkspaceFile: isNew,
    }),

  clearSession: () =>
    set({
      fileHandle: null,
      workspaceDirectory: null,
      isWorkspaceFile: false,
      isNewWorkspaceFile: false,
    }),

  markPersisted: (fileHandle) =>
    set((state) => ({
      fileHandle: fileHandle ?? state.fileHandle,
      isWorkspaceFile: true,
      isNewWorkspaceFile: false,
    })),
}));
