import React, { useCallback, useEffect, useState } from 'react';
import { WorkspaceExplorer } from './WorkspaceExplorer';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

export const WorkspaceManager: React.FC = () => {
  const isOpen = useWorkspaceStore((state) => state.isPanelOpen);
  const closePanel = useWorkspaceStore((state) => state.closePanel);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const [width, setWidth] = useState(340);
  const [resizing, setResizing] = useState(false);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!resizing) return;
    const next = window.innerWidth - event.clientX;
    setWidth(Math.min(560, Math.max(260, next)));
  }, [resizing]);

  useEffect(() => {
    if (!resizing) return;
    window.addEventListener('mousemove', handleMouseMove);
    const stop = () => setResizing(false);
    window.addEventListener('mouseup', stop);
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stop);
      document.body.style.userSelect = '';
    };
  }, [resizing, handleMouseMove]);

  if (!isOpen) return null;

  return (
    <aside
      className="relative flex h-full min-h-0 shrink-0 flex-col border-l border-border bg-surface"
      style={{ width }}
      aria-label="Workspace Manager"
    >
      <button
        type="button"
        onMouseDown={() => setResizing(true)}
        className="absolute left-0 top-0 z-40 h-full w-1.5 cursor-col-resize bg-border/50 transition-colors hover:bg-primary/60"
        aria-label="تغییر اندازه پنل Workspace"
        title="برای تغییر اندازه بکشید"
      />

      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="min-w-0 text-right" dir="rtl">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">WS-manager</div>
          <div className="truncate text-sm font-medium text-text">{activeWorkspace?.name ?? 'Workspace'}</div>
        </div>
        <button
          type="button"
          onClick={closePanel}
          className="rounded px-2 py-1 text-lg leading-none text-text-muted hover:bg-bg hover:text-text"
          aria-label="بستن پنل Workspace"
          title="بستن Workspace Manager"
        >
          ×
        </button>
      </div>

      <WorkspaceExplorer />
    </aside>
  );
};
