export type WorkspaceStorageType = 'local' | 'cloud';

export interface WorkspaceInfo {
  id: string;
  name: string;
  type: WorkspaceStorageType;
  location: string;
  handle?: FileSystemDirectoryHandle;
}
