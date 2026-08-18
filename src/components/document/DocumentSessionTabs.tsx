import React, { useEffect, useState } from 'react';
import { useDocumentSessionStore, type DocumentSession } from '../../store/useDocumentSessionStore';
import { writeTextFile } from '../../lib/workspace/localWorkspaceFiles';

type FileSystemSavePickerWindow = Window & {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    startIn?: FileSystemDirectoryHandle;
  }) => Promise<FileSystemFileHandle>;
};

const getSaveFilePicker = () => {
  const picker = (window as FileSystemSavePickerWindow).showSaveFilePicker;
  return typeof picker === 'function' ? picker.bind(window) : null;
};

const saveSession = async (session: DocumentSession) => {
  const picker = getSaveFilePicker();
  if (!picker) {
    window.alert('مرورگر فعلی از پنجره ذخیره فایل پشتیبانی نمی‌کند.');
    return false;
  }

  try {
    const handle = await picker({
      suggestedName: session.fileName?.trim() || 'document.md',
      startIn: session.workspaceDirectory ?? undefined,
    });
    await writeTextFile(handle, session.markdown);
    return { handle };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return false;
    window.alert(error instanceof Error ? error.message : 'ذخیره فایل انجام نشد.');
    return false;
  }
};

export const DocumentSessionTabs: React.FC = () => {
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const activateSession = useDocumentSessionStore((state) => state.activateSession);
  const closeSession = useDocumentSessionStore((state) => state.closeSession);
  const updateActiveDraft = useDocumentSessionStore((state) => state.updateActiveDraft);
  const [closingId, setClosingId] = useState<string | null>(null);

  const markdown = useDocumentSessionStore(() => '');
  void markdown;

  useEffect(() => {
    // The active editor is mirrored into the active session by MainLayout's effect.
    return undefined;
  }, [activeSessionId]);

  if (!sessions.length) return null;

  const handleClose = async (session: DocumentSession) => {
    if (closingId) return;
    setClosingId(session.id);

    try {
      let current = session;
      if (session.id === activeSessionId) {
        const editor = await import('../../store/useEditorStore');
        const state = editor.useEditorStore.getState();
        current = { ...session, markdown: state.markdown, fileName: state.fileName, isDirty: state.isDirty };
      }

      if (current.isNewWorkspaceFile || current.isDirty) {
        const saved = await saveSession(current);
        if (!saved) return;
        updateActiveDraft({ markdown: current.markdown, fileName: saved.handle.name, isDirty: false });
        if (current.id === activeSessionId) {
          useDocumentSessionStore.setState((state) => ({
            sessions: state.sessions.map((item) =>
              item.id === current.id
                ? { ...item, fileHandle: saved.handle, fileName: saved.handle.name, isDirty: false, isNewWorkspaceFile: false, isWorkspaceFile: true }
                : item,
            ),
          }));
        }
      }

      closeSession(session.id);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="flex h-10 shrink-0 items-center overflow-x-auto border-b border-border bg-surface px-2" dir="rtl">
      {sessions.map((session) => {
        const active = session.id === activeSessionId;
        return (
          <div
            key={session.id}
            className={`group flex h-8 min-w-0 max-w-56 items-center border-l border-border px-2 text-sm ${active ? 'bg-bg font-medium' : 'hover:bg-bg'}`}
          >
            <button
              type="button"
              className="min-w-0 flex-1 truncate px-1 text-right"
              onClick={() => activateSession(session.id)}
              title={session.fileName}
            >
              {session.fileName || 'بدون نام'}{session.isDirty ? ' •' : ''}
            </button>
            <button
              type="button"
              onClick={() => void handleClose(session)}
              disabled={closingId === session.id}
              aria-label={`بستن ${session.fileName}`}
              title="بستن سند"
              className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-base leading-none text-text-muted hover:bg-surface hover:text-text-main disabled:opacity-50"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};
