import type { WorkspaceInfo } from '../../types/workspace';
import type { WorkspaceEntry as ProviderEntry, WorkspaceProvider } from '../../types/workspaceProvider';
import { registerWorkspaceProvider } from './providerRegistry';
import {
  copyEntry,
  createFile,
  createFolder,
  deleteEntry,
  listDirectory,
  renameEntry,
  writeTextFile,
} from './localWorkspaceFiles';

const resolveDirectory = async (root: FileSystemDirectoryHandle, path: string | null): Promise<FileSystemDirectoryHandle> => {
  if (!path) return root;
  let directory = root;
  for (const part of path.split('/').filter(Boolean)) directory = await directory.getDirectoryHandle(part);
  return directory;
};

const resolveEntry = async (root: FileSystemDirectoryHandle, path: string): Promise<FileSystemFileHandle | FileSystemDirectoryHandle> => {
  const parts = path.split('/').filter(Boolean);
  const name = parts.pop();
  if (!name) throw new Error('Invalid local workspace entry path.');
  const parent = await resolveDirectory(root, parts.join('/'));
  try {
    return await parent.getFileHandle(name);
  } catch {
    return parent.getDirectoryHandle(name);
  }
};

const entryId = (parentId: string | null, name: string): string => (parentId ? `${parentId}/${name}` : name);

const workspacePermissionError = (cause: unknown): Error => {
  if (cause instanceof DOMException && (cause.name === 'NotAllowedError' || cause.name === 'SecurityError')) {
    return new Error('مجوز دسترسی به Workspace کافی نیست. Workspace را دوباره از منوی Workspace انتخاب کنید و اجازه Read/Write را بدهید.');
  }
  return cause instanceof Error ? cause : new Error('عملیات روی Workspace انجام نشد.');
};

export class LocalWorkspaceProvider implements WorkspaceProvider {
  readonly type: WorkspaceInfo['type'] = 'local';

  constructor(private readonly root: FileSystemDirectoryHandle) {}

  async list(parentId: string | null = null): Promise<ProviderEntry[]> {
    try {
      const entries = await listDirectory(await resolveDirectory(this.root, parentId));
      return entries.map((entry) => ({ id: entryId(parentId, entry.name), name: entry.name, type: entry.kind === 'directory' ? 'folder' : 'file', parentId }));
    } catch (cause) { throw workspacePermissionError(cause); }
  }

  async readFile(id: string): Promise<Uint8Array> {
    try {
      const entry = await resolveEntry(this.root, id);
      if (!('getFile' in entry)) throw new Error('The selected workspace entry is not a file.');
      return new Uint8Array(await (await entry.getFile()).arrayBuffer());
    } catch (cause) { throw workspacePermissionError(cause); }
  }

  async writeFile(id: string, content: Uint8Array): Promise<void> {
    try {
      const entry = await resolveEntry(this.root, id);
      if (!('createWritable' in entry)) throw new Error('The selected workspace entry is not a file.');
      const writable = await entry.createWritable();
      try { await writable.write(content); } finally { await writable.close(); }
    } catch (cause) { throw workspacePermissionError(cause); }
  }

  async createFile(parentId: string | null, name: string, content?: Uint8Array): Promise<ProviderEntry> {
    try {
      const file = await createFile(await resolveDirectory(this.root, parentId), name);
      if (content) await writeTextFile(file, new TextDecoder().decode(content));
      return { id: entryId(parentId, file.name), name: file.name, type: 'file', parentId };
    } catch (cause) { throw workspacePermissionError(cause); }
  }

  async createFolder(parentId: string | null, name: string): Promise<ProviderEntry> {
    try {
      const folder = await createFolder(await resolveDirectory(this.root, parentId), name);
      return { id: entryId(parentId, folder.name), name: folder.name, type: 'folder', parentId };
    } catch (cause) { throw workspacePermissionError(cause); }
  }

  async copy(id: string, destinationParentId: string | null): Promise<ProviderEntry> {
    try {
      const source = await resolveEntry(this.root, id);
      const destination = await resolveDirectory(this.root, destinationParentId);
      await copyEntry(source, destination);
      const name = id.split('/').filter(Boolean).pop();
      if (!name) throw new Error('Invalid local workspace entry path.');
      const copied = await resolveEntry(destination, name);
      return { id: entryId(destinationParentId, name), name, type: 'getFile' in copied ? 'file' : 'folder', parentId: destinationParentId };
    } catch (cause) { throw workspacePermissionError(cause); }
  }

  async move(id: string, destinationParentId: string | null): Promise<ProviderEntry> {
    const copied = await this.copy(id, destinationParentId);
    const parts = id.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) throw new Error('Invalid local workspace entry path.');
    try {
      await deleteEntry(await resolveDirectory(this.root, parts.join('/')), name, true);
      return copied;
    } catch (cause) {
      try {
        const copiedParts = copied.id.split('/').filter(Boolean);
        const copiedName = copiedParts.pop();
        if (copiedName) await deleteEntry(await resolveDirectory(this.root, copiedParts.join('/')), copiedName, true);
      } catch { /* preserve the original failure */ }
      throw workspacePermissionError(cause);
    }
  }

  async rename(id: string, name: string): Promise<void> {
    try {
      const parts = id.split('/').filter(Boolean);
      const oldName = parts.pop();
      if (!oldName) throw new Error('Invalid local workspace entry path.');
      await renameEntry(await resolveDirectory(this.root, parts.join('/')), oldName, name);
    } catch (cause) { throw workspacePermissionError(cause); }
  }

  async delete(id: string): Promise<void> {
    try {
      const parts = id.split('/').filter(Boolean);
      const name = parts.pop();
      if (!name) throw new Error('Invalid local workspace entry path.');
      await deleteEntry(await resolveDirectory(this.root, parts.join('/')), name, true);
    } catch (cause) { throw workspacePermissionError(cause); }
  }
}

export const createLocalWorkspaceProvider = (workspace: WorkspaceInfo): LocalWorkspaceProvider => {
  if (!workspace.handle) throw new Error('Local workspace directory handle is unavailable.');
  const provider = new LocalWorkspaceProvider(workspace.handle);
  registerWorkspaceProvider('local', provider);
  return provider;
};
