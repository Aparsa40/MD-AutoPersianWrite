import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCloudStore } from '../../store/useCloudStore';
import { createLocalWorkspaceProvider } from '../../lib/workspace/localWorkspaceProvider';
import { getCloudProvider } from '../../lib/cloud/providerRegistry';
import type { WorkspaceEntry, WorkspaceProvider } from '../../types/workspaceProvider';
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
  const activeCloudProviderId = useCloudStore((state) => state.activeProviderId);
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const activateSession = useDocumentSessionStore((state) => state.activateSession);
  const markPersisted = useDocumentSessionStore((state) => state.markPersisted);
  const markdown = useEditorStore((state) => state.markdown);
  const fileName = useEditorStore((state) => state.fileName);
  const [entries, setEntries] = useState<TreeNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<{ entry: WorkspaceEntry; cut: boolean } | null>(null);

  const provider = useMemo<WorkspaceProvider | null>(() => {
    if (!activeWorkspace) return null;
    if (activeWorkspace.type === 'local') {
      if (!activeWorkspace.handle) return null;
      return createLocalWorkspaceProvider(activeWorkspace);
    }
    const providerId = activeWorkspace.providerId ?? activeCloudProviderId;
    if (!providerId) return null;
    return getCloudProvider(providerId)?.getWorkspaceProvider?.() ?? null;
  }, [activeWorkspace, activeCloudProviderId]);

  const parentId = currentPath.length ? currentPath[currentPath.length - 1] : null;

  const refresh = useCallback(async () => {
    if (!provider) {
      setEntries([]);
      return;
    }
    try {
      const result = await provider.list(parentId);
      setEntries(result.map((entry) => ({ ...entry, path: entry.id })));
    } catch (error) {
      setEntries([]);
      window.alert(error instanceof Error ? error.message : 'خواندن Workspace انجام نشد.');
    }
  }, [provider, parentId]);

  useEffect(() => {
    setCurrentPath([]);
  }, [provider]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const promptName = (message: string, initial = '') => {
    const value = window.prompt(message, initial)?.trim();
    return value || null;
  };

  const makeReference = (entry: WorkspaceEntry): WorkspaceFileReference => ({
    providerId: activeWorkspace!.providerId ?? (activeWorkspace!.type === 'local' ? 'local' : activeCloudProviderId ?? 'cloud'),
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
    createSession({
      fileName: entry.name,
      markdown: '',
      isDirty: false,
      workspaceFile: makeReference(entry),
      isWorkspaceFile: true,
      isNewWorkspaceFile: true,
    });
    await refresh();
  };

  const handleOpen = async (entry: WorkspaceEntry) => {
    if (!provider || entry.type !== 'file') return;
    try {
      const content = decodeText(await provider.readFile(entry.id));
      const existing = sessions.find((session) => session.workspaceFile?.entryId === entry.id && session.workspaceFile?.providerId === (activeWorkspace?.providerId ?? 'local'));
      if (existing) {
        activateSession(existing.id);
        return;
      }
      createSession({
        fileName: entry.name,
        markdown: content,
        isDirty: false,
        workspaceFile: makeReference(entry),
        isWorkspaceFile: true,
        isNewWorkspaceFile: false,
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'باز کردن فایل انجام نشد.');
    }
  };

  const handleSave = async () => {
    if (!provider || !activeSessionId) return;
    const session = sessions.find((item) => item.id === activeSessionId);
    if (!session?.workspaceFile) return;
    await provider.writeFile(session.workspaceFile.entryId, encodeText(markdown));
    markPersisted(session.workspaceFile);
    await refresh();
  };

  const handleRename = async (entry: WorkspaceEntry) => {
    const name = promptName('نام جدید:', entry.name);
    if (!provider || !name || name === entry.name) return;
    await provider.rename(entry.id, name);
    await refresh();
  };

  const handleDelete = async (entry: WorkspaceEntry) => {
    if (!provider || !window.confirm(`حذف «${entry.name}»؟`)) return;
    await provider.delete(entry.id);
    await refresh();
  };

  const handleCopy = (entry: WorkspaceEntry) => setClipboard({ entry, cut: false });
  const handleCut = (entry: WorkspaceEntry) => setClipboard({ entry, cut: true });

  const handlePaste = async () => {
    if (!provider || !clipboard) return;
    if (clipboard.cut) {
      await provider.move(clipboard.entry.id, parentId);
    } else {
      await provider.copy(clipboard.entry.id, parentId);
    }
    setClipboard(null);
    await refresh();
  };

  const handleOpenFolder = (entry: WorkspaceEntry) => {
    if (entry.type === 'folder') setCurrentPath((path) => [...path, entry.id]);
  };

  const handleSaveAs = async () => {
    const picker = getSaveFilePicker();
    if (!picker) return;
    const handle = await picker({ suggestedName: fileName || 'document.md' });
    const writable = await handle.createWritable();
    await writable.write(markdown);
    await writable.close();
  };

  return (
    <div className="workspace-explorer">
      <div className="workspace-explorer__actions">
        <button type="button" onClick={handleCreateFile}>New File</button>
        <button type="button" onClick={handleCreateFolder}>New Folder</button>
        <button type="button" onClick={() => void handlePaste()} disabled={!clipboard}>Paste</button>
        <button type="button" onClick={() => void handleSave()} disabled={!activeSessionId}>Save</button>
        <button type="button" onClick={() => void handleSaveAs()} disabled={!fileName}>Save As</button>
      </div>
      <div className="workspace-explorer__entries">
        {entries.map((entry) => (
          <div className="workspace-explorer__entry" key={entry.id}>
            <button type="button" onClick={() => entry.type === 'folder' ? handleOpenFolder(entry) : void handleOpen(entry)}>{entry.name}</button>
            <button type="button" onClick={() => handleCopy(entry)}>Copy</button>
            <button type="button" onClick={() => handleCut(entry)}>Cut</button>
            <button type="button" onClick={() => void handleRename(entry)}>Rename</button>
            <button type="button" onClick={() => void handleDelete(entry)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
