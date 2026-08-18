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
  const resetEditor = useEditorStore((state) => state.resetEditor);
  const { fileHandle, workspaceDirectory, isWorkspaceFile, isNewWorkspaceFile, clearSession, markPersisted } =
    useDocumentSessionStore();
  const [isSaving, setIsSaving] = useState(false);

  const closeDocument = useCallback(async () => {
    const needsSave = isWorkspaceFile && (isNewWorkspaceFile || isDirty);

    if (needsSave) {
      const picker = getSaveFilePicker();
      if (!picker) {
        window.alert('مرورگر فعلی از پنجره ذخیره فایل پشتیبانی نمی‌کند.');
        return;
      }

      setIsSaving(true);
      try {
        const handle = await picker({
          suggestedName: fileName?.trim() || 'document.md',
          startIn: workspaceDirectory ?? undefined,
        });
        await writeTextFile(handle, markdown);
        markPersisted(handle);
        useEditorStore.setState({ isDirty: false, fileName: handle.name });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          window.alert(error instanceof Error ? error.message : 'ذخیره فایل انجام نشد.');
        }
        return;
      } finally {
        setIsSaving(false);
      }
    }

    clearSession();
    resetEditor();
  }, [clearSession, fileName, isDirty, isNewWorkspaceFile, isWorkspaceFile, markdown, markPersisted, resetEditor, workspaceDirectory]);

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
