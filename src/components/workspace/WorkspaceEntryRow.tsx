import React from 'react';
import type { WorkspaceEntry } from '../../types/workspaceProvider';
import type { WorkspaceEntryAction } from './WorkspaceToolbar';

interface WorkspaceEntryRowProps {
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
}

export const WorkspaceEntryRow: React.FC<WorkspaceEntryRowProps> = ({
  entry,
  selected,
  showPaste,
  childCount,
  onOpen,
  onSelect,
  onAction,
  onDragStart,
  onDragOver,
  onDrop,
}) => (
  <div
    data-workspace-entry={entry.id}
    draggable
    onDragStart={(event) => onDragStart(entry, event)}
    onDragOver={(event) => onDragOver(entry, event)}
    onDrop={(event) => onDrop(entry, event)}
    onClick={(event) => onSelect(entry, event)}
    onContextMenu={(event) => {
      event.preventDefault();
      onSelect(entry, event);
    }}
    className={`group relative flex min-h-9 items-center rounded-md border border-transparent px-2 py-1.5 transition ${selected ? 'border-primary/30 bg-primary/10' : 'hover:border-border hover:bg-bg'}`}
  >
    <button type="button" onDoubleClick={() => onOpen(entry)} className="min-w-0 flex-1 truncate text-right text-sm outline-none" title={entry.type === 'folder' ? 'دابل‌کلیک برای ورود به پوشه' : 'دابل‌کلیک برای باز کردن فایل'}>
      <span className="ml-1" aria-hidden="true">{entry.type === 'folder' ? '📁' : '📄'}</span>
      <span>{entry.name}</span>
      {entry.type === 'folder' && typeof childCount === 'number' && childCount > 0 && <span className="mr-1 text-[10px] text-text-muted">({childCount})</span>}
    </button>
    <div className="mr-auto hidden shrink-0 items-center gap-0.5 group-hover:flex group-focus-within:flex" dir="ltr">
      <button type="button" onClick={() => onAction(entry, 'copy')} title="Copy" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">C</button>
      <button type="button" onClick={() => onAction(entry, 'rename')} title="Rename" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">R</button>
      <button type="button" onClick={() => onAction(entry, 'cut')} title="Cut" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">X</button>
      {showPaste && <button type="button" onClick={() => onAction(entry, 'paste')} title="Paste" className="rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-surface">P</button>}
      <button type="button" onClick={() => onAction(entry, 'delete')} title="Delete" aria-label={`حذف ${entry.name}`} className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-700 hover:bg-surface dark:text-red-300">D</button>
    </div>
  </div>
);
