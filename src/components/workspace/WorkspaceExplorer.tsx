import React, { useCallback, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import {
  copyEntry,
  createFile,
  createFolder,
  deleteEntry,
  listDirectory,
  readTextFile,
  renameEntry,
  type WorkspaceEntry,
  writeTextFile,
} from '../../lib/workspace/localWorkspaceFiles';

type TreeNode = WorkspaceEntry & { path: string };
type FileSystemSavePickerWindow = Window & {
  showSaveFilePicker?: (options?: { suggestedName?: string; startIn?: FileSystemDirectoryHandle }) => Promise<FileSystemFileHandle>;
};

const getSaveFilePicker = () => {
  const picker = (window as FileSystemSavePickerWindow).showSaveFilePicker;
  return typeof picker === 'function' ? picker.bind(window) : null;
};

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
  const [clipboard, setClipboard] = useState<{ entry: WorkspaceEntry; parent: FileSystemDirectoryHandle; cut: boolean } | null>(null);
  const [width, setWidth] = useState(288);
  const [collapsed, setCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const currentDirectory = useCallback(async () => {
    if (!activeWorkspace?.handle) return null;
    let directory = activeWorkspace.handle;
    for (const part of currentPath) directory = await directory.getDirectoryHandle(part);
    return directory;
  }, [activeWorkspace, currentPath]);

  const refresh = useCallback(async () => {
    const directory = await currentDirectory();
    if (!directory) {
      setEntries([]);
      return;
    }
    const result = await listDirectory(directory);
    setEntries(result.map((entry) => ({ ...entry, path: [...currentPath, entry.name].join('/') })));
  }, [currentDirectory, currentPath]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!isResizing) return;
    const move = (event: MouseEvent) => setWidth(Math.min(520, Math.max(180, window.innerWidth - event.clientX)));
    const stop = () => setIsResizing(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const promptName = (message: string, initial = '') => {
    const value = window.prompt(message, initial)?.trim();
    return value || null;
  };

  const handleCreateFolder = async () => {
    const directory = await currentDirectory();
    const name = promptName('نام پوشه:');
    if (!directory || !name) return;
    await createFolder(directory, name);
    await refresh();
  };

  const handleCreateFile = async () => {
    const directory = await currentDirectory();
    const name = promptName('نام فایل:', 'document.md');
    if (!directory || !name) return;
    const handle = await createFile(directory, name);
    createSession({ fileName: handle.name, markdown: '', isDirty: true, fileHandle: handle, workspaceDirectory: directory, isWorkspaceFile: true, isNewWorkspaceFile: true });
    await refresh();
  };

  const handleSaveFile = async () => {
    const directory = await currentDirectory();
    if (!directory || activeSessionId === null) return;
    const activeSession = sessions.find((session) => session.id === activeSessionId);
    if (activeSession?.isWorkspaceFile && activeSession.fileHandle) {
      await writeTextFile(activeSession.fileHandle, markdown);
      markPersisted(activeSession.fileHandle);
      await refresh();
      return;
    }
    const picker = getSaveFilePicker();
    if (!picker) {
      window.alert('مرورگر فعلی از ذخیره‌سازی فایل با پنجره انتخاب فایل پشتیبانی نمی‌کند.');
      return;
    }
    try {
      const handle = await picker({ suggestedName: fileName?.trim() || 'document.md', startIn: directory });
      await writeTextFile(handle, markdown);
      setWorkspaceFile(handle, directory, false);
      useEditorStore.setState({ fileName: handle.name, isDirty: false });
      await refresh();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'ذخیره فایل انجام نشد.');
    }
  };

  const handleOpen = async (entry: WorkspaceEntry) => {
    if (entry.kind === 'directory') {
      setCurrentPath((path) => [...path, entry.name]);
      return;
    }
    const extension = entry.name.split('.').pop()?.toLowerCase();
    if (!['md', 'markdown', 'txt'].includes(extension ?? '')) {
      window.alert('فعلاً فقط فایل‌های متنی Markdown/TXT در Editor باز می‌شوند.');
      return;
    }
    const directory = await currentDirectory();
    if (!directory) return;
    const existing = sessions.find((session) => session.fileHandle === entry.handle);
    if (existing) {
      activateSession(existing.id);
      return;
    }
    createSession({ fileName: entry.name, markdown: await readTextFile(entry.handle as FileSystemFileHandle), isDirty: false, fileHandle: entry.handle as FileSystemFileHandle, workspaceDirectory: directory, isWorkspaceFile: true, isNewWorkspaceFile: false });
  };

  const handleCopy = async (entry: WorkspaceEntry, cut: boolean) => {
    const directory = await currentDirectory();
    if (!directory) return;
    setClipboard({ entry, parent: directory, cut });
  };

  const handlePaste = async () => {
    if (!clipboard) return;
    const directory = await currentDirectory();
    if (!directory) return;
    await copyEntry(clipboard.entry.handle, directory);
    if (clipboard.cut) await deleteEntry(clipboard.parent, clipboard.entry.name, true);
    setClipboard(null);
    await refresh();
  };

  const handleRename = async (entry: WorkspaceEntry) => {
    const directory = await currentDirectory();
    const name = promptName('نام جدید:', entry.name);
    if (!directory || !name || name === entry.name) return;
    await renameEntry(directory, entry.name, name);
    await refresh();
  };

  const handleDelete = async (entry: WorkspaceEntry) => {
    const directory = await currentDirectory();
    if (!directory || !window.confirm(`حذف «${entry.name}» انجام شود؟`)) return;
    await deleteEntry(directory, entry.name, true);
    await refresh();
  };

  if (!activeWorkspace) return null;

  return (
    <aside
      className="relative flex shrink-0 flex-col border-l border-border bg-surface"
      dir="rtl"
      style={{ width: collapsed ? 40 : width }}
      aria-label="Workspace Explorer"
    >
      {collapsed ? (
        <button className="m-1 rounded border border-border px-2 py-2 text-xs hover:bg-bg" onClick={() => setCollapsed(false)} title="نمایش Workspace">›</button>
      ) : (
        <>
          <div className="border-b border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 truncate text-sm font-semibold">{activeWorkspace.name}</div>
              <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => setCollapsed(true)} title="مخفی کردن Workspace">×</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => void handleSaveFile()} title="Save">Save</button>
              <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => void handleCreateFile()} title="New File">New File</button>
              <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={() => void handleCreateFolder()} title="New Folder">New Folder</button>
              <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg disabled:opacity-40" onClick={() => void handlePaste()} disabled={!clipboard} title="Paste">P</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2 text-sm">
            <div className="mb-2 flex items-center gap-1 text-text-muted">
              <button className="hover:text-primary disabled:opacity-40" disabled={!currentPath.length} onClick={() => setCurrentPath((path) => path.slice(0, -1))}>←</button>
              <button className="hover:text-primary" onClick={() => setCurrentPath([])}>{activeWorkspace.name}</button>
              {currentPath.map((part) => <span key={part}>/ {part}</span>)}
            </div>
            {entries.map((entry) => {
              const isNewCurrentFile = entry.kind === 'file' && sessions.some((session) => session.id === activeSessionId && session.fileHandle === entry.handle && session.isNewWorkspaceFile);
              return (
                <div key={entry.path} className="group flex items-center gap-1 rounded px-2 py-1 hover:bg-bg">
                  <button className="min-w-0 flex-1 truncate text-right" onDoubleClick={() => void handleOpen(entry)}>{entry.kind === 'directory' ? '📁' : '📄'} {entry.name}</button>
                  <button title="Copy" className="hidden text-xs group-hover:inline" onClick={() => void handleCopy(entry, false)}>C</button>
                  <button title="Cut" className="hidden text-xs group-hover:inline" onClick={() => void handleCopy(entry, true)}>X</button>
                  <button title="Paste into this folder" disabled={entry.kind !== 'directory' || !clipboard} className="hidden text-xs group-hover:inline disabled:opacity-30" onClick={() => { if (entry.kind === 'directory') { setCurrentPath((path) => [...path, entry.name]); } }}>P</button>
                  <button title="Rename" className="hidden text-xs group-hover:inline" onClick={() => void handleRename(entry)}>R</button>
                  <button title="Delete" className="hidden text-xs group-hover:inline" onClick={() => void handleDelete(entry)}>D</button>
                  {isNewCurrentFile && <button title="Save" className="hidden text-xs group-hover:inline" onClick={() => void handleSaveFile()}>S</button>}
                </div>
              );
            })}
          </div>
          <div className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50" onMouseDown={() => setIsResizing(true)} title="تغییر عرض Workspace" />
        </>
      )}
    </aside>
  );
};
