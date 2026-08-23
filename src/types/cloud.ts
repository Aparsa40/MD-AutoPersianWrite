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
  listFiles?(parentId?: string): Promise<CloudFileEntry[]>;
  readFile?(fileId: string): Promise<string>;
  createFile?(name: string, content: string, parentId?: string): Promise<CloudFileEntry>;
  updateFile?(fileId: string, content: string): Promise<CloudFileEntry>;
  renameFile?(fileId: string, name: string): Promise<CloudFileEntry>;
  deleteFile?(fileId: string): Promise<void>;
  createFolder?(name: string, parentId?: string): Promise<CloudFileEntry>;
}

export interface CloudFileEntry {
  id: string;
  name: string;
  mimeType: string;
  parentId?: string;
  modifiedTime?: string;
  isFolder: boolean;
}
