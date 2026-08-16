import type { WorkspaceInfo } from '../../types/workspace';

const DB_NAME = 'md-autopersianwrite-workspaces';
const STORE_NAME = 'workspaces';
const DB_VERSION = 1;

type StoredWorkspace = Omit<WorkspaceInfo, 'handle'> & { handle: FileSystemDirectoryHandle };

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('باز کردن پایگاه Workspaceها انجام نشد.'));
  });

export const registerLocalWorkspace = async (workspace: WorkspaceInfo): Promise<void> => {
  if (!workspace.handle) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(workspace as StoredWorkspace);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('ثبت Workspace انجام نشد.'));
  });
  db.close();
};

export const listLocalWorkspaces = async (): Promise<WorkspaceInfo[]> => {
  const db = await openDb();
  const result = await new Promise<StoredWorkspace[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as StoredWorkspace[]);
    request.onerror = () => reject(request.error ?? new Error('خواندن Workspaceها انجام نشد.'));
  });
  db.close();
  return result.map((workspace) => ({ ...workspace, handle: workspace.handle }));
};

export const removeLocalWorkspace = async (id: string): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('حذف Workspace از فهرست انجام نشد.'));
  });
  db.close();
};
