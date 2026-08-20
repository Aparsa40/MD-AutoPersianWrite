export type DocumentThemeId = 'classic' | 'github' | 'academic' | 'modern' | 'black-white' | 'navy-white';

export interface DocumentThemeDefinition {
  id: DocumentThemeId;
  name: string;
  description: string;
}
