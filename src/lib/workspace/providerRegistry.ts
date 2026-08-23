import type { WorkspaceProvider } from '../../types/workspaceProvider';

const providers = new Map<string, WorkspaceProvider>();

export const registerWorkspaceProvider = (id: string, provider: WorkspaceProvider): void => {
  providers.set(id, provider);
};

export const getWorkspaceProvider = (id: string): WorkspaceProvider | undefined => providers.get(id);

export const listWorkspaceProviders = (): Array<[string, WorkspaceProvider]> => [...providers.entries()];

export const unregisterWorkspaceProvider = (id: string): void => {
  providers.delete(id);
};
