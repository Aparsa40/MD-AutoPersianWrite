import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TopToolbar } from '../toolbar/TopToolbar';
import { EditorPane } from '../editor/EditorPane';
import { PreviewPane } from '../preview/PreviewPane';
import { TableOfContents } from '../toc/TableOfContents';
import { WorkspaceExplorer } from '../workspace/WorkspaceExplorer';
import { DocumentSessionTabs } from '../document/DocumentSessionTabs';
import { useScrollSync } from '../../hooks/useScrollSync';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useWorkspacePanelStore } from '../../store/useWorkspacePanelStore';

export const MainLayout: React.FC = () => {
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const { editorRef, previewRef } = useScrollSync(activeSessionId);
  const { viewMode, orientation, splitRatio, setSplitRatio } = useLayoutStore();
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const updateActiveDraft = useDocumentSessionStore((state) => state.updateActiveDraft);
  const fileName = useEditorStore((state) => state.fileName);
  const markdown = useEditorStore((state) => state.markdown);
  const isDirty = useEditorStore((state) => state.isDirty);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspacePanelOpen = useWorkspacePanelStore((state) => state.isOpen);
  const workspacePanelWidth = useWorkspacePanelStore((state) => state.width);
  const openWorkspacePanel = useWorkspacePanelStore((state) => state.open);
  const closeWorkspacePanel = useWorkspacePanelStore((state) => state.close);
  const setWorkspacePanelWidth = useWorkspacePanelStore((state) => state.setWidth);
  const [isResizingWorkspace, setIsResizingWorkspace] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const handledResetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeSessionId) return;
    updateActiveDraft({ markdown, fileName, isDirty });
  }, [activeSessionId, fileName, isDirty, markdown, updateActiveDraft]);

  useEffect(() => {
    const resetSignature = `${fileName}\u0000${markdown}\u0000${isDirty}`;
    if (fileName !== 'untitled.md' || markdown !== '' || isDirty || handledResetRef.current === resetSignature) return;
    handledResetRef.current = resetSignature;
    const active = sessions.find((session) => session.id === activeSessionId);
    if (active && active.fileName === 'untitled.md' && active.markdown === '' && !active.isWorkspaceFile) return;
    createSession({ fileName: 'untitled.md', markdown: '', isDirty: false, workspaceFile: null, isWorkspaceFile: false, isNewWorkspaceFile: false });
  }, [activeSessionId, createSession, fileName, isDirty, markdown, sessions]);

  useEffect(() => {
    const hasDirtySession = sessions.some((session) => session.isDirty) || isDirty;
    const baseTitle = 'MD-AutoPersianWrite';
    document.title = hasDirtySession ? `● ${fileName || 'سند'} — ${baseTitle}` : baseTitle;
    return () => { document.title = baseTitle; };
  }, [fileName, isDirty, sessions]);

  useEffect(() => {
    if (activeWorkspace) openWorkspacePanel();
    else closeWorkspacePanel();
  }, [activeWorkspace, closeWorkspacePanel, openWorkspacePanel]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing) return;
    const ratio = orientation === 'horizontal' ? (event.clientX / window.innerWidth) * 100 : (event.clientY / window.innerHeight) * 100;
    setSplitRatio(ratio);
  }, [isResizing, orientation, setSplitRatio]);

  const handleWorkspaceMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizingWorkspace) return;
    setWorkspacePanelWidth(window.innerWidth - event.clientX);
  }, [isResizingWorkspace, setWorkspacePanelWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsResizingWorkspace(false);
  }, []);

  useEffect(() => {
    if (!isResizing && !isResizingWorkspace) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleWorkspaceMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleWorkspaceMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing, isResizingWorkspace, handleMouseMove, handleWorkspaceMouseMove, handleMouseUp]);

  const horizontal = orientation === 'horizontal';
  const editorVisible = activeSessionId !== null && (viewMode === 'split' || viewMode === 'editor-only');
  const previewVisible = activeSessionId !== null && (viewMode === 'split' || viewMode === 'preview-only');

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg text-text-main">
      <TopToolbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {activeWorkspace && workspacePanelOpen && (
          <aside className="relative flex h-full shrink-0 flex-col border-l border-border bg-surface" style={{ width: `${workspacePanelWidth}px` }} aria-label="Workspace Explorer">
            <div role="separator" aria-orientation="vertical" aria-label="تغییر اندازه پنل Workspace" onMouseDown={() => setIsResizingWorkspace(true)} className="absolute inset-y-0 left-0 z-30 w-1.5 cursor-col-resize bg-border transition-colors hover:bg-primary/50" />
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
              <span className="truncate text-sm font-medium">{activeWorkspace.name}</span>
              <button type="button" onClick={closeWorkspacePanel} className="rounded px-2 py-1 text-sm text-text-muted hover:bg-bg hover:text-text" aria-label="بستن پنل Workspace" title="بستن پنل Workspace">×</button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto"><WorkspaceExplorer /></div>
          </aside>
        )}
        <TableOfContents />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DocumentSessionTabs />
          <div className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${horizontal ? 'flex-row' : 'flex-col'}`}>
            {editorVisible && <section key={`editor-${activeSessionId}`} className="min-h-0 min-w-0 overflow-hidden" style={{ width: horizontal && viewMode === 'split' ? `${splitRatio}%` : horizontal ? '100%' : undefined, height: !horizontal && viewMode === 'split' ? `${splitRatio}%` : !horizontal ? '100%' : undefined }}><EditorPane editorRef={editorRef} /></section>}
            {viewMode === 'split' && activeSessionId !== null && <div role="separator" aria-orientation={horizontal ? 'vertical' : 'horizontal'} aria-label="تغییر اندازه پنل‌ها" onMouseDown={() => setIsResizing(true)} className={`z-20 shrink-0 bg-border transition-colors hover:bg-primary/50 ${horizontal ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize'}`} />}
            {previewVisible && <section key={`preview-${activeSessionId}`} className="min-h-0 min-w-0 overflow-hidden" style={{ width: horizontal && viewMode === 'split' ? `${100 - splitRatio}%` : horizontal ? '100%' : undefined, height: !horizontal && viewMode === 'split' ? `${100 - splitRatio}%` : !horizontal ? '100%' : undefined }}><PreviewPane previewRef={previewRef} /></section>}
          </div>
        </main>
      </div>
    </div>
  );
};
