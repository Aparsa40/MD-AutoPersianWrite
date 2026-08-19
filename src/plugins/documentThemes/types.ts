export type DocumentThemeId = 'classic' | 'github' | 'academic' | 'modern';

export interface DocumentThemeDefinition {
  id: DocumentThemeId;
  name: string;
  description: string;
}
