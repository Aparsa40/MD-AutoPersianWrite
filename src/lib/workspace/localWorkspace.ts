import type { WorkspaceInfo } from '../../types/workspace';

interface FileSystemDirectoryPickerWindow extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}

const getDirectoryPicker = (): (() => Promise<FileSystemDirectoryHandle>) | null => {
  const picker = (window as FileSystemDirectoryPickerWindow).showDirectoryPicker;
  return typeof picker === 'function' ? picker.bind(window) : null;
};

const ensureLocalWorkspaceSupport = (): (() => Promise<FileSystemDirectoryHandle>) => {
  const picker = getDirectoryPicker();

  if (!picker) {
    throw new Error('مرورگر فعلی از انتخاب پوشه برای Workspace محلی پشتیبانی نمی‌کند.');
  }

  return picker;
};

export const createLocalWorkspace = async (name: string): Promise<WorkspaceInfo> => {
  const workspaceName = name.trim();

  if (!workspaceName) {
    throw new Error('نام Workspace نمی‌تواند خالی باشد.');
  }

  const pickParentDirectory = ensureLocalWorkspaceSupport();
  const parentHandle = await pickParentDirectory();
  const workspaceHandle = await parentHandle.getDirectoryHandle(workspaceName, { create: true });

  return {
    id: `local:${workspaceName}:${Date.now()}`,
    name: workspaceName,
    type: 'local',
    location: workspaceName,
    handle: workspaceHandle,
  };
};

export const openLocalWorkspace = async (): Promise<WorkspaceInfo> => {
  const pickDirectory = ensureLocalWorkspaceSupport();
  const workspaceHandle = await pickDirectory();

  return {
    id: `local:${workspaceHandle.name}:${Date.now()}`,
    name: workspaceHandle.name,
    type: 'local',
    location: workspaceHandle.name,
    handle: workspaceHandle,
  };
};
