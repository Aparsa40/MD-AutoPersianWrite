import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCloudStore } from '../../store/useCloudStore';
import { createLocalWorkspaceProvider } from '../../lib/workspace/localWorkspaceProvider';
import { getCloudProvider } from '../../lib/cloud/providerRegistry';
import type { CloudProviderId } from '../../types/cloud';
import type { WorkspaceEntry, WorkspaceProvider } from '../../types/workspaceProvider';
import type { WorkspaceFileReference } from '../../types/workspaceFileReference';

type TreeNode = WorkspaceEntry & { path: string };
type PickerWindow = Window & {
  showOpenFilePicker?: (options?: { multiple?: boolean }) => Promise<FileSystemFileHandle[]>;
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};
type DirectoryEntriesHandle = FileSystemDirectoryHandle & {
  entries: () => AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
};

const decodeText = (content: Uint8Array) => new TextDecoder().decode(content);
const encodeText = (content: string) => new TextEncoder().encode(content);
const pickerWindow = () => window as PickerWindow;
const getDirectoryEntries = (directory: FileSystemDirectoryHandle) =>
  (directory as DirectoryEntriesHandle).entries();

export const WorkspaceExplorer: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const activeCloudProviderId = useCloudStore((state) => state.activeProviderId);
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const activateSession = useDocumentSessionStore((state) => state.activateSession);
  const markPersisted = useDocumentSessionStore((state) => state.markPersisted);
  const markdown = useEditorStore((state) => state.markdown);
  const [entries, setEntries] = useState<TreeNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ entry: WorkspaceEntry; cut: boolean } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [childCounts, setChildCounts] = useState<Record<string, number>>({});
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<WorkspaceEntry[]>([]);

  const provider = useMemo<WorkspaceProvider | null>(() => {
    if (!activeWorkspace) return null;
    if (activeWorkspace.type === 'local') {
      if (!activeWorkspace.handle) return null;
      return createLocalWorkspaceProvider(activeWorkspace);
    }
    const providerId = activeWorkspace.providerId ?? activeCloudProviderId;
    if (!providerId) return null;
    return getCloudProvider(providerId as CloudProviderId)?.getWorkspaceProvider?.() ?? null;
  }, [activeWorkspace, activeCloudProviderId]);

  const parentId = currentPath.length ? currentPath[currentPath.length - 1] : null;

  const refresh = useCallback(async () => {
    if (!provider) {
      setEntries([]);
      setSelectedId(null);
      return;
    }
    try {
      const result = await provider.list(parentId);
      setEntries(result.map((entry) => ({ ...entry, path: entry.id })));
      setChildCounts({});
    } catch (error) {
      setEntries([]);
      window.alert(error instanceof Error ? error.message : 'خواندن Workspace انجام نشد.');
    }
  }, [provider, parentId]);

  useEffect(() => setCurrentPath([]), [provider]);
  useEffect(() => { void refresh(); }, [refresh]);

  const promptName = (message: string, initial = '') => window.prompt(message, initial)?.trim() || null;

  const makeReference = (entry: WorkspaceEntry): WorkspaceFileReference => ({
    providerId: activeWorkspace!.providerId ?? (activeWorkspace!.type === 'local' ? 'local' : activeCloudProviderId ?? 'cloud'),
    workspaceId: activeWorkspace!.id,
    entryId: entry.id,
    parentId: entry.parentId,
    name: entry.name,
  });

  const handleCreateFolder = async () => {
    if (!provider) return;
    const name = promptName('نام پوشه:');
    if (!name) return;
    await provider.createFolder(parentId, name);
    await refresh();
  };

  const handleCreateFile = async () => {
    if (!provider) return;
    const name = promptName('نام فایل:', 'document.md');
    if (!name) return;
    const entry = await provider.createFile(parentId, name);
    createSession({ fileName: entry.name, markdown: '', isDirty: false, workspaceFile: makeReference(entry), isWorkspaceFile: true, isNewWorkspaceFile: true });
    await refresh();
  };

  const handleInsertFile = async () => {
    if (!provider || !pickerWindow().showOpenFilePicker) return;
    try {
      const handles = await pickerWindow().showOpenFilePicker!({ multiple: true });
      for (const handle of handles) {
        const file = await handle.getFile();
        await provider.createFile(parentId, file.name, new Uint8Array(await file.arrayBuffer()));
      }
      await refresh();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'درج فایل انجام نشد.');
    }
  };

  const importDirectory = async (handle: FileSystemDirectoryHandle, targetParentId: string | null) => {
    if (!provider) return;
    const folder = await provider.createFolder(targetParentId, handle.name);
    for await (const [, item] of getDirectoryEntries(handle)) {
      if (item.kind === 'file') {
        const file = await item.getFile();
        await provider.createFile(folder.id, file.name, new Uint8Array(await file.arrayBuffer()));
      } else {
        await importDirectory(item, folder.id);
      }
    }
  };

  const handleInsertFolder = async () => {
    if (!provider || !pickerWindow().showDirectoryPicker) return;
    try {
      await importDirectory(await pickerWindow().showDirectoryPicker!(), parentId);
      await refresh();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'درج پوشه انجام نشد.');
    }
  };

  const handleOpen = async (entry: WorkspaceEntry) => {
    if (!provider || entry.type !== 'file') return;
    try {
      const content = decodeText(await provider.readFile(entry.id));
      const providerId = activeWorkspace?.providerId ?? (activeWorkspace?.type === 'local' ? 'local' : activeCloudProviderId);
      const existing = sessions.find((session) => session.workspaceFile?.entryId === entry.id && session.workspaceFile?.providerId === providerId);
      if (existing) activateSession(existing.id);
      else createSession({ fileName: entry.name, markdown: content, isDirty: false, workspaceFile: makeReference(entry), isWorkspaceFile: true, isNewWorkspaceFile: false });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'باز کردن فایل انجام نشد.');
    }
  };

  const handleRename = async (entry: WorkspaceEntry) => {
    if (!provider) return;
    const name = promptName('نام جدید:', entry.name);
    if (!name || name === entry.name) return;
    await provider.rename(entry.id, name);
    await refresh();
  };

  const handleDelete = async (entry: WorkspaceEntry) => {
    if (!provider || !window.confirm(`حذف «${entry.name}»؟`)) return;
    await provider.delete(entry.id);
    if (selectedId === entry.id) setSelectedId(null);
    await refresh();
  };

  const handleCopy = (entry: WorkspaceEntry) => setClipboard({ entry, cut: false });
  const handleCut = (entry: WorkspaceEntry) => setClipboard({ entry, cut: true });

  const handlePaste = async (entry?: WorkspaceEntry) => {
    if (!provider || !clipboard) return;
    const targetParent = entry?.type === 'folder' ? entry.id : entry?.parentId ?? parentId;
    if (clipboard.cut) await provider.move(clipboard.entry.id, targetParent);
    else await provider.copy(clipboard.entry.id, targetParent);
    setClipboard(null);
    await refresh();
  };

  const handleFolderHover = async (entry: WorkspaceEntry) => {
    if (!provider || entry.type !== 'folder') {
      setHoveredFolder(null);
      setHoverPreview([]);
      return;
    }
    setHoveredFolder(entry.id);
    try {
      const children = await provider.list(entry.id);
      setChildCounts((current) => ({ ...current, [entry.id]: children.length }));
      setHoverPreview(children.slice(0, 6));
    } catch {
      setHoverPreview([]);
    }
  };

  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? null;
  const handleTopRename = () => { if (selectedEntry) void handleRename(selectedEntry); };
  const handleTopDelete = () => { if (selectedEntry) void handleDelete(selectedEntry); };

  if (!activeWorkspace) {
    return <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-text-muted">از منوی Workspace گزینه Local یا Cloud را انتخاب کنید.</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden" dir="rtl">
      <div className="relative shrink-0 border-b border-border p-2">
        <button
          type="button"
          onClick={() => setToolsOpen((open) => !open)}
          aria-expanded={toolsOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-between rounded-md border border-border bg-bg px-3 py-2 text-right text-sm font-medium hover:bg-surface"
        >
          <span>Tools — Workspace</span>
          <span className="text-text-muted">{toolsOpen ? '⌃' : '⌄'}</span>
        </button>
        {toolsOpen && (
          <div role="menu" className="absolute right-2 top-[calc(100%-2px)] z-50 min-w-[190px] rounded-md border border-border bg-surface p-1 shadow-lg">
            <button role="menuitem" type="button" onClick={() => { setToolsOpen(false); void handleCreateFolder(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">📁 New Folder</button>
            <button role="menuitem" type="button" onClick={() => { setToolsOpen(false); void handleCreateFile(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">➕ New File</button>
            <button role="menuitem" type="button" onClick={() => { setToolsOpen(false); void handleInsertFile(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">📥 Insert File</button>
            <button role="menuitem" type="button" onClick={() => { setToolsOpen(false); void handleInsertFolder(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">📁 Insert Folder</button>
            <div className="my-1 border-t border-border" />
            <button role="menuitem" type="button" onClick={() => { setToolsOpen(false); handleTopRename(); }} disabled={!selectedEntry} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg disabled:opacity-40">✏️ Rename</button>
            <button role="menuitem" type="button" onClick={() => { setToolsOpen(false); handleTopDelete(); }} disabled={!selectedEntry} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg disabled:opacity-40">🗑️ Delete</button>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 text-xs text-text-muted">
        <span>📁</span>
        <span className="min-w-0 truncate">{currentPath.length ? currentPath[currentPath.length - 1] : activeWorkspace.name}</span>
        {currentPath.length > 0 && <button type="button" onClick={() => setCurrentPath((path) => path.slice(0, -1))} className="mr-auto rounded px-2 py-1 hover:bg-bg" title="پوشه والد">↩</button>}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        {entries.length === 0 && <div className="p-5 text-center text-xs text-text-muted">این پوشه خالی است.</div>}
        <div className="space-y-0.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              onMouseEnter={() => void handleFolderHover(entry)}
              onMouseLeave={() => { setHoveredFolder(null); setHoverPreview([]); }}
              onClick={() => setSelectedId(entry.id)}
              className={`group relative flex min-h-9 items-center rounded-md px-2 py-1.5 transition ${selectedId === entry.id ? 'bg-bg' : 'hover:bg-bg'}`}
            >
              <button
                type="button"
                onDoubleClick={() => entry.type === 'folder' ? setCurrentPath((path) => [...path, entry.id]) : void handleOpen(entry)}
                onClick={() => setSelectedId(entry.id)}
                className="min-w-0 flex-1 truncate text-right text-sm"
                title={entry.type === 'folder' ? 'دابل‌کلیک برای ورود به پوشه' : 'دابل‌کلیک برای باز کردن فایل'}
              >
                <span className="ml-1">{entry.type === 'folder' ? '📁' : '📄'}</span>
                <span>{entry.name}</span>
                {entry.type === 'folder' && childCounts[entry.id] > 0 && <span className="mr-1 text-[11px] text-text-muted">({childCounts[entry.id]})</span>}
              </button>

              <div className="mr-auto hidden shrink-0 items-center gap-0.5 group-hover:flex" dir="ltr">
                <button type="button" onClick={() => handleCopy(entry)} title="Copy" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">C</button>
                <button type="button" onClick={() => void handleRename(entry)} title="Rename" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">R</button>
                <button type="button" onClick={() => handleCut(entry)} title="Cut" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">X</button>
                {clipboard && <button type="button" onClick={() => void handlePaste(entry)} title="Paste" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">P</button>}
              </div>

              {hoveredFolder === entry.id && hoverPreview.length > 0 && (
                <div className="pointer-events-none absolute right-2 top-full z-30 mt-1 w-[calc(100%-16px)] rounded-md border border-border bg-surface p-2 text-right text-[11px] shadow-lg">
                  <div className="mb-1 font-medium text-text">محتویات پوشه</div>
                  {hoverPreview.map((child) => <div key={child.id} className="truncate py-0.5 text-text-muted">{child.type === 'folder' ? '📁' : '📄'} {child.name}</div>)}
                  {childCounts[entry.id] > hoverPreview.length && <div className="pt-1 text-text-muted">+ {childCounts[entry.id] - hoverPreview.length} مورد دیگر</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {clipboard && <div className="shrink-0 border-t border-border px-3 py-1.5 text-right text-[11px] text-text-muted">{clipboard.cut ? '✂' : '⧉'} {clipboard.entry.name} — برای Paste روی P بزنید.</div>}
      {activeSessionId && markdown && <button type="button" onClick={async () => { const session = sessions.find((item) => item.id === activeSessionId); if (!provider || !session?.workspaceFile) return; await provider.writeFile(session.workspaceFile.entryId, encodeText(markdown)); markPersisted(session.workspaceFile); await refresh(); }} className="shrink-0 border-t border-border px-3 py-2 text-right text-xs hover:bg-bg">ذخیره تغییرات فایل فعال</button>}
    </div>
  );
};
