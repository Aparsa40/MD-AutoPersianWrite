import { useWorkspaceStore } from '../../store/useWorkspaceStore';

const imageUrlCache = new Map<string, string>();

export const resolveWorkspaceImage = async (
  src: string,
): Promise<string | null> => {
  if (!src.startsWith('assets/')) {
    return src;
  }

  const cached = imageUrlCache.get(src);

  if (cached) {
    return cached;
  }

  const workspace = useWorkspaceStore.getState().activeWorkspace;

  if (!workspace?.handle) {
    return null;
  }

  const fileName = src.replace(/^assets\//, '');

  try {
    const assetsHandle = await workspace.handle.getDirectoryHandle('assets');

    const fileHandle = await assetsHandle.getFileHandle(fileName);

    const file = await fileHandle.getFile();

    const url = URL.createObjectURL(file);

    imageUrlCache.set(src, url);

    return url;
  } catch {
    return null;
  }
};