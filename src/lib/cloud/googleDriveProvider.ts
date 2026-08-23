import type { CloudStorageProvider } from '../../types/cloud';

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

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GOOGLE_DRIVE_URL = 'https://drive.google.com/';

let scriptPromise: Promise<void> | null = null;
let connected = false;

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

const authorizeGoogleDrive = async () => {
  const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
  if (!clientId) throw new Error('VITE_GOOGLE_DRIVE_CLIENT_ID تنظیم نشده است.');

  await loadGoogleIdentityServices();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Google Identity Services در مرورگر آماده نشد.');

  await new Promise<void>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'اتصال به Google Drive لغو یا رد شد.'));
          return;
        }
        // The token is intentionally not persisted or used for file operations.
        // File management stays inside the official Google Drive environment.
        resolve();
      },
      error_callback: () => reject(new Error('پنجره مجوز Google Drive باز نشد یا بسته شد.')),
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const googleDriveProvider: CloudStorageProvider = {
  definition: {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'اتصال حساب و باز کردن محیط رسمی Google Drive در مرورگر',
    available: true,
    icon: 'google-drive',
    webUrl: GOOGLE_DRIVE_URL,
  },

  async connect() {
    await authorizeGoogleDrive();
    connected = true;
  },

  async disconnect() {
    // This only disconnects Google Drive from this application's cloud list.
    // It does not revoke the user's Google account session or permissions.
    connected = false;
  },

  isConnected() {
    return connected;
  },

  openWeb() {
    window.open(GOOGLE_DRIVE_URL, '_blank', 'noopener,noreferrer');
  },
};
