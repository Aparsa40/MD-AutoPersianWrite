import React from 'react';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { EditorPane } from './components/editor/EditorPane';
import { PreviewPane } from './components/preview/PreviewPane';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <TopToolbar />
      <main className="flex flex-1 overflow-hidden">
        <EditorPane />
        <PreviewPane />
      </main>
    </div>
  );
};

export default App;
