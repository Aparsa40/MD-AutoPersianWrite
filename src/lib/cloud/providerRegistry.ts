import type { CloudProviderDefinition, CloudProviderId, CloudStorageProvider } from '../../types/cloud';
import { googleDriveProvider } from './googleDriveProvider';

const futureProvider = (
  id: CloudProviderId,
  name: string,
  description: string,
  icon: string,
  webUrl: string,
): CloudProviderDefinition => ({ id, name, description, available: false, icon, webUrl });

export const cloudProviderDefinitions: CloudProviderDefinition[] = [
  googleDriveProvider.definition,
  futureProvider('one-drive', 'OneDrive', 'اتصال به Microsoft OneDrive', '☁️', 'https://onedrive.live.com/'),
  futureProvider('dropbox', 'Dropbox', 'اتصال به Dropbox', '📦', 'https://www.dropbox.com/home'),
  futureProvider('mega', 'MEGA', 'اتصال به MEGA', '🔐', 'https://mega.nz/'),
  futureProvider('box', 'Box', 'اتصال به Box', '🗃️', 'https://app.box.com/'),
];

const providers = new Map<CloudProviderId, CloudStorageProvider>([
  [googleDriveProvider.definition.id, googleDriveProvider],
]);

export const getCloudProvider = (id: CloudProviderId) => providers.get(id);
