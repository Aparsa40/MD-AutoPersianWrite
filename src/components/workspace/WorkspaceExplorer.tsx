import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCloudStore } from '../../store/useCloudStore';
import { createLocalWorkspaceProvider } from '../../lib/workspace/localWorkspaceProvider';
import { getCloudProvider } from '../../lib/cloud/providerRegistry';
import type { CloudProviderId } from '../../types/cloud';
import type { WorkspaceEntry, WorkspaceProvider } from '../../types/workspaceProvider';
import { WorkspaceEntryRow } from './WorkspaceEntryRow';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import type { WorkspaceEntryAction } from './WorkspaceToolbar';

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: { multiple?: boolean }) => Promise<FileSystemFileHandle[]>;
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};
type DirectoryEntriesHandle = FileSystemDirectoryHandle & {
  entries: () => AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
};
type ClipboardState = { entry: WorkspaceEntry; cut: boolean };
type ContextState = { x: number; y: number; entry: WorkspaceEntry | null };

const pickerWindow = () => window as PickerWindow;
const getDirectoryEntries = (directory: FileSystemDirectoryHandle) => (directory as DirectoryEntriesHandle).entries();
const decodeText = (content: Uint8Array) => new TextDecoder().decode(content);
const encodeText = (content: string) => new TextEncoder().encode(content);

export const WorkspaceExplorer: React.FC = () => {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const activeCloudProviderId = useCloudStore((state) => state.activeProviderId);
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const activateSession = useDocumentSessionStore((state) => state.activateSession);
  const markPersisted = useDocumentSessionStore((state) => state.markPersisted);
  const syncWorkspaceRename = useDocumentSessionStore((state) => state.syncWorkspaceRename);
  const closeWorkspaceSessions = useDocumentSessionStore((state) => state.closeWorkspaceSessions);
  const markdown = useEditorStore((state) => state.markdown);
  const [entries, setEntries] = useState<WorkspaceEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<WorkspaceEntry[]>([]);
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [childCounts, setChildCounts] = useState<Record<string, number>>({});
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<WorkspaceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ContextState | null>(null);

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

  const parentId = currentPath.length ? currentPath[currentPath.length - 1].id : null;
  const selectedEntries = entries.filter((entry) => selectedIds.includes(entry.id));

  const refresh = useCallback(async () => {
    if (!provider) {
      setEntries([]);
      setError(activeWorkspace?.type === 'cloud' ? 'اتصال فضای ابری در این نشست مرورگر فعال نیست. لطفاً دوباره متصل شوید.' : null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await provider.list(parentId);
      setEntries(result);
      setChildCounts({});
      setSelectedIds((current) => current.filter((id) => result.some((entry) => entry.id === id)));
    } catch (cause) {
      setEntries([]);
      setError(cause instanceof Error ? cause.message : 'خواندن Workspace انجام نشد.');
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.type, parentId, provider]);

  useEffect(() => {
    setCurrentPath([]);
    setSelectedIds([]);
    setClipboard(null);
    setContext(null);
  }, [provider]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    const closeContext = () => setContext(null);
    window.addEventListener('click', closeContext);
    window.addEventListener('scroll', closeContext, true);
    return () => {
      window.removeEventListener('click', closeContext);
      window.removeEventListener('scroll', closeContext, true);
    };
  }, []);

  const promptName = (message: string, initial = '') => window.prompt(message, initial)?.trim() || null;
  const reportError = (cause: unknown, fallback: string) => setError(cause instanceof Error ? cause.message : fallback);

  const makeReference = (entry: WorkspaceEntry) => ({
    providerId: activeWorkspace!.providerId ?? (activeWorkspace!.type === 'local' ? 'local' : activeCloudProviderId ?? 'cloud'),
    workspaceId: activeWorkspace!.id,
    entryId: entry.id,
    parentId: entry.parentId,
    name: entry.name,
  });

  const createFolder = async () => {
    if (!provider) return;
    const name = promptName('نام پوشه:');
    if (!name) return;
    try {
      if (entries.some((entry) => entry.name === name)) throw new Error(`«${name}» از قبل در این پوشه وجود دارد.`);
      await provider.createFolder(parentId, name);
      await refresh();
    } catch (cause) { reportError(cause, 'ساخت پوشه انجام نشد.'); }
  };

  const createFile = async () => {
    if (!provider) return;
    const name = promptName('نام فایل:', 'document.md');
    if (!name) return;
    try {
      if (entries.some((entry) => entry.name === name)) throw new Error(`«${name}» از قبل در این پوشه وجود دارد.`);
      const entry = await provider.createFile(parentId, name);
      createSession({ fileName: entry.name, markdown: '', isDirty: false, workspaceFile: makeReference(entry), isWorkspaceFile: true, isNewWorkspaceFile: true });
      await refresh();
    } catch (cause) { reportError(cause, 'ساخت فایل انجام نشد.'); }
  };

  const insertFile = async () => {
    if (!provider || !pickerWindow().showOpenFilePicker) return;
    try {
      const handles = await pickerWindow().showOpenFilePicker!({ multiple: true });
      for (const handle of handles) {
        const file = await handle.getFile();
        if (!entries.some((entry) => entry.name === file.name)) await provider.createFile(parentId, file.name, new Uint8Array(await file.arrayBuffer()));
      }
      await refresh();
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      reportError(cause, 'درج فایل انجام نشد.');
    }
  };

  const importDirectory = async (handle: FileSystemDirectoryHandle, targetParentId: string | null) => {
    if (!provider) return;
    const folder = await provider.createFolder(targetParentId, handle.name);
    for await (const [, item] of getDirectoryEntries(handle)) {
      if (item.kind === 'file') {
        await provider.createFile(folder.id, item.name, new Uint8Array(await (await item.getFile()).arrayBuffer()));
      } else {
        await importDirectory(item, folder.id);
      }
    }
  };

  const insertFolder = async () => {
    if (!provider || !pickerWindow().showDirectoryPicker) return;
    try {
      await importDirectory(await pickerWindow().showDirectoryPicker!(), parentId);
      await refresh();
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      reportError(cause, 'درج پوشه انجام نشد.');
    }
  };

  const openEntry = async (entry: WorkspaceEntry) => {
    if (!provider) return;
    if (entry.type === 'folder') {
      setCurrentPath((path) => [...path, entry]);
      setSelectedIds([]);
      return;
    }
    try {
      const content = decodeText(await provider.readFile(entry.id));
      const providerId = activeWorkspace?.providerId ?? (activeWorkspace?.type === 'local' ? 'local' : activeCloudProviderId);
      const existing = sessions.find((session) => session.workspaceFile?.entryId === entry.id && session.workspaceFile?.providerId === providerId && session.workspaceFile?.workspaceId === activeWorkspace?.id);
      if (existing) activateSession(existing.id);
      else createSession({ fileName: entry.name, markdown: content, isDirty: false, workspaceFile: makeReference(entry), isWorkspaceFile: true, isNewWorkspaceFile: false });
    } catch (cause) { reportError(cause, 'باز کردن فایل انجام نشد.'); }
  };

  const renameEntry = async (entry: WorkspaceEntry) => {
    if (!provider) return;
    const name = promptName('نام جدید:', entry.name);
    if (!name || name === entry.name) return;
    try {
      const conflict = entries.find((item) => item.id !== entry.id && item.name === name);
      if (conflict && !window.confirm(`«${name}» از قبل وجود دارد. جایگزین شود؟`)) return;
      await provider.rename(entry.id, name);
      syncWorkspaceRename(makeReference(entry), name);
      await refresh();
    } catch (cause) { reportError(cause, 'تغییر نام انجام نشد.'); }
  };

  const deleteEntry = async (entry: WorkspaceEntry) => {
    if (!provider || !window.confirm(`حذف «${entry.name}»؟${entry.type === 'folder' ? ' محتوای آن نیز حذف می‌شود.' : ''}`)) return;
    try {
      await provider.delete(entry.id);
      closeWorkspaceSessions(makeReference(entry));
      setSelectedIds((ids) => ids.filter((id) => id !== entry.id));
      await refresh();
    } catch (cause) { reportError(cause, 'حذف انجام نشد. بررسی مجوز دسترسی را انجام دهید.'); }
  };

  const copyToClipboard = (entry: WorkspaceEntry) => setClipboard({ entry, cut: false });
  const cutToClipboard = (entry: WorkspaceEntry) => setClipboard({ entry, cut: true });

  const isInvalidMoveTarget = (source: WorkspaceEntry, targetParentId: string | null) => {
    if (!targetParentId || source.type !== 'folder') return source.id === targetParentId;
    if (source.id === targetParentId) return true;
    if (activeWorkspace?.type === 'local') return targetParentId.startsWith(`${source.id}/`);
    return false;
  };

  const destinationExists = (targetParentId: string | null, name: string) => entries.some((entry) => (entry.parentId ?? null) === targetParentId && entry.name === name);

  const pasteEntry = async (target?: WorkspaceEntry) => {
    if (!provider || !clipboard) return;
    const targetParentId = target?.type === 'folder' ? target.id : target?.parentId ?? parentId;
    if (isInvalidMoveTarget(clipboard.entry, targetParentId)) {
      setError('امکان انتقال یک پوشه به خودش یا یکی از زیرپوشه‌هایش وجود ندارد.');
      return;
    }
    try {
      if (destinationExists(targetParentId, clipboard.entry.name) && !window.confirm(`«${clipboard.entry.name}» در مقصد وجود دارد. عملیات ادامه پیدا کند؟`)) return;
      if (clipboard.cut) await provider.move(clipboard.entry.id, targetParentId);
      else await provider.copy(clipboard.entry.id, targetParentId);
      setClipboard(null);
      await refresh();
    } catch (cause) { reportError(cause, clipboard.cut ? 'انتقال انجام نشد.' : 'کپی انجام نشد.'); }
  };

  const action = async (entry: WorkspaceEntry, operation: WorkspaceEntryAction) => {
    if (operation === 'copy') copyToClipboard(entry);
    else if (operation === 'cut') cutToClipboard(entry);
    else if (operation === 'rename') await renameEntry(entry);
    else if (operation === 'delete') await deleteEntry(entry);
    else if (operation === 'paste') await pasteEntry(entry);
  };

  const selectEntry = (entry: WorkspaceEntry, event: React.MouseEvent) => {
    setContext(null);
    if (event.shiftKey && selectedIds.length) {
      const lastIndex = entries.findIndex((item) => item.id === selectedIds[selectedIds.length - 1]);
      const nextIndex = entries.findIndex((item) => item.id === entry.id);
      if (lastIndex >= 0 && nextIndex >= 0) {
        const [start, end] = lastIndex < nextIndex ? [lastIndex, nextIndex] : [nextIndex, lastIndex];
        setSelectedIds(entries.slice(start, end + 1).map((item) => item.id));
        return;
      }
    }
    if (event.ctrlKey || event.metaKey) {
      setSelectedIds((ids) => ids.includes(entry.id) ? ids.filter((id) => id !== entry.id) : [...ids, entry.id]);
      return;
    }
    setSelectedIds([entry.id]);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!activeWorkspace || !selectedEntries.length) return;
    const target = event.target as HTMLElement | null;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
    if (event.key === 'F2' && selectedEntries.length === 1) { event.preventDefault(); void renameEntry(selectedEntries[0]); }
    else if (event.key === 'Delete') { event.preventDefault(); void Promise.all(selectedEntries.map(deleteEntry)); }
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') { event.preventDefault(); copyToClipboard(selectedEntries[0]); }
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'x') { event.preventDefault(); cutToClipboard(selectedEntries[0]); }
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') { event.preventDefault(); void pasteEntry(); }
  }, [activeWorkspace, selectedEntries, pasteEntry]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDragStart = (entry: WorkspaceEntry, event: React.DragEvent) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/x-md-autopersianwrite-entry', entry.id);
    setSelectedIds((ids) => ids.includes(entry.id) ? ids : [entry.id]);
  };

  const handleDragOver = (entry: WorkspaceEntry, event: React.DragEvent) => {
    if (entry.type === 'folder') {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = async (entry: WorkspaceEntry, event: React.DragEvent) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/x-md-autopersianwrite-entry');
    const source = entries.find((item) => item.id === sourceId);
    if (source && entry.type === 'folder') {
      setClipboard({ entry: source, cut: true });
      await pasteEntry(entry);
    }
  };

  const handleFolderHover = async (entry: WorkspaceEntry) => {
    if (!provider || entry.type !== 'folder') return;
    setHoveredFolder(entry.id);
    try {
      const children = await provider.list(entry.id);
      setChildCounts((current) => ({ ...current, [entry.id]: children.length }));
      setHoverPreview(children.slice(0, 6));
    } catch { setHoverPreview([]); }
  };

  if (!activeWorkspace) return <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-text-muted">برای نمایش Workspace، ابتدا یک Local یا Cloud Workspace انتخاب یا ایجاد کنید.</div>;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden" dir="rtl">
      <WorkspaceToolbar
        workspaceName={activeWorkspace.name}
        currentPath={currentPath.map((entry) => entry.name)}
        selectedCount={selectedEntries.length}
        canPaste={Boolean(clipboard)}
        clipboardLabel={clipboard ? `Paste ${clipboard.entry.name}` : 'Paste'}
        onCreateFile={() => void createFile()}
        onCreateFolder={() => void createFolder()}
        onInsertFile={() => void insertFile()}
        onInsertFolder={() => void insertFolder()}
        onPaste={() => void pasteEntry()}
        onRefresh={() => void refresh()}
        onNavigateUp={() => { setCurrentPath((path) => path.slice(0, -1)); setSelectedIds([]); }}
        onClearSelection={() => setSelectedIds([])}
      />

      <div className="min-h-0 flex-1 overflow-auto p-2" onContextMenu={(event) => { if (event.target === event.currentTarget) { event.preventDefault(); setContext({ x: event.clientX, y: event.clientY, entry: null }); } }}>
        {loading && <div className="px-3 py-2 text-xs text-text-muted">در حال بارگذاری Workspace…</div>}
        {error && <div className="mb-2 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-200" role="alert">{error}</div>}
        {!loading && !error && entries.length === 0 && <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-text-muted">این پوشه خالی است.</div>}
        <div className="space-y-0.5">
          {entries.map((entry) => (
            <div key={entry.id} onMouseEnter={() => void handleFolderHover(entry)} onMouseLeave={() => { setHoveredFolder(null); setHoverPreview([]); }}>
              <WorkspaceEntryRow
                entry={entry}
                selected={selectedIds.includes(entry.id)}
                showPaste={Boolean(clipboard)}
                childCount={childCounts[entry.id]}
                onOpen={(item) => void openEntry(item)}
                onSelect={selectEntry}
                onAction={(item, operation) => void action(item, operation)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
              {hoveredFolder === entry.id && hoverPreview.length > 0 && <div className="pointer-events-none mx-2 rounded-md border border-border bg-surface p-2 text-[11px] shadow-md">
                <div className="mb-1 font-medium text-text">محتویات پوشه</div>
                {hoverPreview.map((child) => <div key={child.id} className="truncate py-0.5 text-text-muted">{child.type === 'folder' ? '📁' : '📄'} {child.name}</div>)}
                {(childCounts[entry.id] ?? 0) > hoverPreview.length && <div className="pt-1 text-text-muted">+ {(childCounts[entry.id] ?? 0) - hoverPreview.length} مورد دیگر</div>}
              </div>}
            </div>
          ))}
        </div>
      </div>

      {clipboard && <div className="shrink-0 border-t border-border px-3 py-1.5 text-right text-[10px] text-text-muted">{clipboard.cut ? '✂' : '⧉'} {clipboard.entry.name} در Clipboard Workspace قرار دارد؛ P برای Paste.</div>}
      {activeSessionId && markdown && <button type="button" onClick={async () => { const session = sessions.find((item) => item.id === activeSessionId); if (!provider || !session?.workspaceFile) return; try { await provider.writeFile(session.workspaceFile.entryId, encodeText(markdown)); markPersisted(session.workspaceFile); await refresh(); } catch (cause) { reportError(cause, 'ذخیره فایل انجام نشد.'); } }} className="shrink-0 border-t border-border px-3 py-2 text-right text-xs hover:bg-bg">ذخیره تغییرات فایل فعال</button>}

      {context && <div className="fixed z-[100] min-w-44 rounded-md border border-border bg-surface p-1 shadow-xl" style={{ left: context.x, top: context.y }} onClick={(event) => event.stopPropagation()} role="menu">
        {context.entry ? <>
          <button type="button" onClick={() => { setContext(null); void openEntry(context.entry!); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">باز کردن</button>
          <button type="button" onClick={() => { setContext(null); copyToClipboard(context.entry!); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">کپی (Ctrl+C)</button>
          <button type="button" onClick={() => { setContext(null); cutToClipboard(context.entry!); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">برش (Ctrl+X)</button>
          <button type="button" onClick={() => { setContext(null); void renameEntry(context.entry!); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">تغییر نام (F2)</button>
          {clipboard && <button type="button" onClick={() => { setContext(null); void pasteEntry(context.entry!); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">چسباندن (P)</button>}
          <button type="button" onClick={() => { setContext(null); void deleteEntry(context.entry!); }} className="block w-full rounded px-3 py-2 text-right text-xs text-red-600 hover:bg-bg">حذف (Delete)</button>
        </> : <>
          {clipboard && <button type="button" onClick={() => { setContext(null); void pasteEntry(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">چسباندن (P)</button>}
          <button type="button" onClick={() => { setContext(null); void createFile(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">فایل جدید</button>
          <button type="button" onClick={() => { setContext(null); void createFolder(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">پوشه جدید</button>
          <button type="button" onClick={() => { setContext(null); void refresh(); }} className="block w-full rounded px-3 py-2 text-right text-xs hover:bg-bg">تازه‌سازی</button>
        </>}
      </div>}
    </div>
  );
};
