import { create } from 'zustand';
import type { DocumentThemeId } from '../plugins/documentThemes/types';

interface DocumentThemeState {
  activeTheme: DocumentThemeId;
  setActiveTheme: (theme: DocumentThemeId) => void;
}

export const useDocumentThemeStore = create<DocumentThemeState>((set) => ({
  activeTheme: 'classic',
  setActiveTheme: (activeTheme) => set({ activeTheme }),
}));
