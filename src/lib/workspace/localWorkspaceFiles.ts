export type WorkspaceEntry = {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
};

export type WorkspaceClipboard = {
  kind: 'copy' | 'cut';
  name: string;
  entry: FileSystemFileHandle | FileSystemDirectoryHandle;
  sourceParent: FileSystemDirectoryHandle;
};

export const listDirectory = async (directory: FileSystemDirectoryHandle): Promise<WorkspaceEntry[]> => {
  const entries: WorkspaceEntry[] = [];
  for await (const [name, handle] of directory.entries()) entries.push({ name, kind: handle.kind, handle });
  return entries.sort((a, b) => Number(b.kind === 'directory') - Number(a.kind === 'directory') || a.name.localeCompare(b.name));
};

export const createFolder = (parent: FileSystemDirectoryHandle, name: string) => parent.getDirectoryHandle(name.trim(), { create: true });

export const createFile = async (parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemFileHandle> => {
  const handle = await parent.getFileHandle(name.trim(), { create: true });
  const writable = await handle.createWritable();
  await writable.write('');
  await writable.close();
  return handle;
};

export const readTextFile = async (handle: FileSystemFileHandle): Promise<string> => (await handle.getFile()).text();

export const writeTextFile = async (handle: FileSystemFileHandle, content: string): Promise<void> => {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
};

export const deleteEntry = (parent: FileSystemDirectoryHandle, name: string, recursive = true) => parent.removeEntry(name, { recursive });

export const copyEntry = async (
  source: FileSystemFileHandle | FileSystemDirectoryHandle,
  targetParent: FileSystemDirectoryHandle,
  targetName = source.name,
): Promise<void> => {
  if (source.kind === 'file') {
    const target = await targetParent.getFileHandle(targetName, { create: true });
    const writable = await target.createWritable();
    await writable.write(await (await source.getFile()).arrayBuffer());
    await writable.close();
    return;
  }
  const target = await targetParent.getDirectoryHandle(targetName, { create: true });
  for await (const [name, child] of source.entries()) await copyEntry(child, target, name);
};

export const renameEntry = async (parent: FileSystemDirectoryHandle, oldName: string, newName: string): Promise<void> => {
  const source = await parent.getFileHandle(oldName).catch(() => parent.getDirectoryHandle(oldName));
  await copyEntry(source, parent, newName.trim());
  await deleteEntry(parent, oldName, true);
};
