import type { DocumentThemeDefinition } from './types';

export const documentThemes: DocumentThemeDefinition[] = [
  {
    id: 'classic',
    name: 'کلاسیک',
    description: 'سبک خوانا و متعادل برای اسناد روزمره.',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'سبک مستندات فنی با کنتراست و ساختار واضح.',
  },
  {
    id: 'academic',
    name: 'آکادمیک',
    description: 'سبک رسمی برای مقاله، گزارش و مستندات پژوهشی.',
  },
  {
    id: 'modern',
    name: 'مدرن',
    description: 'سبک مدرن با کارت‌ها، سایه و فاصله‌گذاری بیشتر.',
  },
];

export const getDocumentTheme = (id: DocumentThemeDefinition['id']) =>
  documentThemes.find((theme) => theme.id === id) ?? documentThemes[0];
