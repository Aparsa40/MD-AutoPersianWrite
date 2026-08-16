import React, { useCallback, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
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

export const WorkspaceExplorer: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const { markdown, fileName, setMarkdown, setFileName } = useEditorStore();
  const [entries, setEntries] = useState<TreeNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ entry: WorkspaceEntry; parent: FileSystemDirectoryHandle; cut: boolean } | null>(null);

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

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
    await createFile(directory, name);
    await refresh();
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
    setMarkdown(await readTextFile(entry.handle as FileSystemFileHandle));
    setFileName(entry.name);
  };

  const handleSave = async () => {
    const directory = await currentDirectory();
    if (!directory) return;
    const handle = await directory.getFileHandle(fileName, { create: true });
    await writeTextFile(handle, markdown);
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
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-surface" dir="rtl">
      <div className="border-b border-border p-3">
        <div className="text-sm font-semibold">{activeWorkspace.name}</div>
        <div className="mt-2 flex flex-wrap gap-1">
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={handleCreateFolder}>پوشه جدید</button>
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={handleCreateFile}>فایل جدید</button>
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={handlePaste} disabled={!clipboard}>Paste</button>
          <button className="rounded border border-border px-2 py-1 text-xs hover:bg-bg" onClick={handleSave}>Save</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 text-sm">
        <div className="mb-2 flex items-center gap-1 text-text-muted">
          <button className="hover:text-primary disabled:opacity-40" disabled={!currentPath.length} onClick={() => setCurrentPath((path) => path.slice(0, -1))}>←</button>
          <button className="hover:text-primary" onClick={() => setCurrentPath([])}>{activeWorkspace.name}</button>
          {currentPath.map((part) => <span key={part}>/ {part}</span>)}
        </div>
        {entries.map((entry) => (
          <div key={entry.path} className="group flex items-center gap-1 rounded px-2 py-1 hover:bg-bg">
            <button className="min-w-0 flex-1 truncate text-right" onDoubleClick={() => void handleOpen(entry)}>{entry.kind === 'directory' ? '📁' : '📄'} {entry.name}</button>
            <button title="Copy" className="hidden text-xs group-hover:inline" onClick={() => void handleCopy(entry, false)}>C</button>
            <button title="Cut" className="hidden text-xs group-hover:inline" onClick={() => void handleCopy(entry, true)}>X</button>
            <button title="Rename" className="hidden text-xs group-hover:inline" onClick={() => void handleRename(entry)}>R</button>
            <button title="Delete" className="hidden text-xs group-hover:inline" onClick={() => void handleDelete(entry)}>D</button>
          </div>
        ))}
      </div>
    </aside>
  );
};
