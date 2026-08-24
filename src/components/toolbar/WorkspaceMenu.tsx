import React, { useEffect, useState } from 'react';
import { openLocalWorkspace } from '../../lib/workspace/localWorkspace';
import { listLocalWorkspaces } from '../../lib/workspace/workspaceRegistry';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import type { WorkspaceInfo } from '../../types/workspace';
import { CloudMenu } from './CloudMenu';

type FileSystemPermissionDescriptor = { mode?: 'read' | 'readwrite' };
type PermissionCapableDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission: (descriptor?: FileSystemPermissionDescriptor) => Promise<PermissionState>;
  requestPermission: (descriptor?: FileSystemPermissionDescriptor) => Promise<PermissionState>;
};

const asPermissionCapableHandle = (handle: FileSystemDirectoryHandle): PermissionCapableDirectoryHandle => handle as PermissionCapableDirectoryHandle;

export const WorkspaceMenu: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace, restoreActiveWorkspace, openPanel } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'open' | null>(null);
  const [localWorkspaces, setLocalWorkspaces] = useState<WorkspaceInfo[]>([]);

  const refreshWorkspaces = async () => {
    try {
      setLocalWorkspaces(await listLocalWorkspaces());
    } catch {
      setLocalWorkspaces([]);
    }
  };

  useEffect(() => {
    void refreshWorkspaces();
    void restoreActiveWorkspace();
  }, [restoreActiveWorkspace]);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveSubmenu(null);
  };

  const ensureLocalWorkspacePermission = async (workspace: WorkspaceInfo): Promise<boolean> => {
    if (workspace.type !== 'local' || !workspace.handle) return true;
    const handle = asPermissionCapableHandle(workspace.handle);
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted') return true;
    return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted';
  };

  const handleWorkspaceMenuClick = async () => {
    // File System Access permission checks must happen in the user's click
    // activation. Doing this during render/effect causes Chromium to reject
    // the request with "The request is not allowed by the user agent...".
    if (activeWorkspace?.type === 'local' && activeWorkspace.handle) {
      try {
        const granted = await ensureLocalWorkspacePermission(activeWorkspace);
        if (!granted) return;
      } catch {
        // Do not show a browser alert here. The panel can still be opened so
        // the user can explicitly choose another Workspace.
      }
    }
    openPanel();
    setIsOpen((open) => !open);
  };

  const handleOpenLocalWorkspace = async () => {
    try {
      const workspace = await openLocalWorkspace();
      setActiveWorkspace(workspace);
      await refreshWorkspaces();
      closeMenu();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'باز کردن Workspace انجام نشد.');
    }
  };

  const handleSelectRegisteredWorkspace = async (workspace: WorkspaceInfo) => {
    try {
      const granted = await ensureLocalWorkspacePermission(workspace);
      if (!granted) return;
      setActiveWorkspace(workspace);
      closeMenu();
    } catch {
      // Permission failures are handled silently; the user can retry from the menu.
    }
  };

  const toggleOpenSubmenu = () => setActiveSubmenu(activeSubmenu === 'open' ? null : 'open');

  return (
    <div className="relative">
      <button type="button" onClick={() => void handleWorkspaceMenuClick()} className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg">Workspace</button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded border border-border bg-surface py-1 shadow-lg">
          <div className="relative">
            <button type="button" onClick={toggleOpenSubmenu} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">باز کردن محیط کاری (Open Workspace)</button>
            {activeSubmenu === 'open' && (
              <div className="absolute right-full top-0 mr-1 w-64 rounded border border-border bg-surface py-1 shadow-lg">
                {localWorkspaces.map((workspace) => (
                  <button key={workspace.id} type="button" onClick={() => void handleSelectRegisteredWorkspace(workspace)} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">📁 {workspace.name}</button>
                ))}
                {localWorkspaces.length > 0 && <div className="my-1 border-t border-border" />}
                <button type="button" onClick={() => void handleOpenLocalWorkspace()} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">سیستم محلی (Local)</button>
                <CloudMenu />
              </div>
            )}
          </div>
          {activeWorkspace && (
            <>
              <div className="my-1 border-t border-border" />
              <div className="px-4 py-2 text-xs text-text-muted">محیط فعال: <span className="font-medium text-text">{activeWorkspace.name}</span></div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
