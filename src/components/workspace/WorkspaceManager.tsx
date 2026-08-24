import React, { useState } from 'react';
import { WorkspaceExplorer } from './WorkspaceExplorer';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

export const WorkspaceManager: React.FC = () => {
  const isOpen = useWorkspaceStore((state) => state.isPanelOpen);
  const closePanel = useWorkspaceStore((state) => state.closePanel);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const [width, setWidth] = useState(320);
  const [resizing, setResizing] = useState(false);

  if (!isOpen) return null;

  return (
    <aside
      className="relative flex h-full min-h-0 shrink-0 flex-col border-l border-border bg-surface"
      style={{ width }}
      onMouseMove={(event) => {
        if (!resizing) return;
        const next = window.innerWidth - event.clientX;
        setWidth(Math.min(520, Math.max(240, next)));
      }}
      onMouseUp={() => setResizing(false)}
      onMouseLeave={() => setResizing(false)}
    >
      <div className="absolute left-0 top-0 z-30 h-full w-1.5 cursor-col-resize bg-border/50 hover:bg-primary/50" onMouseDown={() => setResizing(true)} aria-label="تغییر اندازه پنل Workspace" />
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-text-muted">WS-manager</div>
          <div className="truncate text-sm font-medium text-text">{activeWorkspace?.name ?? 'Workspace'}</div>
        </div>
        <button type="button" onClick={closePanel} className="rounded px-2 py-1 text-lg leading-none text-text-muted hover:bg-bg hover:text-text" aria-label="بستن پنل Workspace">×</button>
      </div>
      <WorkspaceExplorer />
    </aside>
  );
};
