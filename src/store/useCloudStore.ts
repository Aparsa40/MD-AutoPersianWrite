import { create } from 'zustand';
import type { CloudConnection, CloudProviderId } from '../types/cloud';
import { getCloudProvider } from '../lib/cloud/providerRegistry';

interface CloudState {
  connections: Record<string, CloudConnection>;
  activeProviderId: CloudProviderId | null;
  connect: (providerId: CloudProviderId) => Promise<void>;
  disconnect: (providerId: CloudProviderId) => Promise<void>;
  openProvider: (providerId: CloudProviderId) => void;
  setActiveProvider: (providerId: CloudProviderId | null) => void;
}

const STORAGE_KEY = 'md-autopersianwrite-cloud-connections';
const ACTIVE_PROVIDER_KEY = 'md-autopersianwrite-active-cloud-provider';

const readStoredConnections = (): Record<string, CloudConnection> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CloudConnection>;
    return Object.fromEntries(Object.entries(parsed).map(([id, connection]): [string, CloudConnection] => {
      const provider = getCloudProvider(connection.providerId);
      const authenticated = provider?.isConnected() ?? false;
      return [id, { providerId: connection.providerId, status: authenticated ? 'connected' : 'disconnected', connectedAt: connection.connectedAt, ...(connection.error ? { error: connection.error } : {}) }];
    }));
  } catch { return {}; }
};

const readActiveProvider = (): CloudProviderId | null => {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(ACTIVE_PROVIDER_KEY);
  return value ? (value as CloudProviderId) : null;
};

const persistConnections = (connections: Record<string, CloudConnection>) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
};

export const useCloudStore = create<CloudState>((set) => ({
  connections: readStoredConnections(),
  activeProviderId: readActiveProvider(),

  connect: async (providerId) => {
    const provider = getCloudProvider(providerId);
    if (!provider) throw new Error('این فضای ابری هنوز در برنامه فعال نشده است.');
    set((state) => ({ connections: { ...state.connections, [providerId]: { providerId, status: 'connecting' } } }));
    try {
      await provider.connect();
      set((state) => {
        const connection: CloudConnection = { providerId, status: 'connected', connectedAt: Date.now() };
        const connections = { ...state.connections, [providerId]: connection };
        persistConnections(connections);
        window.localStorage.setItem(ACTIVE_PROVIDER_KEY, providerId);
        return { connections, activeProviderId: providerId };
      });
    } catch (error) {
      set((state) => ({ connections: { ...state.connections, [providerId]: { providerId, status: 'error', error: error instanceof Error ? error.message : 'اتصال ناموفق بود.' } } }));
      throw error;
    }
  },

  disconnect: async (providerId) => {
    const provider = getCloudProvider(providerId);
    if (!provider) return;
    await provider.disconnect();
    set((state) => {
      const connections = { ...state.connections };
      delete connections[providerId];
      persistConnections(connections);
      const nextActive = state.activeProviderId === providerId ? null : state.activeProviderId;
      if (nextActive) window.localStorage.setItem(ACTIVE_PROVIDER_KEY, nextActive);
      else window.localStorage.removeItem(ACTIVE_PROVIDER_KEY);
      return { connections, activeProviderId: nextActive };
    });
  },

  openProvider: (providerId) => getCloudProvider(providerId)?.openWeb(),

  setActiveProvider: (providerId) => {
    set({ activeProviderId: providerId });
    if (typeof window !== 'undefined') {
      if (providerId) window.localStorage.setItem(ACTIVE_PROVIDER_KEY, providerId);
      else window.localStorage.removeItem(ACTIVE_PROVIDER_KEY);
    }
  },
}));
