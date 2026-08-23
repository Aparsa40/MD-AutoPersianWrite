export interface WorkspaceFileReference {
  providerId: string;
  workspaceId: string;
  entryId: string;
  parentId: string | null;
  name: string;
}
