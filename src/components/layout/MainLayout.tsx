import React, { useCallback, useEffect, useState } from 'react';
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

export const MainLayout: React.FC = () => {
  const { editorRef, previewRef } = useScrollSync();
  const { viewMode, orientation, splitRatio, setSplitRatio } = useLayoutStore();
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const updateActiveDraft = useDocumentSessionStore((state) => state.updateActiveDraft);
  const markdown = useEditorStore((state) => state.markdown);
  const fileName = useEditorStore((state) => state.fileName);
  const isDirty = useEditorStore((state) => state.isDirty);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!activeSessionId) return;
    updateActiveDraft({ markdown, fileName, isDirty });
  }, [activeSessionId, fileName, isDirty, markdown, updateActiveDraft]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isResizing) return;
      const ratio =
        orientation === 'horizontal'
          ? (event.clientX / window.innerWidth) * 100
          : (event.clientY / window.innerHeight) * 100;
      setSplitRatio(ratio);
    },
    [isResizing, orientation, setSplitRatio],
  );

  const handleMouseUp = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    if (!isResizing) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const horizontal = orientation === 'horizontal';
  const editorVisible = activeSessionId !== null && (viewMode === 'split' || viewMode === 'editor-only');
  const previewVisible = activeSessionId !== null && (viewMode === 'split' || viewMode === 'preview-only');

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg text-text-main">
      <TopToolbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <WorkspaceExplorer />
        <TableOfContents />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DocumentSessionTabs />
          <div className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${horizontal ? 'flex-row' : 'flex-col'}`}>
            {editorVisible && (
              <section
                className="min-h-0 min-w-0 overflow-hidden"
                style={{
                  width:
                    horizontal && viewMode === 'split'
                      ? `${splitRatio}%`
                      : horizontal
                        ? '100%'
                        : undefined,
                  height:
                    !horizontal && viewMode === 'split'
                      ? `${splitRatio}%`
                      : !horizontal
                        ? '100%'
                        : undefined,
                }}
              >
                <EditorPane editorRef={editorRef} />
              </section>
            )}

            {viewMode === 'split' && activeSessionId !== null && (
              <div
                role="separator"
                aria-orientation={horizontal ? 'vertical' : 'horizontal'}
                aria-label="تغییر اندازه پنل‌ها"
                onMouseDown={() => setIsResizing(true)}
                className={`z-20 shrink-0 bg-border transition-colors hover:bg-primary/50 ${horizontal ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize'}`}
              />
            )}

            {previewVisible && (
              <section
                className="min-h-0 min-w-0 overflow-hidden"
                style={{
                  width:
                    horizontal && viewMode === 'split'
                      ? `${100 - splitRatio}%`
                      : horizontal
                        ? '100%'
                        : undefined,
                  height:
                    !horizontal && viewMode === 'split'
                      ? `${100 - splitRatio}%`
                      : !horizontal
                        ? '100%'
                        : undefined,
                }}
              >
                <PreviewPane previewRef={previewRef} />
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
