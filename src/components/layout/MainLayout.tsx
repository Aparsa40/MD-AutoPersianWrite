import React from 'react';
import { TopToolbar } from '../toolbar/TopToolbar';
import { EditorPane } from '../editor/EditorPane';
import { PreviewPane } from '../preview/PreviewPane';
import { useScrollSync } from '../../hooks/useScrollSync';

export const MainLayout: React.FC = () => {
  const { editorRef, previewRef } = useScrollSync();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg text-text-main">
      <TopToolbar />
      <main className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        <EditorPane editorRef={editorRef} />
        <PreviewPane previewRef={previewRef} />
      </main>
    </div>
  );
};
