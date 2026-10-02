import { useWorkspaceStore } from '../../store/useWorkspaceStore';

const videoUrlCache = new Map<string, string>();

export const resolveWorkspaceVideo = async (
  src: string,
): Promise<string | null> => {
  if (!src.startsWith('assets/')) {
    return src;
  }

  const cached = videoUrlCache.get(src);

  if (cached) {
    return cached;
  }

  const workspace = useWorkspaceStore.getState().activeWorkspace;

  if (!workspace?.handle) {
    return null;
  }

  const fileName = src.replace(/^assets\//, '');

  try {
    const assetsHandle =
      await workspace.handle.getDirectoryHandle('assets');

    const fileHandle =
      await assetsHandle.getFileHandle(fileName);

    const file = await fileHandle.getFile();

    const url = URL.createObjectURL(file);

    videoUrlCache.set(src, url);

    return url;
  } catch {
    return null;
  }
};