import React from 'react';
import type { WorkspaceEntry } from '../../types/workspaceProvider';

interface WorkspaceToolbarProps {
  workspaceName: string;
  currentPath: string[];
  selectedCount: number;
  canPaste: boolean;
  clipboardLabel?: string;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onPaste: () => void;
  onRefresh: () => void;
  onNavigateUp: () => void;
  onClearSelection: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  workspaceName,
  currentPath,
  selectedCount,
  canPaste,
  clipboardLabel,
  onCreateFile,
  onCreateFolder,
  onPaste,
  onRefresh,
  onNavigateUp,
  onClearSelection,
}) => (
  <div className="shrink-0 border-b border-border bg-surface" dir="rtl">
    <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
      <button type="button" onClick={onCreateFile} className="rounded px-2 py-1 text-xs hover:bg-bg" title="فایل جدید">+ فایل</button>
      <button type="button" onClick={onCreateFolder} className="rounded px-2 py-1 text-xs hover:bg-bg" title="پوشه جدید">+ پوشه</button>
      <button type="button" onClick={onPaste} disabled={!canPaste} className="rounded px-2 py-1 text-xs font-semibold hover:bg-bg disabled:cursor-not-allowed disabled:opacity-35" title={clipboardLabel ?? 'Paste'}>P</button>
      <button type="button" onClick={onRefresh} className="mr-auto rounded px-2 py-1 text-xs hover:bg-bg" title="تازه‌سازی">↻</button>
      {selectedCount > 0 && <button type="button" onClick={onClearSelection} className="rounded px-2 py-1 text-xs hover:bg-bg" title="لغو انتخاب">×</button>}
    </div>
    <div className="flex min-w-0 items-center gap-1 px-3 py-2 text-[11px] text-text-muted">
      <span className="shrink-0 font-semibold text-text">{workspaceName}</span>
      {currentPath.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <span aria-hidden="true">/</span>
          <span className="min-w-0 truncate">{part}</span>
        </React.Fragment>
      ))}
      {currentPath.length > 0 && <button type="button" onClick={onNavigateUp} className="mr-auto rounded px-2 py-0.5 hover:bg-bg" title="پوشه والد">↩</button>}
    </div>
    {selectedCount > 0 && <div className="px-3 pb-1.5 text-[10px] text-text-muted">{selectedCount} مورد انتخاب شده</div>}
  </div>
);

export type WorkspaceEntryAction = 'copy' | 'cut' | 'rename' | 'delete' | 'paste';
export type WorkspaceEntryRowProps = {
  entry: WorkspaceEntry;
  selected: boolean;
  showPaste: boolean;
  childCount?: number;
  onOpen: (entry: WorkspaceEntry) => void;
  onSelect: (entry: WorkspaceEntry, event: React.MouseEvent) => void;
  onAction: (entry: WorkspaceEntry, action: WorkspaceEntryAction) => void;
  onDragStart: (entry: WorkspaceEntry, event: React.DragEvent) => void;
  onDragOver: (entry: WorkspaceEntry, event: React.DragEvent) => void;
  onDrop: (entry: WorkspaceEntry, event: React.DragEvent) => void;
};
