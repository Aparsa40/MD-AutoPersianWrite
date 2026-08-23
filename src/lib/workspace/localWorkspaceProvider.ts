import type { WorkspaceInfo } from '../../types/workspace';
import type { WorkspaceEntry as ProviderEntry, WorkspaceProvider } from '../../types/workspaceProvider';
import { createFile, createFolder, deleteEntry, listDirectory, renameEntry, writeTextFile } from './localWorkspaceFiles';

const resolveDirectory = async (root: FileSystemDirectoryHandle, path: string | null): Promise<FileSystemDirectoryHandle> => {
  if (!path) return root;
  let directory = root;
  for (const part of path.split('/').filter(Boolean)) directory = await directory.getDirectoryHandle(part);
  return directory;
};

const resolveFile = async (root: FileSystemDirectoryHandle, path: string): Promise<FileSystemFileHandle> => {
  const parts = path.split('/').filter(Boolean);
  const name = parts.pop();
  if (!name) throw new Error('Invalid local workspace file path.');
  return (await resolveDirectory(root, parts.join('/'))).getFileHandle(name);
};

export class LocalWorkspaceProvider implements WorkspaceProvider {
  readonly type: WorkspaceInfo['type'] = 'local';

  constructor(private readonly root: FileSystemDirectoryHandle) {}

  async list(parentId: string | null = null): Promise<ProviderEntry[]> {
    const entries = await listDirectory(await resolveDirectory(this.root, parentId));
    return entries.map((entry) => ({
      id: parentId ? `${parentId}/${entry.name}` : entry.name,
      name: entry.name,
      type: entry.kind === 'directory' ? 'folder' : 'file',
      parentId,
    }));
  }

  async readFile(id: string): Promise<Uint8Array> {
    const file = await resolveFile(this.root, id);
    return new Uint8Array(await (await file.getFile()).arrayBuffer());
  }

  async writeFile(id: string, content: Uint8Array): Promise<void> {
    const writable = await (await resolveFile(this.root, id)).createWritable();
    await writable.write(content);
    await writable.close();
  }

  async createFile(parentId: string | null, name: string, content?: Uint8Array): Promise<ProviderEntry> {
    const file = await createFile(await resolveDirectory(this.root, parentId), name);
    if (content) await writeTextFile(file, new TextDecoder().decode(content));
    return { id: parentId ? `${parentId}/${file.name}` : file.name, name: file.name, type: 'file', parentId };
  }

  async createFolder(parentId: string | null, name: string): Promise<ProviderEntry> {
    const folder = await createFolder(await resolveDirectory(this.root, parentId), name);
    return { id: parentId ? `${parentId}/${folder.name}` : folder.name, name: folder.name, type: 'folder', parentId };
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
