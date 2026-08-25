import React, { useEffect, useState } from 'react';
import { documentThemes } from '../../plugins/documentThemes';
import type { DocumentThemeId } from '../../plugins/documentThemes';
import { useDocumentThemeStore } from '../../store/useDocumentThemeStore';
import '../../plugins/documentThemes/runtime.css';

interface DocumentStyleMenuProps {
  embedded?: boolean;
  onSelect?: () => void;
}

export const DocumentStyleMenu: React.FC<DocumentStyleMenuProps> = ({ embedded = false, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTheme = useDocumentThemeStore((state) => state.activeTheme);
  const setActiveTheme = useDocumentThemeStore((state) => state.setActiveTheme);

  useEffect(() => {
    document.documentElement.dataset.documentTheme = activeTheme;
  }, [activeTheme]);

  const selectTheme = (theme: DocumentThemeId) => {
    setActiveTheme(theme);
    setIsOpen(false);
    onSelect?.();
  };

  const menu = (
    <div className={`${embedded ? 'absolute right-full top-0 mr-1' : 'absolute right-0'} z-50 w-72 rounded-lg border border-border bg-surface p-2 shadow-xl`} role="menu">
      <div className="px-3 py-2 text-right">
        <div className="text-sm font-semibold text-text">تم سند</div>
        <div className="mt-0.5 text-xs text-text-muted">ظاهر Preview را بدون تغییر متن Markdown انتخاب کنید.</div>
      </div>
      <div className="mt-1 space-y-1">
        {documentThemes.map((theme) => {
          const active = activeTheme === theme.id;
          return (
            <div key={theme.id} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-bg" role="menuitem">
              <button type="button" onClick={() => selectTheme(theme.id)} className={`min-w-20 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${active ? 'border-emerald-600 bg-emerald-600 text-white shadow-md' : 'border-border bg-surface text-text-muted shadow-sm hover:bg-bg'}`} aria-pressed={active}>{active ? '✓ فعال' : 'فعال'}</button>
              <div className="min-w-0 flex-1 text-right"><div className="text-sm font-medium text-text">{theme.name}</div><div className="truncate text-xs text-text-muted">{theme.description}</div></div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 border-t border-border px-3 pt-2 text-right text-[11px] text-text-muted">قابلیت‌های مستقل مانند Mermaid و Callout در ساختار Plugin جداگانه مدیریت می‌شوند.</div>
    </div>
  );

  if (embedded) {
    return (
      <div className="relative">
        <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex w-full items-center justify-between rounded px-4 py-2 text-right text-sm font-medium hover:bg-bg" aria-expanded={isOpen} aria-haspopup="menu">
          <span>سبک سند / Document Theme</span><span aria-hidden="true">‹</span>
        </button>
        {isOpen && menu}
      </div>
    );
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen((open) => !open)} className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg" aria-expanded={isOpen} aria-haspopup="menu">سبک سند</button>
      {isOpen && menu}
    </div>
  );
};
