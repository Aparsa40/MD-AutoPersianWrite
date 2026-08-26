import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { getWorkspaceProvider } from '../../lib/workspace/providerRegistry';

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{ description?: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle>;
};

interface WorkspaceToolbarProps {
  workspaceName: string;
  currentPath: string[];
  selectedCount: number;
  canPaste: boolean;
  clipboardLabel?: string;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onPaste: () => void;
  onRefresh: () => void;
  onClearSelection: () => void;
}

const savePickerWindow = () => window as SavePickerWindow;
const ensureMarkdownExtension = (name: string) => /\.[^./\\]+$/.test(name) ? name : `${name}.md`;

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  workspaceName,
  currentPath,
  selectedCount,
  canPaste,
  clipboardLabel,
  onCreateFile,
  onCreateFolder,
  onPaste,
  onRefresh,
  onClearSelection,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const markdown = useEditorStore((state) => state.markdown);
  const fileName = useEditorStore((state) => state.fileName);
  const activeSession = useDocumentSessionStore((state) => state.sessions.find((session) => session.id === state.activeSessionId));
  const markPersisted = useDocumentSessionStore((state) => state.markPersisted);
  const updateSession = useDocumentSessionStore((state) => state.updateSession);
  const closeWorkspaceSessions = useDocumentSessionStore((state) => state.closeWorkspaceSessions);

  const saveAs = async () => {
    const picker = savePickerWindow();
    const suggestedName = ensureMarkdownExtension(fileName || 'document');
    if (!picker.showSaveFilePicker) {
      window.alert('مرورگر فعلی از پنجره انتخاب محل ذخیره پشتیبانی نمی‌کند.');
      return;
    }
    try {
      const handle = await picker.showSaveFilePicker({
        suggestedName,
        types: [{ description: 'Markdown document', accept: { 'text/markdown': ['.md', '.markdown'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(markdown);
      await writable.close();
      markPersisted(handle);
      if (activeSession) {
        updateSession(activeSession.id, { fileHandle: handle, fileName: handle.name, isDirty: false, isWorkspaceFile: true, isNewWorkspaceFile: false });
      }
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) {
        window.alert(cause instanceof Error ? cause.message : 'ذخیره با نام انجام نشد.');
      }
    }
  };

  const saveCurrent = async () => {
    if (!activeSession?.workspaceFile) {
      await saveAs();
      return;
    }
    try {
      const provider = getWorkspaceProvider(activeSession.workspaceFile.providerId);
      if (!provider) throw new Error('Provider فضای کاری پیدا نشد.');
      await provider.writeFile(activeSession.workspaceFile.entryId, new TextEncoder().encode(markdown));
      updateSession(activeSession.id, { isDirty: false, isNewWorkspaceFile: false });
      markPersisted();
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'ذخیره فایل انجام نشد.');
    }
  };

  const deleteSelected = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
  };

  const selectAll = () => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-workspace-entry]'));
    rows.forEach((row, index) => row.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: index > 0 })));
  };

  const run = (action: () => void | Promise<void>) => {
    void action();
    setMenuOpen(false);
  };

  return (
    <div className="shrink-0 border-b border-border bg-surface" dir="rtl">
      <div className="relative flex items-center border-b border-border px-2 py-1.5">
        <div className="relative">
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex items-center gap-1 rounded-md border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-text transition hover:bg-surface" aria-haspopup="menu" aria-expanded={menuOpen} title="ابزارهای Workspace">
            Tools Workspace <span aria-hidden="true">⌄</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 min-w-52 overflow-hidden rounded-md border border-border bg-surface p-1 shadow-lg" role="menu">
              <button type="button" onClick={() => run(saveAs)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">ذخیره با نام…</button>
              <button type="button" onClick={() => run(onCreateFile)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">فایل جدید</button>
              <button type="button" onClick={() => run(onCreateFolder)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">پوشه جدید</button>
              <button type="button" onClick={() => run(saveCurrent)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">ذخیره</button>
              {canPaste && <button type="button" onClick={() => run(onPaste)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" title={clipboardLabel ?? 'Paste'} role="menuitem">Paste</button>}
              <button type="button" onClick={() => run(onRefresh)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">تازه‌سازی</button>
              <button type="button" onClick={() => run(deleteSelected)} className="block w-full rounded px-3 py-1.5 text-right text-xs text-red-700 hover:bg-bg dark:text-red-300" role="menuitem">حذف {selectedCount > 0 ? `(${selectedCount})` : ''}</button>
              <button type="button" onClick={() => run(selectAll)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">انتخاب</button>
              {selectedCount > 0 && <button type="button" onClick={() => run(onClearSelection)} className="block w-full rounded px-3 py-1.5 text-right text-xs hover:bg-bg" role="menuitem">لغو انتخاب</button>}
            </div>
          )}
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-1 px-3 py-2 text-[11px] text-text-muted">
        <span className="shrink-0 font-semibold text-text">{workspaceName}</span>
        {currentPath.map((part, index) => <React.Fragment key={`${part}-${index}`}><span aria-hidden="true">/</span><span className="min-w-0 truncate">{part}</span></React.Fragment>)}
      </div>
      {selectedCount > 0 && <div className="px-3 pb-1.5 text-[10px] text-text-muted">{selectedCount} مورد انتخاب شده</div>}
    </div>
  );
};

export type WorkspaceEntryAction = 'copy' | 'cut' | 'rename' | 'delete' | 'paste';
