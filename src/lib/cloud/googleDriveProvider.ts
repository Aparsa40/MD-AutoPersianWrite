import type { CloudStorageProvider } from '../../types/cloud';
import type { WorkspaceEntry, WorkspaceProvider } from '../../types/workspaceProvider';
import { registerWorkspaceProvider, unregisterWorkspaceProvider } from '../workspace/providerRegistry';

declare global {
  interface Window {
    google?: {
      accounts?: { oauth2?: { initTokenClient: (options: { client_id: string; scope: string; callback: (response: GoogleTokenResponse) => void; error_callback?: (error: unknown) => void }) => GoogleTokenClient } };
    };
  }
}

interface GoogleTokenResponse { access_token?: string; error?: string; error_description?: string; }
interface GoogleTokenClient { requestAccessToken: (options?: { prompt?: string }) => void; }
interface DriveFile { id: string; name: string; mimeType: string; parents?: string[]; size?: string; modifiedTime?: string; trashed?: boolean; }
interface DriveListResponse { files?: DriveFile[]; nextPageToken?: string; }

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
const GOOGLE_DRIVE_URL = 'https://drive.google.com/';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';
const ROOT_ID = 'root';
const LIST_CACHE_TTL = 10_000;
const WORKSPACE_PROVIDER_ID = 'google-drive';
let scriptPromise: Promise<void> | null = null;
let accessToken: string | null = null;
let workspaceProvider: GoogleDriveWorkspaceProvider | null = null;
const listCache = new Map<string, { expiresAt: number; entries: WorkspaceEntry[] }>();

const clearCache = () => listCache.clear();

const loadGoogleIdentityServices = async () => {
  if (window.google?.accounts?.oauth2) return;
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('بارگذاری Google Identity Services انجام نشد.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL; script.async = true; script.defer = true;
    script.onload = () => resolve(); script.onerror = () => reject(new Error('بارگذاری Google Identity Services انجام نشد.'));
    document.head.appendChild(script);
  });
  await scriptPromise;
};

const authorizeGoogleDrive = async (prompt: string): Promise<string> => {
  const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
  if (!clientId) throw new Error('VITE_GOOGLE_DRIVE_CLIENT_ID تنظیم نشده است.');
  await loadGoogleIdentityServices();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Google Identity Services در مرورگر آماده نشد.');
  return new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => response.error || !response.access_token
        ? reject(new Error(response.error_description || response.error || 'اتصال به Google Drive لغو یا رد شد.'))
        : resolve(response.access_token),
      error_callback: () => reject(new Error('پنجره مجوز Google Drive باز نشد یا بسته شد.')),
    });
    tokenClient.requestAccessToken({ prompt });
  });
};

const expireAuthentication = () => {
  accessToken = null;
  workspaceProvider = null;
  unregisterWorkspaceProvider(WORKSPACE_PROVIDER_ID);
  clearCache();
};

const requireToken = (): string => {
  if (!accessToken) throw new Error('Google Drive متصل نیست یا نشست احراز هویت منقضی شده است. لطفاً دوباره متصل شوید.');
  return accessToken;
};

const refreshAccessToken = async (): Promise<string> => {
  const token = await authorizeGoogleDrive('');
  accessToken = token;
  return token;
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const driveRequest = async <T>(path: string, init: RequestInit = {}, attempt = 0): Promise<T> => {
  const response = await fetch(`${DRIVE_API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${requireToken()}`, ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  });
  if (response.status === 401 && attempt === 0) {
    try {
      await refreshAccessToken();
      return driveRequest<T>(path, init, 1);
    } catch {
      expireAuthentication();
      throw new Error('نشست Google Drive منقضی شده است. لطفاً دوباره متصل شوید.');
    }
  }
  if (response.status === 401) {
    expireAuthentication();
    throw new Error('نشست Google Drive منقضی شده است. لطفاً دوباره متصل شوید.');
  }
  if ((response.status === 429 || response.status >= 500) && attempt < 2) {
    await wait(350 * 2 ** attempt);
    return driveRequest<T>(path, init, attempt + 1);
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive API ${response.status}: ${message || response.statusText}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const uploadRequest = async (path: string, init: RequestInit, attempt = 0): Promise<DriveFile> => {
  const response = await fetch(`${DRIVE_UPLOAD_URL}${path}`, { ...init, headers: { Authorization: `Bearer ${requireToken()}`, ...init.headers } });
  if (response.status === 401 && attempt === 0) {
    try {
      await refreshAccessToken();
      return uploadRequest(path, init, 1);
    } catch {
      expireAuthentication();
      throw new Error('نشست Google Drive منقضی شده است. لطفاً دوباره متصل شوید.');
    }
  }
  if (response.status === 401) {
    expireAuthentication();
    throw new Error('نشست Google Drive منقضی شده است. لطفاً دوباره متصل شوید.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive upload API ${response.status}: ${message || response.statusText}`);
  }
  return response.json() as Promise<DriveFile>;
};

const toEntry = (file: DriveFile): WorkspaceEntry => ({
  id: file.id,
  name: file.name,
  type: file.mimeType === DRIVE_FOLDER_MIME ? 'folder' : 'file',
  parentId: file.parents?.[0] ?? ROOT_ID,
  size: file.size ? Number(file.size) : undefined,
  modifiedAt: file.modifiedTime ? Date.parse(file.modifiedTime) : undefined,
});

class GoogleDriveWorkspaceProvider implements WorkspaceProvider {
  readonly type = 'cloud' as const;

  async list(parentId: string | null = null): Promise<WorkspaceEntry[]> {
    const cacheKey = parentId || ROOT_ID;
    const cached = listCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.entries;

    const all: WorkspaceEntry[] = [];
    let pageToken: string | undefined;
    do {
      const params = new URLSearchParams({ q: `'${parentId || ROOT_ID}' in parents and trashed = false`, pageSize: '1000', fields: 'nextPageToken,files(id,name,mimeType,parents,size,modifiedTime,trashed)' });
      if (pageToken) params.set('pageToken', pageToken);
      const result = await driveRequest<DriveListResponse>(`/files?${params.toString()}`);
      all.push(...(result.files ?? []).map(toEntry));
      pageToken = result.nextPageToken;
    } while (pageToken);

    listCache.set(cacheKey, { expiresAt: Date.now() + LIST_CACHE_TTL, entries: all });
    return all;
  }

  async readFile(id: string): Promise<Uint8Array> {
    const response = await fetch(`${DRIVE_API_URL}/files/${encodeURIComponent(id)}?alt=media`, { headers: { Authorization: `Bearer ${requireToken()}` } });
    if (response.status === 401) {
      try {
        await refreshAccessToken();
        return this.readFile(id);
      } catch {
        expireAuthentication();
        throw new Error('نشست Google Drive منقضی شده است. لطفاً دوباره متصل شوید.');
      }
    }
    if (!response.ok) throw new Error(`Google Drive read failed: ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  async writeFile(id: string, content: Uint8Array): Promise<void> {
    await uploadRequest(`/files/${encodeURIComponent(id)}?uploadType=media`, { method: 'PATCH', body: content, headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
    clearCache();
  }

  async createFile(parentId: string | null, name: string, content?: Uint8Array): Promise<WorkspaceEntry> {
    const metadata = new Blob([JSON.stringify({ name, parents: [parentId || ROOT_ID], mimeType: 'text/markdown' })], { type: 'application/json' });
    const body = new FormData();
    body.append('metadata', metadata);
    body.append('file', new Blob([content ?? new Uint8Array()], { type: 'text/markdown' }), name);
    const created = toEntry(await uploadRequest('/files?uploadType=multipart&fields=id,name,mimeType,parents,size,modifiedTime', { method: 'POST', body }));
    clearCache();
    return created;
  }

  async createFolder(parentId: string | null, name: string): Promise<WorkspaceEntry> {
    const created = toEntry(await driveRequest<DriveFile>('/files', { method: 'POST', body: JSON.stringify({ name, mimeType: DRIVE_FOLDER_MIME, parents: [parentId || ROOT_ID] }) }));
    clearCache();
    return created;
  }

  async copy(id: string, targetParentId: string | null): Promise<WorkspaceEntry> {
    const copied = toEntry(await driveRequest<DriveFile>(`/files/${encodeURIComponent(id)}/copy`, { method: 'POST', body: JSON.stringify({ parents: [targetParentId || ROOT_ID] }) }));
    clearCache();
    return copied;
  }

  async move(id: string, targetParentId: string | null): Promise<WorkspaceEntry> {
    const current = await driveRequest<DriveFile>(`/files/${encodeURIComponent(id)}?fields=id,name,mimeType,parents,size,modifiedTime`);
    const params = new URLSearchParams({ addParents: targetParentId || ROOT_ID, removeParents: (current.parents ?? []).join(','), fields: 'id,name,mimeType,parents,size,modifiedTime' });
    const moved = toEntry(await driveRequest<DriveFile>(`/files/${encodeURIComponent(id)}?${params.toString()}`, { method: 'PATCH' }));
    clearCache();
    return moved;
  }

  async rename(id: string, name: string): Promise<void> {
    await driveRequest(`/files/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ name }) });
    clearCache();
  }

  async delete(id: string): Promise<void> {
    await driveRequest(`/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
    clearCache();
  }
}

export const googleDriveProvider: CloudStorageProvider = {
  definition: { id: 'google-drive', name: 'Google Drive', description: 'اتصال حساب و مدیریت فایل‌های Workspace در Google Drive', available: true, icon: 'google-drive', webUrl: GOOGLE_DRIVE_URL },
  async connect() {
    accessToken = await authorizeGoogleDrive('consent');
    workspaceProvider = new GoogleDriveWorkspaceProvider();
    registerWorkspaceProvider(WORKSPACE_PROVIDER_ID, workspaceProvider);
    clearCache();
  },
  async disconnect() { expireAuthentication(); },
  isConnected() { return accessToken !== null; },
  getWorkspaceProvider() { return workspaceProvider; },
  openWeb() { window.open(GOOGLE_DRIVE_URL, '_blank', 'noopener,noreferrer'); },
};
