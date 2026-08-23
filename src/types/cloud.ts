export type CloudProviderId =
  | 'google-drive'
  | 'one-drive'
  | 'dropbox'
  | 'mega'
  | 'box';

export type CloudProviderStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface CloudProviderDefinition {
  id: CloudProviderId;
  name: string;
  description: string;
  available: boolean;
  icon: string;
  webUrl: string;
}

export interface CloudConnection {
  providerId: CloudProviderId;
  status: CloudProviderStatus;
  connectedAt?: number;
  error?: string;
}

export interface CloudStorageProvider {
  readonly definition: CloudProviderDefinition;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  openWeb(): void;
}
