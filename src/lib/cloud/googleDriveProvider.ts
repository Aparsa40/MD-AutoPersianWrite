import type { CloudFileEntry, CloudStorageProvider } from '../../types/cloud';

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
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';

let scriptPromise: Promise<void> | null = null;
let accessToken: string | null = null;
let expiresAt = 0;

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

const requestToken = async (prompt: '' | 'consent' = '') => {
  const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID as string | undefined;
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
        accessToken = response.access_token;
        expiresAt = Date.now() + Math.max((response.expires_in ?? 3600) - 60, 60) * 1000;
        resolve(response.access_token);
      },
      error_callback: () => reject(new Error('پنجره مجوز Google Drive باز نشد یا بسته شد.')),
    });
    tokenClient.requestAccessToken({ prompt });
  });
};

const getToken = async () => {
  if (accessToken && Date.now() < expiresAt) return accessToken;
  return requestToken('');
};

const driveRequest = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(input, { ...init, headers });
  if (response.status !== 401) return response;

  accessToken = null;
  expiresAt = 0;
  const retryToken = await requestToken('');
  headers.set('Authorization', `Bearer ${retryToken}`);
  return fetch(input, { ...init, headers });
};

const ensureOk = async (response: Response) => {
  if (response.ok) return;
  let message = `Google Drive API error (${response.status}).`;
  try {
    const body = await response.json() as { error?: { message?: string } };
    message = body.error?.message || message;
  } catch {
    // Keep the fallback message when the response is not JSON.
  }
  throw new Error(message);
};

const toEntry = (file: {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime?: string;
}): CloudFileEntry => ({
  id: file.id,
  name: file.name,
  mimeType: file.mimeType,
  parentId: file.parents?.[0],
  modifiedTime: file.modifiedTime,
  isFolder: file.mimeType === 'application/vnd.google-apps.folder',
});

const createTextFile = async (name: string, content: string, parentId?: string) => {
  const metadata = {
    name,
    mimeType: 'text/markdown',
    ...(parentId ? { parents: [parentId] } : {}),
  };
  const boundary = `md-autopersianwrite-${crypto.randomUUID()}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: text/markdown; charset=UTF-8',
    '',
    content,
    `--${boundary}--`,
    '',
  ].join('\r\n');

  const response = await driveRequest(`${UPLOAD_API}?uploadType=multipart&fields=id,name,mimeType,parents,modifiedTime`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  await ensureOk(response);
  return toEntry(await response.json());
};

export const googleDriveProvider: CloudStorageProvider = {
  definition: {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'اتصال مستقیم به Google Drive بدون ورود اطلاعات حساب داخل برنامه',
    available: true,
    icon: 'google-drive',
  },

  async connect() {
    await requestToken('consent');
  },

  async disconnect() {
    if (accessToken && window.google?.accounts?.oauth2?.revoke) {
      await new Promise<void>((resolve) => window.google?.accounts?.oauth2?.revoke?.(accessToken as string, resolve));
    }
    accessToken = null;
    expiresAt = 0;
  },

  isConnected() {
    return Boolean(accessToken && Date.now() < expiresAt);
  },

  async listFiles(parentId) {
    const q = parentId ? `'${parentId}' in parents and trashed = false` : 'trashed = false';
    const params = new URLSearchParams({
      q,
      pageSize: '100',
      orderBy: 'folder,name',
      fields: 'files(id,name,mimeType,parents,modifiedTime)',
    });
    const response = await driveRequest(`${DRIVE_API}/files?${params.toString()}`);
    await ensureOk(response);
    const data = await response.json() as { files?: Array<{ id: string; name: string; mimeType: string; parents?: string[]; modifiedTime?: string }> };
    return (data.files ?? []).map(toEntry);
  },

  async readFile(fileId) {
    const response = await driveRequest(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`);
    await ensureOk(response);
    return response.text();
  },

  async createFile(name, content, parentId) {
    return createTextFile(name, content, parentId);
  },

  async updateFile(fileId, content) {
    const response = await driveRequest(`${UPLOAD_API}/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,mimeType,parents,modifiedTime`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'text/markdown; charset=UTF-8' },
      body: content,
    });
    await ensureOk(response);
    return toEntry(await response.json());
  },

  async renameFile(fileId, name) {
    const response = await driveRequest(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,parents,modifiedTime`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    await ensureOk(response);
    return toEntry(await response.json());
  },

  async deleteFile(fileId) {
    const response = await driveRequest(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' });
    await ensureOk(response);
  },

  async createFolder(name, parentId) {
    const response = await driveRequest(`${DRIVE_API}/files?fields=id,name,mimeType,parents,modifiedTime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId ? { parents: [parentId] } : {}),
      }),
    });
    await ensureOk(response);
    return toEntry(await response.json());
  },
};
