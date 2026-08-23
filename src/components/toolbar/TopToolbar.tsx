import React, { useRef } from 'react';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';

export const TopToolbar: React.FC = () => {
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      createSession({
        fileName: file.name,
        markdown: content,
        isDirty: false,
        workspaceFile: null,
        isWorkspaceFile: false,
        isNewWorkspaceFile: false,
      });
      event.target.value = '';
    };
    reader.onerror = () => window.alert('خواندن فایل انجام نشد.');
    reader.readAsText(file);
  };

  return <input ref={fileInputRef} type="file" hidden onChange={handleOpenFile} />;
};
