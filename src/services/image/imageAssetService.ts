import { createFolder } from '../../lib/workspace/localWorkspaceFiles';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

const sanitizeFileName = (name: string): string =>
  name
    .trim()
    .replace(/[^\w.-]/g, '-')
    .toLowerCase();

export const saveImageToWorkspace = async (
  file: File,
): Promise<string> => {
  const workspace = useWorkspaceStore.getState().activeWorkspace;

  if (!workspace?.handle) {
    throw new Error('ابتدا یک Workspace محلی باز کنید.');
  }

  const assetsFolder = await createFolder(
    workspace.handle,
    'assets',
  );

  const fileName = sanitizeFileName(file.name);

  const imageHandle = await assetsFolder.getFileHandle(
    fileName,
    { create: true },
  );

  const writable = await imageHandle.createWritable();

  await writable.write(
    await file.arrayBuffer(),
  );

  await writable.close();

  return fileName;
};