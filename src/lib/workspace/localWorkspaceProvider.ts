import type { WorkspaceInfo } from '../../types/workspace';
import type { WorkspaceEntry as ProviderEntry, WorkspaceProvider } from '../../types/workspaceProvider';
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

export class LocalWorkspaceProvider implements WorkspaceProvider {
  readonly type: WorkspaceInfo['type'] = 'local';

  constructor(private readonly root: FileSystemDirectoryHandle) {}

  async list(parentId: string | null = null): Promise<ProviderEntry[]> {
    const entries = await listDirectory(await resolveDirectory(this.root, parentId));
    return entries.map((entry) => ({
      id: entryId(parentId, entry.name),
      name: entry.name,
      type: entry.kind === 'directory' ? 'folder' : 'file',
      parentId,
    }));
  }

  async readFile(id: string): Promise<Uint8Array> {
    const entry = await resolveEntry(this.root, id);
    if (!('getFile' in entry)) throw new Error('The selected workspace entry is not a file.');
    return new Uint8Array(await (await entry.getFile()).arrayBuffer());
  }

  async writeFile(id: string, content: Uint8Array): Promise<void> {
    const entry = await resolveEntry(this.root, id);
    if (!('createWritable' in entry)) throw new Error('The selected workspace entry is not a file.');
    const writable = await entry.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async createFile(parentId: string | null, name: string, content?: Uint8Array): Promise<ProviderEntry> {
    const file = await createFile(await resolveDirectory(this.root, parentId), name);
    if (content) await writeTextFile(file, new TextDecoder().decode(content));
    return { id: entryId(parentId, file.name), name: file.name, type: 'file', parentId };
  }

  async createFolder(parentId: string | null, name: string): Promise<ProviderEntry> {
    const folder = await createFolder(await resolveDirectory(this.root, parentId), name);
    return { id: entryId(parentId, folder.name), name: folder.name, type: 'folder', parentId };
  }

  async copy(id: string, destinationParentId: string | null): Promise<ProviderEntry> {
    const source = await resolveEntry(this.root, id);
    const destination = await resolveDirectory(this.root, destinationParentId);
    await copyEntry(source, destination);
    const name = id.split('/').filter(Boolean).pop();
    if (!name) throw new Error('Invalid local workspace entry path.');
    const copied = await resolveEntry(destination, name);
    return {
      id: entryId(destinationParentId, name),
      name,
      type: 'getFile' in copied ? 'file' : 'folder',
      parentId: destinationParentId,
    };
  }

  async move(id: string, destinationParentId: string | null): Promise<ProviderEntry> {
    const copied = await this.copy(id, destinationParentId);
    const parts = id.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) throw new Error('Invalid local workspace entry path.');
    await deleteEntry(await resolveDirectory(this.root, parts.join('/')), name, true);
    return copied;
  }

  async rename(id: string, name: string): Promise<void> {
    const parts = id.split('/').filter(Boolean);
    const oldName = parts.pop();
    if (!oldName) throw new Error('Invalid local workspace entry path.');
    await renameEntry(await resolveDirectory(this.root, parts.join('/')), oldName, name);
  }

  async delete(id: string): Promise<void> {
    const parts = id.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) throw new Error('Invalid local workspace entry path.');
    await deleteEntry(await resolveDirectory(this.root, parts.join('/')), name, true);
  }
}

export const createLocalWorkspaceProvider = (workspace: WorkspaceInfo): LocalWorkspaceProvider => {
  if (!workspace.handle) throw new Error('Local workspace directory handle is unavailable.');
  return new LocalWorkspaceProvider(workspace.handle);
};
