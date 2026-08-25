import React, { useState } from 'react';

interface WorkspaceToolbarProps {
  workspaceName: string;
  currentPath: string[];
  selectedCount: number;
  canPaste: boolean;
  clipboardLabel?: string;
  onSave: () => void;
  onDelete: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onInsertFile: () => void;
  onInsertFolder: () => void;
  onPaste: () => void;
  onRefresh: () => void;
  onNavigateUp: () => void;
  onClearSelection: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  workspaceName,
  currentPath,
  selectedCount,
  canPaste,
  clipboardLabel,
  onSave,
  onDelete,
  onCreateFile,
  onCreateFolder,
  onInsertFile,
  onInsertFolder,
  onPaste,
  onRefresh,
  onNavigateUp,
  onClearSelection,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const run = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <div className="shrink-0 border-b border-border bg-surface" dir="rtl">
      <div className="relative flex items-center border-b border-border px-2 py-1.5">
        <div
          className="relative"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-1 rounded-md border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-text transition hover:bg-surface"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="ابزارهای Workspace"
          >
            Tools Workspace
            <span aria-hidden="true">⌄</span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 min-w-44 overflow-hidden rounded-md border border-border bg-surface p-1 shadow-lg"
              role="menu"
              onMouseEnter={() => setMenuOpen(true)}
            >
              <button type="button" onClick={() => run(onSave)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">ذخیره با نام…</button>
              <button type="button" onClick={() => run(onCreateFile)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">+ فایل جدید</button>
              <button type="button" onClick={() => run(onCreateFolder)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">+ پوشه جدید</button>
              <button type="button" onClick={() => run(onInsertFile)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">درج فایل</button>
              <button type="button" onClick={() => run(onInsertFolder)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">درج پوشه</button>
              <button type="button" onClick={() => run(onPaste)} disabled={!canPaste} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg disabled:cursor-not-allowed disabled:opacity-35" title={clipboardLabel ?? 'Paste'} role="menuitem">Paste</button>
              <button type="button" onClick={() => run(onRefresh)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">تازه‌سازی</button>
              <button type="button" onClick={() => run(onDelete)} disabled={!selectedCount} className="block w-full rounded px-3 py-1.5 text-right text-xs text-red-700 hover:bg-bg disabled:cursor-not-allowed disabled:opacity-35 dark:text-red-300" role="menuitem">حذف {selectedCount > 0 ? `(${selectedCount})` : ''}</button>
              {selectedCount > 0 && <button type="button" onClick={() => run(onClearSelection)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">لغو انتخاب</button>}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-1 px-3 py-2 text-[11px] text-text-muted">
        <span className="shrink-0 font-semibold text-text">{workspaceName}</span>
        {currentPath.map((part, index) => (
          <React.Fragment key={`${part}-${index}`}>
            <span aria-hidden="true">/</span>
            <span className="min-w-0 truncate">{part}</span>
          </React.Fragment>
        ))}
        {currentPath.length > 0 && <button type="button" onClick={onNavigateUp} className="mr-auto rounded px-2 py-0.5 hover:bg-bg" title="پوشه والد">↩</button>}
      </div>
      {selectedCount > 0 && <div className="px-3 pb-1.5 text-[10px] text-text-muted">{selectedCount} مورد انتخاب شده</div>}
    </div>
  );
};

export type WorkspaceEntryAction = 'copy' | 'cut' | 'rename' | 'delete' | 'paste';
