import type { WorkspaceInfo } from '../../types/workspace';
import { registerLocalWorkspace } from './workspaceRegistry';

interface FileSystemDirectoryPickerWindow extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}

const getDirectoryPicker = (): (() => Promise<FileSystemDirectoryHandle>) | null => {
  const picker = (window as FileSystemDirectoryPickerWindow).showDirectoryPicker;
  return typeof picker === 'function' ? picker.bind(window) : null;
};

const ensureLocalWorkspaceSupport = (): (() => Promise<FileSystemDirectoryHandle>) => {
  const picker = getDirectoryPicker();
  if (!picker) throw new Error('مرورگر فعلی از Workspace محلی پشتیبانی نمی‌کند.');
  return picker;
};

const toWorkspaceInfo = (handle: FileSystemDirectoryHandle): WorkspaceInfo => ({
  id: `local:${handle.name}:${crypto.randomUUID()}`,
  name: handle.name,
  type: 'local',
  location: handle.name,
  handle,
});

export const createLocalWorkspace = async (name: string): Promise<WorkspaceInfo> => {
  const workspaceName = name.trim();
  if (!workspaceName) throw new Error('نام Workspace نمی‌تواند خالی باشد.');

  const parentHandle = await ensureLocalWorkspaceSupport()();
  const workspaceHandle = await parentHandle.getDirectoryHandle(workspaceName, { create: true });
  const workspace = toWorkspaceInfo(workspaceHandle);
  await registerLocalWorkspace(workspace);
  return workspace;
};

export const openLocalWorkspace = async (): Promise<WorkspaceInfo> => {
  const workspace = toWorkspaceInfo(await ensureLocalWorkspaceSupport()());
  await registerLocalWorkspace(workspace);
  return workspace;
};
