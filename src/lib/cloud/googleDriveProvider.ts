import type { CloudStorageProvider } from '../../types/cloud';
import type { WorkspaceEntry, WorkspaceProvider } from '../../types/workspaceProvider';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: unknown) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: string;
  modifiedTime?: string;
  trashed?: boolean;
}

interface DriveListResponse {
  files?: DriveFile[];
  nextPageToken?: string;
}

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GOOGLE_DRIVE_URL = 'https://drive.google.com/';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';
const ROOT_ID = 'root';

let scriptPromise: Promise<void> | null = null;
let accessToken: string | null = null;

const loadGoogleIdentityServices = async () => {
  if (window.google?.accounts?.oauth2) return;
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_URL}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('بارگذاری Google Identity Services انجام نشد.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('بارگذاری Google Identity Services انجام نشد.'));
      document.head.appendChild(script);
    });
  }
  await scriptPromise;
};

const authorizeGoogleDrive = async (): Promise<string> => {
  const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
  if (!clientId) throw new Error('VITE_GOOGLE_DRIVE_CLIENT_ID تنظیم نشده است.');

  await loadGoogleIdentityServices();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Google Identity Services در مرورگر آماده نشد.');

  return new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'اتصال به Google Drive لغو یا رد شد.'));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: () => reject(new Error('پنجره مجوز Google Drive باز نشد یا بسته شد.')),
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const requireToken = (): string => {
  if (!accessToken) throw new Error('Google Drive متصل نیست.');
  return accessToken;
};

const driveRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${DRIVE_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireToken()}`,
      ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive API ${response.status}: ${message || response.statusText}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const uploadRequest = async (path: string, init: RequestInit): Promise<DriveFile> => {
  const response = await fetch(`${DRIVE_UPLOAD_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${requireToken()}`, ...init.headers },
  });
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
    const parent = parentId || ROOT_ID;
    const query = encodeURIComponent(`'${parent}' in parents and trashed = false`);
    const result = await driveRequest<DriveListResponse>(`/files?q=${query}&pageSize=1000&fields=files(id,name,mimeType,parents,size,modifiedTime,trashed)`);
    return (result.files ?? []).map(toEntry);
  }

  async readFile(id: string): Promise<Uint8Array> {
    const response = await fetch(`${DRIVE_API_URL}/files/${encodeURIComponent(id)}?alt=media`, {
      headers: { Authorization: `Bearer ${requireToken()}` },
    });
    if (!response.ok) throw new Error(`Google Drive read failed: ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  async writeFile(id: string, content: Uint8Array): Promise<void> {
    await uploadRequest(`/files/${encodeURIComponent(id)}?uploadType=media`, {
      method: 'PATCH',
      body: content,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
  }

  async createFile(parentId: string | null, name: string, content?: Uint8Array): Promise<WorkspaceEntry> {
    const parent = parentId || ROOT_ID;
    const metadata = new Blob([JSON.stringify({ name, parents: [parent], mimeType: 'text/markdown' })], { type: 'application/json' });
    const body = new FormData();
    body.append('metadata', metadata);
    body.append('file', new Blob([content ?? new Uint8Array()], { type: 'text/markdown' }), name);
    return toEntry(await uploadRequest('/files?uploadType=multipart&fields=id,name,mimeType,parents,size,modifiedTime', { method: 'POST', body }));
  }

  async createFolder(parentId: string | null, name: string): Promise<WorkspaceEntry> {
    return toEntry(await driveRequest<DriveFile>('/files', {
      method: 'POST',
      body: JSON.stringify({ name, mimeType: DRIVE_FOLDER_MIME, parents: [parentId || ROOT_ID] }),
    }));
  }

  async copy(id: string, targetParentId: string | null): Promise<WorkspaceEntry> {
    return toEntry(await driveRequest<DriveFile>(`/files/${encodeURIComponent(id)}/copy`, {
      method: 'POST',
      body: JSON.stringify({ parents: [targetParentId || ROOT_ID] }),
    }));
  }

  async move(id: string, targetParentId: string | null): Promise<void> {
    const current = await driveRequest<DriveFile>(`/files/${encodeURIComponent(id)}?fields=id,parents`);
    const oldParents = (current.parents ?? []).join(',');
    const params = new URLSearchParams({
      addParents: targetParentId || ROOT_ID,
      removeParents: oldParents,
      fields: 'id',
    });
    await driveRequest<DriveFile>(`/files/${encodeURIComponent(id)}?${params.toString()}`, { method: 'PATCH' });
  }

  async rename(id: string, name: string): Promise<void> {
    await driveRequest(`/files/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ name }) });
  }

  async delete(id: string): Promise<void> {
    await driveRequest(`/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}

let workspaceProvider: GoogleDriveWorkspaceProvider | null = null;

export const googleDriveProvider: CloudStorageProvider = {
  definition: {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'اتصال حساب و مدیریت فایل‌های Workspace در Google Drive',
    available: true,
    icon: 'google-drive',
    webUrl: GOOGLE_DRIVE_URL,
  },
  async connect() {
    accessToken = await authorizeGoogleDrive();
    workspaceProvider = new GoogleDriveWorkspaceProvider();
  },
  async disconnect() {
    accessToken = null;
    workspaceProvider = null;
  },
  isConnected() {
    return accessToken !== null;
  },
  getWorkspaceProvider() {
    return workspaceProvider;
  },
  openWeb() {
    window.open(GOOGLE_DRIVE_URL, '_blank', 'noopener,noreferrer');
  },
};
