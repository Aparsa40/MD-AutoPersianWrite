import React, { useEffect, useRef } from 'react';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { useEditorStore } from '../../store/useEditorStore';

export const MainLayout: React.FC = () => {
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const activeSessionId = useDocumentSessionStore((state) => state.activeSessionId);
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const updateActiveDraft = useDocumentSessionStore((state) => state.updateActiveDraft);
  const fileName = useEditorStore((state) => state.fileName);
  const markdown = useEditorStore((state) => state.markdown);
  const isDirty = useEditorStore((state) => state.isDirty);
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
    createSession({
      fileName: 'untitled.md',
      markdown: '',
      isDirty: false,
      workspaceFile: null,
      isWorkspaceFile: false,
      isNewWorkspaceFile: false,
    });
  }, [activeSessionId, createSession, fileName, isDirty, markdown, sessions]);

  return null;
};
