import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore, type DocumentSession } from '../../store/useDocumentSessionStore';
import { writeTextFile } from '../../lib/workspace/localWorkspaceFiles';

type FileSystemSavePickerWindow = Window & {
  showSaveFilePicker?: (options?: { suggestedName?: string; startIn?: FileSystemDirectoryHandle }) => Promise<FileSystemFileHandle>;
};

const getSaveFilePicker = () => {
  const picker = (window as FileSystemSavePickerWindow).showSaveFilePicker;
  return typeof picker === 'function' ? picker.bind(window) : null;
};

const saveSession = async (session: DocumentSession) => {
  const picker = getSaveFilePicker();
  if (!picker) {
    window.alert('مرورگر فعلی از پنجره ذخیره فایل پشتیبانی نمی‌کند.');
    return null;
  }
  try {
    const handle = await picker({
      suggestedName: session.fileName?.trim() || 'document.md',
      startIn: session.workspaceDirectory ?? undefined,
    });
    await writeTextFile(handle, session.markdown);
    return handle;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null;
    window.alert(error instanceof Error ? error.message : 'ذخیره فایل انجام نشد.');
    return null;
  }
};

export const DocumentSessionTabs: React.FC = () => {
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const activateSession = useDocumentSessionStore((state) => state.activateSession);
  const closeSession = useDocumentSessionStore((state) => state.closeSession);
  const updateSession = useDocumentSessionStore((state) => state.updateSession);
  const markdown = useEditorStore((state) => state.markdown);
  const fileName = useEditorStore((state) => state.fileName);
  const isDirty = useEditorStore((state) => state.isDirty);
  const [closingId, setClosingId] = useState<string | null>(null);

  if (!sessions.length) return null;

  const handleClose = async (session: DocumentSession) => {
    if (closingId) return;
    setClosingId(session.id);
    try {
      const current = session.id === activeSessionId ? { ...session, markdown, fileName, isDirty } : session;
      if (current.isNewWorkspaceFile || current.isDirty) {
        const handle = await saveSession(current);
        if (!handle) return;
        updateSession(current.id, {
          fileHandle: handle,
          fileName: handle.name,
          isDirty: false,
          isNewWorkspaceFile: false,
          isWorkspaceFile: true,
        });
        if (current.id === activeSessionId) {
          useEditorStore.setState({ fileName: handle.name, isDirty: false });
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
