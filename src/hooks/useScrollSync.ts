import { useEffect, useRef } from 'react';

type ScrollElement = Pick<HTMLElement, 'scrollTop' | 'scrollHeight' | 'clientHeight'>;

export const getScrollRatio = (element: ScrollElement): number =>
  element.scrollTop / Math.max(element.scrollHeight - element.clientHeight, 1);

export const getScrollTopForRatio = (element: ScrollElement, ratio: number): number =>
  ratio * Math.max(element.scrollHeight - element.clientHeight, 0);

export function useScrollSync() {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    let source: 'editor' | 'preview' | null = null;
    let resetTimer: number | undefined;

    const releaseSource = () => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        source = null;
      }, 80);
    };

    const syncEditorToPreview = () => {
      if (source === 'preview') return;
      source = 'editor';
      const ratio = getScrollRatio(editor);
      preview.scrollTop = getScrollTopForRatio(preview, ratio);
      releaseSource();
    };

    const syncPreviewToEditor = () => {
      if (source === 'editor') return;
      source = 'preview';
      const ratio = getScrollRatio(preview);
      editor.scrollTop = getScrollTopForRatio(editor, ratio);
      releaseSource();
    };

    const syncCursorToPreview = () => {
      const beforeCursor = editor.value.slice(0, editor.selectionStart);
      const currentLine = beforeCursor.split('\n').length - 1;
      const totalLines = Math.max(editor.value.split('\n').length - 1, 1);
      const ratio = currentLine / totalLines;
      preview.scrollTop = getScrollTopForRatio(preview, ratio);
    };

    editor.addEventListener('scroll', syncEditorToPreview, { passive: true });
    preview.addEventListener('scroll', syncPreviewToEditor, { passive: true });
    editor.addEventListener('click', syncCursorToPreview);
    editor.addEventListener('keyup', syncCursorToPreview);
    editor.addEventListener('select', syncCursorToPreview);

    return () => {
      editor.removeEventListener('scroll', syncEditorToPreview);
      preview.removeEventListener('scroll', syncPreviewToEditor);
      editor.removeEventListener('click', syncCursorToPreview);
      editor.removeEventListener('keyup', syncCursorToPreview);
      editor.removeEventListener('select', syncCursorToPreview);
      window.clearTimeout(resetTimer);
    };
  }, []);

  return { editorRef, previewRef };
}
