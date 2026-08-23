import type { CloudProviderDefinition, CloudProviderId, CloudStorageProvider } from '../../types/cloud';
import { googleDriveProvider } from './googleDriveProvider';

const futureProvider = (
  id: CloudProviderId,
  name: string,
  description: string,
  icon: string,
): CloudProviderDefinition => ({ id, name, description, available: false, icon });

export const cloudProviderDefinitions: CloudProviderDefinition[] = [
  googleDriveProvider.definition,
  futureProvider('one-drive', 'OneDrive', 'اتصال به Microsoft OneDrive', '☁️'),
  futureProvider('dropbox', 'Dropbox', 'اتصال به Dropbox', '📦'),
  futureProvider('mega', 'MEGA', 'اتصال به MEGA', '🔐'),
  futureProvider('box', 'Box', 'اتصال به Box', '🗃️'),
];

const providers = new Map<CloudProviderId, CloudStorageProvider>([
  [googleDriveProvider.definition.id, googleDriveProvider],
]);

export const getCloudProvider = (id: CloudProviderId) => providers.get(id);
