import React, { useCallback, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
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

export const DocumentCloseButton: React.FC = () => {
  const markdown = useEditorStore((state) => state.markdown);
  const fileName = useEditorStore((state) => state.fileName);
  const isDirty = useEditorStore((state) => state.isDirty);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const activeSession = useDocumentSessionStore((state) =>
    state.sessions.find((session) => session.id === state.activeSessionId),
  );
  const closeSession = useDocumentSessionStore((state) => state.closeSession);
  const markPersisted = useDocumentSessionStore((state) => state.markPersisted);
  const [isSaving, setIsSaving] = useState(false);

  const closeDocument = useCallback(async () => {
    if (!activeSessionId || !activeSession) return;

    const needsSave = isDirty || activeSession.isNewWorkspaceFile;

    if (needsSave) {
      setIsSaving(true);
      try {
        if (activeSession.fileHandle) {
          await writeTextFile(activeSession.fileHandle, markdown);
          markPersisted(activeSession.fileHandle);
        } else {
          const picker = getSaveFilePicker();
          if (!picker) {
            window.alert('مرورگر فعلی از پنجره ذخیره فایل پشتیبانی نمی‌کند.');
            return;
          }

          const handle = await picker({
            suggestedName: fileName?.trim() || 'document.md',
            startIn: activeSession.workspaceDirectory ?? undefined,
          });
          await writeTextFile(handle, markdown);
          markPersisted(handle);
          useEditorStore.setState({ isDirty: false, fileName: handle.name });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Canceling the Windows Save dialog means discard the unsaved changes
          // and continue the Close action requested by the user.
        } else {
          window.alert(error instanceof Error ? error.message : 'ذخیره فایل انجام نشد.');
          return;
        }
      } finally {
        setIsSaving(false);
      }
    }

    closeSession(activeSessionId);
  }, [activeSession, activeSessionId, fileName, isDirty, markdown, markPersisted, closeSession]);

  return (
    <button
      type="button"
      onClick={() => void closeDocument()}
      disabled={isSaving}
      aria-label="بستن سند"
      title="بستن سند"
      className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded text-lg leading-none text-text-muted transition-colors hover:bg-surface hover:text-text-main disabled:opacity-50"
    >
      ×
    </button>
  );
};
