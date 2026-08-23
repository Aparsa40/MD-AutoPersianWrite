import type { WorkspaceInfo } from '../../types/workspace';
import type { WorkspaceEntry as ProviderEntry, WorkspaceProvider } from '../../types/workspaceProvider';
import {
  createFile,
  createFolder,
  deleteEntry,
  listDirectory,
  readTextFile,
  renameEntry,
  writeTextFile,
} from './localWorkspaceFiles';

const asDirectory = (value: FileSystemDirectoryHandle | undefined): FileSystemDirectoryHandle => {
  if (!value) throw new Error('Local workspace directory is not available.');
  return value;
};

const asFile = async (directory: FileSystemDirectoryHandle, id: string): Promise<FileSystemFileHandle> => {
  const file = await directory.getFileHandle(id).catch(() => null);
  if (!file) throw new Error(`File not found: ${id}`);
  return file;
};

export class LocalWorkspaceProvider implements WorkspaceProvider {
  readonly type: WorkspaceInfo['type'] = 'local';

  constructor(private readonly root: FileSystemDirectoryHandle) {}

  async list(parentId: string | null = null): Promise<ProviderEntry[]> {
    const directory = parentId ? await this.root.getDirectoryHandle(parentId) : this.root;
    const entries = await listDirectory(directory);
    return entries.map((entry) => ({
      id: entry.name,
      name: entry.name,
      type: entry.kind === 'directory' ? 'folder' : 'file',
      parentId,
    }));
  }

  async readFile(id: string): Promise<Uint8Array> {
    const file = await asFile(asDirectory(this.root), id);
    return new Uint8Array(await (await file.getFile()).arrayBuffer());
  }

  async writeFile(id: string, content: Uint8Array): Promise<void> {
    const file = await asFile(asDirectory(this.root), id);
    const text = new TextDecoder().decode(content);
    await writeTextFile(file, text);
  }

  async createFile(parentId: string | null, name: string, content?: Uint8Array): Promise<ProviderEntry> {
    const parent = parentId ? await this.root.getDirectoryHandle(parentId) : this.root;
    const file = await createFile(parent, name);
    if (content) await writeTextFile(file, new TextDecoder().decode(content));
    return { id: file.name, name: file.name, type: 'file', parentId };
  }

  async createFolder(parentId: string | null, name: string): Promise<ProviderEntry> {
    const parent = parentId ? await this.root.getDirectoryHandle(parentId) : this.root;
    const folder = await createFolder(parent, name);
    return { id: folder.name, name: folder.name, type: 'folder', parentId };
  }

  async rename(id: string, name: string): Promise<void> {
    await renameEntry(this.root, id, name);
  }

  async delete(id: string): Promise<void> {
    await deleteEntry(this.root, id, true);
  }
}
