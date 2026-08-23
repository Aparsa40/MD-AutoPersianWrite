import type { WorkspaceInfo } from './workspace';

export type WorkspaceEntryType = 'file' | 'folder';

export interface WorkspaceEntry {
  id: string;
  name: string;
  type: WorkspaceEntryType;
  parentId: string | null;
  size?: number;
  modifiedAt?: number;
}

export interface WorkspaceProvider {
  readonly type: WorkspaceInfo['type'];
  list(parentId?: string | null): Promise<WorkspaceEntry[]>;
  readFile(id: string): Promise<Uint8Array>;
  writeFile(id: string, content: Uint8Array): Promise<void>;
  createFile(parentId: string | null, name: string, content?: Uint8Array): Promise<WorkspaceEntry>;
  createFolder(parentId: string | null, name: string): Promise<WorkspaceEntry>;
  copy(id: string, targetParentId: string | null): Promise<WorkspaceEntry>;
  move(id: string, targetParentId: string | null): Promise<WorkspaceEntry>;
  rename(id: string, name: string): Promise<void>;
  delete(id: string): Promise<void>;
}
