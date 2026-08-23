import { create } from 'zustand';
import type { CloudConnection, CloudProviderId } from '../types/cloud';
import { getCloudProvider } from '../lib/cloud/providerRegistry';

interface CloudState {
  connections: Record<string, CloudConnection>;
  activeProviderId: CloudProviderId | null;
  connect: (providerId: CloudProviderId) => Promise<void>;
  disconnect: (providerId: CloudProviderId) => Promise<void>;
  setActiveProvider: (providerId: CloudProviderId | null) => void;
}

const STORAGE_KEY = 'md-autopersianwrite-cloud-connections';

const readStoredConnections = (): Record<string, CloudConnection> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CloudConnection>;
    return Object.fromEntries(
      Object.entries(parsed).map(([id, connection]) => [id, { ...connection, status: 'disconnected' }]),
    );
  } catch {
    return {};
  }
};

const persistConnections = (connections: Record<string, CloudConnection>) => {
  if (typeof window === 'undefined') return;
  const safeConnections = Object.fromEntries(
    Object.entries(connections).map(([id, connection]) => [id, {
      providerId: connection.providerId,
      status: 'disconnected',
      connectedAt: connection.connectedAt,
    }]),
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeConnections));
};

export const useCloudStore = create<CloudState>((set, get) => ({
  connections: readStoredConnections(),
  activeProviderId: null,

  connect: async (providerId) => {
    const provider = getCloudProvider(providerId);
    if (!provider) throw new Error('این فضای ابری هنوز در برنامه فعال نشده است.');

    set((state) => ({
      connections: {
        ...state.connections,
        [providerId]: { providerId, status: 'connecting' },
      },
    }));

    try {
      await provider.connect();
      set((state) => {
        const connections = {
          ...state.connections,
          [providerId]: { providerId, status: 'connected', connectedAt: Date.now() },
        };
        persistConnections(connections);
        return { connections, activeProviderId: providerId };
      });
    } catch (error) {
      set((state) => ({
        connections: {
          ...state.connections,
          [providerId]: {
            providerId,
            status: 'error',
            error: error instanceof Error ? error.message : 'اتصال ناموفق بود.',
          },
        },
      }));
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
      return {
        connections,
        activeProviderId: state.activeProviderId === providerId ? null : state.activeProviderId,
      };
    });
  },

  setActiveProvider: (providerId) => set({ activeProviderId: providerId }),
}));
