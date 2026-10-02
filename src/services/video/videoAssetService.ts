import { createFolder } from '../../lib/workspace/localWorkspaceFiles';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

const sanitizeFileName = (name: string): string =>
  name
    .trim()
    .replace(/[^\w.-]/g, '-')
    .toLowerCase();

const isMp4File = (file: File): boolean => {
  const fileName = file.name.toLowerCase();

  return (
    fileName.endsWith('.mp4') &&
    (!file.type || file.type === 'video/mp4')
  );
};

export const saveVideoToWorkspace = async (
  file: File,
): Promise<string> => {
  if (!isMp4File(file)) {
    throw new Error('فقط فایل‌های ویدئویی MP4 قابل درج هستند.');
  }

  const workspace = useWorkspaceStore.getState().activeWorkspace;

  if (!workspace?.handle) {
    throw new Error('ابتدا یک Workspace محلی باز کنید.');
  }

  const assetsFolder = await createFolder(
    workspace.handle,
    'assets',
  );

  const fileName = sanitizeFileName(file.name);

  const videoHandle = await assetsFolder.getFileHandle(
    fileName,
    { create: true },
  );

  const writable = await videoHandle.createWritable();

  await writable.write(
    await file.arrayBuffer(),
  );

  await writable.close();

  return fileName;
};