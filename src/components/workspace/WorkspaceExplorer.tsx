import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { createLocalWorkspaceProvider } from '../../lib/workspace/localWorkspaceProvider';
import type { WorkspaceEntry } from '../../types/workspaceProvider';
import type { WorkspaceFileReference } from '../../types/workspaceFileReference';

type TreeNode = WorkspaceEntry & { path: string };

type FileSystemSavePickerWindow = Window & {
  showSaveFilePicker?: (options?: { suggestedName?: string; startIn?: FileSystemDirectoryHandle }) => Promise<FileSystemFileHandle>;
};

const getSaveFilePicker = () => {
  const picker = (window as FileSystemSavePickerWindow).showSaveFilePicker;
  return typeof picker === 'function' ? picker.bind(window) : null;
};

const decodeText = (content: Uint8Array) => new TextDecoder().decode(content);
const encodeText = (content: string) => new TextEncoder().encode(content);

export const WorkspaceExplorer: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const activateSession = useDocumentSessionStore((state) => state.activateSession);
  const markPersisted = useDocumentSessionStore((state) => state.markPersisted);
  const setWorkspaceFile = useDocumentSessionStore((state) => state.setWorkspaceFile);
  const markdown = useEditorStore((state) => state.markdown);
  const fileName = useEditorStore((state) => state.fileName);
  const [entries, setEntries] = useState<TreeNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ entry: WorkspaceEntry; cut: boolean } | null>(null);

  const provider = useMemo(() => {
    if (!activeWorkspace || activeWorkspace.type !== 'local' || !activeWorkspace.handle) return null;
    return createLocalWorkspaceProvider(activeWorkspace);
  }, [activeWorkspace]);

  const parentId = currentPath.length ? currentPath.join('/') : null;

  const refresh = useCallback(async () => {
    if (!provider) {
      setEntries([]);
      return;
    }
    const result = await provider.list(parentId);
    setEntries(result.map((entry) => ({ ...entry, path: entry.id })));
  }, [provider, parentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const promptName = (message: string, initial = '') => {
    const value = window.prompt(message, initial)?.trim();
    return value || null;
  };

  const makeReference = (entry: WorkspaceEntry): WorkspaceFileReference => ({
    providerId: 'local',
    workspaceId: activeWorkspace!.id,
    entryId: entry.id,
    parentId: entry.parentId,
    name: entry.name,
  });

  const handleCreateFolder = async () => {
    const name = promptName('نام پوشه:');
    if (!provider || !name) return;
    await provider.createFolder(parentId, name);
    await refresh();
  };

  const handleCreateFile = async () => {
    const name = promptName('نام فایل:', 'document.md');
    if (!provider || !name) return;
    const entry = await provider.createFile(parentId, name);
    const reference = makeReference(entry);
    createSession({
      fileName: entry.name,
      markdown: '',
      isDirty: true,
      workspaceFile: reference,
      isWorkspaceFile: true,
      isNewWorkspaceFile: true,
    });
    await refresh();
  };

  const handleSaveFile = async () => {
    if (!provider || activeSessionId === null) return;
    const activeSession = sessions.find((session) => session.id === activeSessionId);
    if (activeSession?.workspaceFile && activeSession.workspaceFile.providerId === 'local') {
      await provider.writeFile(activeSession.workspaceFile.entryId, encodeText(markdown));
      markPersisted(activeSession.workspaceFile);
      await refresh();
      return;
    }

    const picker = getSaveFilePicker();
    if (!picker) {
      window.alert('مرورگر فعلی از ذخیره‌سازی فایل با پنجره انتخاب فایل پشتیبانی نمی‌کند.');
      return;
    }

    try {
      const handle = await picker({ suggestedName: fileName?.trim() || 'document.md', startIn: activeWorkspace?.handle });
      const writable = await handle.createWritable();
      await writable.write(markdown);
      await writable.close();
      useEditorStore.setState({ fileName: handle.name, isDirty: false });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'ذخیره فایل انجام نشد.');
    }
  };

  const handleOpen = async (entry: WorkspaceEntry) => {
    if (!provider) return;
    if (entry.type === 'folder') {
      setCurrentPath(entry.id.split('/').filter(Boolean));
      return;
    }

    const extension = entry.name.split('.').pop()?.toLowerCase();
    if (!['md', 'markdown', 'txt'].includes(extension ?? '')) {
      window.alert('فعلاً فقط فایل‌های متنی Markdown/TXT در Editor باز می‌شوند.');
      return;
    }

    const reference = makeReference(entry);
    const existing = sessions.find(
      (session) => session.workspaceFile?.providerId === reference.providerId
        && session.workspaceFile?.workspaceId === reference.workspaceId
        && session.workspaceFile?.entryId === reference.entryId,
    );
    if (existing) {
      activateSession(existing.id);
      return;
    }

    createSession({
      fileName: entry.name,
      markdown: decodeText(await provider.readFile(entry.id)),
      isDirty: false,
      workspaceFile: reference,
      isWorkspaceFile: true,
      isNewWorkspaceFile: false,
    });
  };

  const handleCopy = (entry: WorkspaceEntry, cut: boolean) => {
    setClipboard({ entry, cut });
  };

  const handlePaste = async () => {
    if (!provider || !clipboard) return;
    if (clipboard.cut) await provider.move(clipboard.entry.id, parentId);
    else await provider.copy(clipboard.entry.id, parentId);
    setClipboard(null);
    await refresh();
  };

  const handleRename = async (entry: WorkspaceEntry) => {
    const name = promptName('نام جدید:', entry.name);
    if (!provider || !name || name === entry.name) return;
    await provider.rename(entry.id, name);
    await refresh();
  };

  const handleDelete = async (entry: WorkspaceEntry) => {
    if (!provider || !window.confirm(`حذف «${entry.name}» انجام شود؟`)) return;
    await provider.delete(entry.id);
    await refresh();
  };

  if (!activeWorkspace) return null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-surface" dir="rtl">
      <div className="border-b border-border p-3">
        <div className="text-sm font-semibold">{activeWorkspace.name}</div>
        <div className="mt-2 flex flex-wrap gap-1">
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => void handleSaveFile()} title="Save">Save</button>
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => void handleCreateFile()} title="New File">New File</button>
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => void handleCreateFolder()} title="New Folder">New Folder</button>
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => void handlePaste()} disabled={!clipboard}>Paste</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 text-sm">
        <div className="mb-2 flex items-center gap-1 text-text-muted">
          <button className="hover:text-primary disabled:opacity-40" disabled={!currentPath.length} onClick={() => setCurrentPath((path) => path.slice(0, -1))}>←</button>
          <button className="hover:text-primary" onClick={() => setCurrentPath([])}>{activeWorkspace.name}</button>
          {currentPath.map((part) => <span key={part}>/ {part}</span>)}
        </div>
        {entries.map((entry) => {
          const isNewCurrentFile = entry.type === 'file' && sessions.some(
            (session) => session.id === activeSessionId && session.workspaceFile?.entryId === entry.id && session.isNewWorkspaceFile,
          );
          return (
            <div key={entry.path} className="group flex items-center gap-1 rounded px-2 py-1 hover:bg-bg">
              <button className="min-w-0 flex-1 truncate text-right" onDoubleClick={() => void handleOpen(entry)}>{entry.type === 'folder' ? '📁' : '📄'} {entry.name}</button>
              <button title="Copy" className="hidden text-xs group-hover:inline" onClick={() => handleCopy(entry, false)}>C</button>
              <button title="Cut" className="hidden text-xs group-hover:inline" onClick={() => handleCopy(entry, true)}>X</button>
              <button title="Rename" className="hidden text-xs group-hover:inline" onClick={() => void handleRename(entry)}>R</button>
              <button title="Delete" className="hidden text-xs group-hover:inline" onClick={() => void handleDelete(entry)}>D</button>
              {isNewCurrentFile && <button title="Save" className="hidden text-xs group-hover:inline" onClick={() => void handleSaveFile()}>S</button>}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
