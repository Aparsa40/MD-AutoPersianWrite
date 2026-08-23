import type { CloudStorageProvider } from '../../types/cloud';

const GOOGLE_DRIVE_URL = 'https://drive.google.com/';

const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

let connected = false;

export const googleDriveProvider: CloudStorageProvider = {
  definition: {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'باز کردن محیط رسمی Google Drive در مرورگر',
    available: true,
    icon: 'google-drive',
    webUrl: GOOGLE_DRIVE_URL,
  },

  async connect() {
    // Cloud authentication remains entirely inside the provider's official website.
    // The application does not collect, store, or manage Google credentials.
    connected = true;
  },

  async disconnect() {
    // Disconnect only removes the provider from this application's active cloud list.
    // It does not revoke the user's Google account session or permissions.
    connected = false;
  },

  isConnected() {
    return connected;
  },

  openWeb() {
    openExternal(GOOGLE_DRIVE_URL);
  },
};
