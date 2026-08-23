export const WORKSPACE_OPERATIONS = [
  'open',
  'createFile',
  'createFolder',
  'save',
  'saveAs',
  'copy',
  'cut',
  'paste',
  'rename',
  'delete',
] as const;

export type WorkspaceOperation = (typeof WORKSPACE_OPERATIONS)[number];

export type WorkspaceEntryKind = 'file' | 'folder' | 'root';

export interface WorkspaceOperationContext {
  operation: WorkspaceOperation;
  target: WorkspaceEntryKind;
  hasSelection: boolean;
  hasClipboard: boolean;
}

export interface WorkspaceCapabilityMatrix {
  readonly operations: readonly WorkspaceOperation[];
  canExecute(context: WorkspaceOperationContext): boolean;
}

const fileOrFolder = (target: WorkspaceEntryKind): boolean => target === 'file' || target === 'folder';

export const localWorkspaceCapabilities: WorkspaceCapabilityMatrix = {
  operations: WORKSPACE_OPERATIONS,
  canExecute: ({ operation, target, hasSelection, hasClipboard }) => {
    switch (operation) {
      case 'createFile':
      case 'createFolder':
        return true;
      case 'open':
      case 'save':
      case 'saveAs':
      case 'rename':
      case 'delete':
      case 'copy':
      case 'cut':
        return hasSelection && fileOrFolder(target);
      case 'paste':
        return hasClipboard && (target === 'folder' || target === 'root');
      default:
        return false;
    }
  },
};

export const cloudWorkspaceCapabilities: WorkspaceCapabilityMatrix = localWorkspaceCapabilities;
